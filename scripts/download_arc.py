#!/usr/bin/env python3
"""
Download generated image assets listed in Supabase into an archive folder.

Usage:
  python3 scripts/download_arc.py
  python3 scripts/download_arc.py --output /arc
  python3 scripts/download_arc.py --user-id user_123 --overwrite

The script reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
.env.local by default. It queries the images table, downloads every URL, and
writes a manifest.json alongside the downloaded files.
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import re
import sys
import time
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ENV_PATH = ROOT / ".env.local"
DEFAULT_OUTPUT_DIR = ROOT / "arc"
PAGE_SIZE = 1000


def load_env_file(path: Path) -> dict[str, str]:
    if not path.exists():
        raise FileNotFoundError(f"Env file not found: {path}")

    values: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()

        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]

        values[key] = value

    return values


def env_value(env_file_values: dict[str, str], key: str) -> str:
    value = os.environ.get(key) or env_file_values.get(key)
    if not value:
        raise RuntimeError(f"Missing {key} in environment or {DEFAULT_ENV_PATH.name}")
    return value


def supabase_request(
    supabase_url: str,
    service_role_key: str,
    table: str,
    query: dict[str, str],
) -> list[dict[str, Any]]:
    base = supabase_url.rstrip("/")
    url = f"{base}/rest/v1/{table}?{urlencode(query)}"
    request = Request(
        url,
        headers={
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Accept": "application/json",
        },
    )

    with urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_all_images(
    supabase_url: str,
    service_role_key: str,
    user_id: str | None,
    only_originals: bool,
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    offset = 0

    while True:
        query = {
            "select": "id,url,created_at,is_upscaled,user_id,imageprompt",
            "order": "created_at.asc",
            "limit": str(PAGE_SIZE),
            "offset": str(offset),
            "url": "not.is.null",
        }

        if user_id:
            query["user_id"] = f"eq.{user_id}"
        if only_originals:
            query["is_upscaled"] = "eq.false"

        page = supabase_request(supabase_url, service_role_key, "images", query)
        rows.extend(page)

        if len(page) < PAGE_SIZE:
            break
        offset += PAGE_SIZE

    return rows


def safe_part(value: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-zA-Z0-9._-]+", "-", value)).strip("-")


def extension_from_url(url: str) -> str:
    suffix = Path(urlparse(url).path).suffix.lower()
    if re.fullmatch(r"\.[a-z0-9]{1,8}", suffix):
        return suffix
    return ".webp"


def extension_from_content_type(content_type: str | None) -> str | None:
    if not content_type:
        return None

    mime_type = content_type.split(";", 1)[0].strip().lower()
    if mime_type == "image/jpeg":
        return ".jpg"
    return mimetypes.guess_extension(mime_type)


def filename_for(row: dict[str, Any], index: int, content_type: str | None = None) -> str:
    created_at = str(row.get("created_at") or "unknown-date")
    date_part = safe_part(created_at[:19].replace("T", "_").replace(":", "-"))
    image_id = safe_part(str(row.get("id") or f"image-{index + 1}"))
    image_type = "upscaled" if row.get("is_upscaled") else "generated"
    ext = extension_from_content_type(content_type) or extension_from_url(str(row["url"]))

    return f"{index + 1:05d}_{date_part}_{image_type}_{image_id}{ext}"


def download_file(url: str, destination: Path, overwrite: bool) -> tuple[str, int, bool]:
    if destination.exists() and not overwrite:
        return "", destination.stat().st_size, True

    request = Request(url, headers={"User-Agent": "rotpunkt-arc-downloader/1.0"})

    with urlopen(request, timeout=90) as response:
        content_type = response.headers.get("content-type")
        temp_destination = destination.with_suffix(f"{destination.suffix}.download")

        total = 0
        with temp_destination.open("wb") as output:
            while True:
                chunk = response.read(1024 * 256)
                if not chunk:
                    break
                output.write(chunk)
                total += len(chunk)

        temp_destination.replace(destination)
        return content_type or "", total, False


def write_manifest(path: Path, manifest: list[dict[str, Any]]) -> None:
    path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Download generated images from Supabase.")
    parser.add_argument("--env-file", type=Path, default=DEFAULT_ENV_PATH)
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Destination folder. Relative paths are resolved from the repo root. Default: arc",
    )
    parser.add_argument("--user-id", help="Limit downloads to one Clerk user_id.")
    parser.add_argument(
        "--only-originals",
        action="store_true",
        help="Skip rows marked is_upscaled=true.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Redownload files that already exist.",
    )
    return parser.parse_args()


def prepare_output_dir(path: Path) -> Path:
    output_dir = path.expanduser()
    if not output_dir.is_absolute():
        output_dir = (ROOT / output_dir).resolve()

    try:
        output_dir.mkdir(parents=True, exist_ok=True)
    except OSError as error:
        if output_dir == Path("/arc"):
            raise SystemExit(
                "Cannot create /arc because the filesystem root is read-only. "
                "Run `python3 scripts/download_arc.py` or "
                "`python3 scripts/download_arc.py --output arc` to write to the repo-local arc/ folder."
            ) from error

        raise SystemExit(f"Cannot create output directory {output_dir}: {error}") from error

    return output_dir


def main() -> int:
    args = parse_args()
    env_file_values = load_env_file(args.env_file)
    supabase_url = env_value(env_file_values, "NEXT_PUBLIC_SUPABASE_URL")
    service_role_key = env_value(env_file_values, "SUPABASE_SERVICE_ROLE_KEY")

    output_dir = prepare_output_dir(args.output)

    print("Fetching image rows from Supabase...")
    rows = fetch_all_images(
        supabase_url=supabase_url,
        service_role_key=service_role_key,
        user_id=args.user_id,
        only_originals=args.only_originals,
    )
    print(f"Found {len(rows)} image rows.")

    manifest: list[dict[str, Any]] = []
    downloaded = 0
    skipped = 0
    failed = 0

    for index, row in enumerate(rows):
        url = row.get("url")
        if not isinstance(url, str) or not url:
            failed += 1
            manifest.append({**row, "status": "error", "error": "Missing URL"})
            continue

        filename = filename_for(row, index)
        destination = output_dir / filename

        try:
            content_type, size, was_skipped = download_file(url, destination, args.overwrite)
            if content_type:
                filename_with_type = filename_for(row, index, content_type)
                typed_destination = output_dir / filename_with_type
                if typed_destination != destination:
                    if typed_destination.exists() and not args.overwrite:
                        destination.unlink(missing_ok=True)
                        destination = typed_destination
                    else:
                        destination.replace(typed_destination)
                        destination = typed_destination
                    filename = filename_with_type

            if was_skipped:
                skipped += 1
                status = "skipped"
            else:
                downloaded += 1
                status = "ok"

            print(f"[{index + 1}/{len(rows)}] {status:7} {filename} ({size / 1024:.0f} KB)")
            manifest.append({
                **row,
                "filename": filename,
                "path": str(destination),
                "status": status,
                "bytes": size,
            })
        except (HTTPError, URLError, TimeoutError, OSError) as error:
            failed += 1
            print(f"[{index + 1}/{len(rows)}] error   {filename}: {error}", file=sys.stderr)
            manifest.append({
                **row,
                "filename": filename,
                "path": str(destination),
                "status": "error",
                "error": str(error),
            })

        time.sleep(0.05)

    manifest_path = output_dir / "manifest.json"
    write_manifest(manifest_path, manifest)

    print(
        f"Done. Downloaded: {downloaded}, skipped: {skipped}, failed: {failed}. "
        f"Manifest: {manifest_path}"
    )
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
