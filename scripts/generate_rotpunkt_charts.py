#!/usr/bin/env python3
"""
Generate SVG charts and an HTML gallery for Rotpunkt image-generation reports.

Expected input files in /tmp (or a custom directory via --report-dir):
  - rotpunkt-images-<stamp>.csv
  - rotpunkt-images-monthly-summary-<stamp>.csv
  - rotpunkt-user-image-counts-<stamp>.csv

Example:
  python3 scripts/generate_rotpunkt_charts.py --stamp 2026-07-09
"""

from __future__ import annotations

import argparse
import csv
import html
import math
from collections import defaultdict
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path

BG = "#f5f0e8"
PAPER = "#fffaf4"
INK = "#201815"
MUTED = "#6c5f59"
GRID = "#ddd0c6"
LINE = "#c9bbb0"
ACCENT = "#c63b32"
ACCENT_DARK = "#7a2e29"
ACCENT_ORANGE = "#e48b43"
ACCENT_TAN = "#d7c6b5"
ACCENT_WASH = "#f1e4d5"
SUCCESS = "#8d6243"


@dataclass
class MonthlyRow:
    month: str
    total: int
    original: int
    upscaled: int
    distinct_users: int
    new_users: int
    returning_users: int
    images_per_active_user: float


@dataclass
class UserRow:
    user_id: str
    image_count: int
    original_count: int
    upscaled_count: int
    first_image_at: str
    last_image_at: str


@dataclass
class ImageRow:
    created_at: datetime
    is_upscaled: bool
    user_id: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--stamp",
        help="Report stamp in YYYY-MM-DD format. Defaults to the latest export found.",
    )
    parser.add_argument(
        "--report-dir",
        default="/tmp",
        help="Directory that contains the CSV exports. Defaults to /tmp.",
    )
    parser.add_argument(
        "--out-dir",
        default="/tmp",
        help="Directory to write SVG/HTML outputs. Defaults to /tmp.",
    )
    return parser.parse_args()


def infer_latest_stamp(report_dir: Path) -> str:
    candidates = sorted(report_dir.glob("rotpunkt-images-[0-9][0-9][0-9][0-9]-*.csv"))
    if not candidates:
        raise FileNotFoundError(f"No rotpunkt image exports found in {report_dir}")

    stamps = []
    for path in candidates:
        prefix = "rotpunkt-images-"
        suffix = ".csv"
        name = path.name
        if not (name.startswith(prefix) and name.endswith(suffix)):
            continue
        middle = name[len(prefix) : -len(suffix)]
        if middle.count("-") == 2 and len(middle) == 10:
            stamps.append(middle)

    if not stamps:
        raise FileNotFoundError(f"Could not infer a report stamp from files in {report_dir}")

    return sorted(stamps)[-1]


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def month_label(month_key: str) -> str:
    return datetime.strptime(month_key, "%Y-%m").strftime("%b '%y")


def stamp_label(stamp: str) -> str:
    parsed = datetime.strptime(stamp, "%Y-%m-%d")
    return f"{parsed.strftime('%B')} {parsed.day}, {parsed.year}"


def parse_iso(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def esc(value: object) -> str:
    return html.escape(str(value))


def fmt_int(value: int) -> str:
    return f"{value:,}"


def fmt_pct(value: float) -> str:
    return f"{value:.1f}%"


def nice_max(value: int, step: int) -> int:
    return max(step, math.ceil(value / step) * step)


def start_svg(title: str, subtitle: str, width: int = 1480, height: int = 920) -> list[str]:
    return [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" fill="none">\n',
        "<style>\n"
        f"  text {{ font-family: Raleway, Arial, sans-serif; }}\n"
        f"  .title {{ font-size: 36px; font-weight: 700; fill: {INK}; }}\n"
        f"  .subtitle {{ font-size: 17px; font-weight: 500; fill: {MUTED}; }}\n"
        f"  .section {{ font-size: 22px; font-weight: 700; fill: {INK}; }}\n"
        f"  .label {{ font-size: 14px; font-weight: 600; fill: {MUTED}; }}\n"
        f"  .axis {{ font-size: 13px; font-weight: 600; fill: {MUTED}; }}\n"
        f"  .value {{ font-size: 13px; font-weight: 700; fill: {INK}; }}\n"
        f"  .small {{ font-size: 12px; font-weight: 500; fill: {MUTED}; }}\n"
        f"  .kpi-label {{ font-size: 13px; font-weight: 600; fill: {MUTED}; }}\n"
        f"  .kpi-value {{ font-size: 28px; font-weight: 800; fill: {INK}; }}\n"
        "</style>\n",
        f'<rect width="{width}" height="{height}" fill="{BG}"/>\n',
        f'<circle cx="{width - 110}" cy="110" r="170" fill="#efe2d6"/>\n',
        f'<circle cx="120" cy="{height - 90}" r="180" fill="#efe6dc"/>\n',
        f'<rect x="44" y="44" width="{width - 88}" height="{height - 88}" rx="28" fill="{PAPER}" stroke="{LINE}"/>\n',
        f'<text x="88" y="112" class="title">{esc(title)}</text>\n',
        f'<text x="88" y="142" class="subtitle">{esc(subtitle)}</text>\n',
    ]


def finish_svg(parts: list[str], path: Path) -> None:
    parts.append("</svg>\n")
    path.write_text("".join(parts), encoding="utf-8")


def rect(
    x: float,
    y: float,
    w: float,
    h: float,
    fill: str,
    rx: float = 16,
    stroke: str | None = None,
    stroke_width: int = 1,
    opacity: float | None = None,
) -> str:
    extra = ""
    if stroke:
        extra += f' stroke="{stroke}" stroke-width="{stroke_width}"'
    if opacity is not None:
        extra += f' opacity="{opacity}"'
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"{extra}/>\n'


def line(
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    stroke: str,
    stroke_width: int = 1,
    dash: str | None = None,
    opacity: float | None = None,
) -> str:
    extra = ""
    if dash:
        extra += f' stroke-dasharray="{dash}"'
    if opacity is not None:
        extra += f' opacity="{opacity}"'
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{stroke_width}"{extra}/>\n'


def text(
    x: float,
    y: float,
    content: object,
    klass: str = "label",
    anchor: str = "start",
    fill: str | None = None,
) -> str:
    extra = f' text-anchor="{anchor}"'
    if fill:
        extra += f' fill="{fill}"'
    return f'<text x="{x}" y="{y}" class="{klass}"{extra}>{esc(content)}</text>\n'


def polyline(
    points: list[tuple[float, float]],
    stroke: str,
    stroke_width: float = 3,
    fill: str = "none",
    opacity: float | None = None,
    dash: str | None = None,
) -> str:
    pts = " ".join(f"{x:.2f},{y:.2f}" for x, y in points)
    extra = ""
    if opacity is not None:
        extra += f' opacity="{opacity}"'
    if dash:
        extra += f' stroke-dasharray="{dash}"'
    return (
        f'<polyline points="{pts}" fill="{fill}" stroke="{stroke}" stroke-width="{stroke_width}" '
        f'stroke-linecap="round" stroke-linejoin="round"{extra}/>\n'
    )


def path(
    d: str,
    fill: str = "none",
    stroke: str = "none",
    stroke_width: int = 0,
    opacity: float | None = None,
    dash: str | None = None,
) -> str:
    extra = ""
    if opacity is not None:
        extra += f' opacity="{opacity}"'
    if dash:
        extra += f' stroke-dasharray="{dash}"'
    return (
        f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{stroke_width}" '
        f'stroke-linecap="round" stroke-linejoin="round"{extra}/>\n'
    )


def circle(cx: float, cy: float, r: float, fill: str, stroke: str | None = None, stroke_width: int = 0) -> str:
    extra = ""
    if stroke:
        extra += f' stroke="{stroke}" stroke-width="{stroke_width}"'
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"{extra}/>\n'


def card(parts: list[str], x: int, y: int, w: int, h: int, label: str, value: str, accent: str) -> None:
    parts.append(rect(x, y, w, h, "#fff", rx=18, stroke=LINE))
    parts.append(rect(x, y, 8, h, accent, rx=8))
    parts.append(text(x + 22, y + 34, label, "kpi-label"))
    parts.append(
        f'<text x="{x + 22}" y="{y + 72}" class="kpi-value">{esc(value)}</text>\n'
    )


def arc_point(cx: float, cy: float, r: float, angle_deg: float) -> tuple[float, float]:
    angle = math.radians(angle_deg - 90)
    return cx + r * math.cos(angle), cy + r * math.sin(angle)


def donut_segment(
    cx: float,
    cy: float,
    outer_r: float,
    inner_r: float,
    start_angle: float,
    end_angle: float,
    fill: str,
) -> str:
    x1, y1 = arc_point(cx, cy, outer_r, start_angle)
    x2, y2 = arc_point(cx, cy, outer_r, end_angle)
    ix1, iy1 = arc_point(cx, cy, inner_r, end_angle)
    ix2, iy2 = arc_point(cx, cy, inner_r, start_angle)
    large = 1 if end_angle - start_angle > 180 else 0
    d = (
        f"M {x1:.2f} {y1:.2f} "
        f"A {outer_r} {outer_r} 0 {large} 1 {x2:.2f} {y2:.2f} "
        f"L {ix1:.2f} {iy1:.2f} "
        f"A {inner_r} {inner_r} 0 {large} 0 {ix2:.2f} {iy2:.2f} Z"
    )
    return path(d, fill=fill)


def load_inputs(report_dir: Path, stamp: str) -> tuple[list[MonthlyRow], list[UserRow], list[ImageRow]]:
    monthly_path = report_dir / f"rotpunkt-images-monthly-summary-{stamp}.csv"
    user_path = report_dir / f"rotpunkt-user-image-counts-{stamp}.csv"
    raw_path = report_dir / f"rotpunkt-images-{stamp}.csv"

    monthly = [
        MonthlyRow(
            month=row["month"],
            total=int(row["total_images"]),
            original=int(row["original_images"]),
            upscaled=int(row["upscaled_images"]),
            distinct_users=int(row["distinct_users"]),
            new_users=int(row.get("new_users") or 0),
            returning_users=int(row.get("returning_users") or 0),
            images_per_active_user=float(row.get("images_per_active_user") or 0),
        )
        for row in read_csv(monthly_path)
    ]
    monthly.sort(key=lambda item: item.month)

    users = [
        UserRow(
            user_id=row["user_id"],
            image_count=int(row["image_count"]),
            original_count=int(row["original_count"]),
            upscaled_count=int(row["upscaled_count"]),
            first_image_at=row["first_image_at"],
            last_image_at=row["last_image_at"],
        )
        for row in read_csv(user_path)
    ]
    users.sort(key=lambda item: (-item.image_count, item.user_id))

    images = [
        ImageRow(
            created_at=parse_iso(row["created_at"]),
            is_upscaled=row["is_upscaled"].lower() == "true",
            user_id=row["user_id"],
        )
        for row in read_csv(raw_path)
    ]
    images.sort(key=lambda item: item.created_at)

    return monthly, users, images


def write_overview_chart(
    out_path: Path,
    monthly: list[MonthlyRow],
    users: list[UserRow],
    total_images: int,
    total_originals: int,
    total_upscales: int,
    snapshot_label: str,
) -> None:
    parts = []
    width, height = 1600, 1180
    parts.append(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}" fill="none">\n'
    )
    parts.append(
        "<style>\n"
        f"  .title {{ font: 700 42px Georgia, 'Times New Roman', serif; fill: {INK}; }}\n"
        f"  .subtitle {{ font: 400 18px Georgia, 'Times New Roman', serif; fill: {MUTED}; }}\n"
        f"  .section {{ font: 700 24px Georgia, 'Times New Roman', serif; fill: {INK}; }}\n"
        f"  .body {{ font: 500 15px Arial, sans-serif; fill: {MUTED}; }}\n"
        f"  .axis {{ font: 500 13px Arial, sans-serif; fill: {MUTED}; }}\n"
        f"  .value {{ font: 700 13px Arial, sans-serif; fill: {INK}; }}\n"
        f"  .small {{ font: 500 12px Arial, sans-serif; fill: {MUTED}; }}\n"
        "</style>\n"
    )
    parts.append(f'<rect width="{width}" height="{height}" fill="{BG}"/>\n')
    parts.append('<circle cx="1380" cy="120" r="220" fill="#eadfd3"/>\n')
    parts.append('<circle cx="240" cy="1040" r="260" fill="#efe5da"/>\n')
    parts.append(
        f'<rect x="60" y="60" width="1480" height="1060" rx="28" fill="{PAPER}" stroke="{LINE}"/>\n'
    )
    parts.append('<text x="110" y="138" class="title">Rotpunkt Visions Image Generation Overview</text>\n')
    parts.append(
        f'<text x="110" y="172" class="subtitle">Live Supabase snapshot pulled on {esc(snapshot_label)}</text>\n'
    )

    chip_y = 210
    chip_w = 250
    chip_h = 88
    chip_gap = 26
    chips = [
        ("Total images", str(total_images), ACCENT),
        ("Originals", str(total_originals), ACCENT_ORANGE),
        ("Upscales", str(total_upscales), "#9a5c2f"),
        ("Distinct users", str(len(users)), ACCENT_DARK),
    ]
    for index, (label, value, color) in enumerate(chips):
        x = 110 + index * (chip_w + chip_gap)
        parts.append(rect(x, chip_y, chip_w, chip_h, "#fff", rx=18, stroke=LINE))
        parts.append(rect(x, chip_y, 8, chip_h, color, rx=8))
        parts.append(f'<text x="{x + 24}" y="{chip_y + 35}" class="body">{esc(label)}</text>\n')
        parts.append(
            f'<text x="{x + 24}" y="{chip_y + 67}" style="font:700 30px Arial,sans-serif; fill:{INK};">{esc(value)}</text>\n'
        )

    legend_x = 1240
    legend_y = 235
    parts.append(rect(legend_x, legend_y, 220, 76, "#fff", rx=18, stroke=LINE))
    parts.append(rect(legend_x + 22, legend_y + 22, 18, 18, ACCENT, rx=4))
    parts.append(f'<text x="{legend_x + 50}" y="{legend_y + 36}" class="body">Original images</text>\n')
    parts.append(rect(legend_x + 22, legend_y + 46, 18, 18, ACCENT_ORANGE, rx=4))
    parts.append(f'<text x="{legend_x + 50}" y="{legend_y + 60}" class="body">Upscales</text>\n')

    mx, my, mw, mh = 110, 360, 1380, 330
    parts.append(f'<text x="{mx}" y="{my - 28}" class="section">Monthly output</text>\n')
    parts.append(
        f'<text x="{mx}" y="{my - 6}" class="body">Stacked bars show originals and upscales per month.</text>\n'
    )
    parts.append(rect(mx, my, mw, mh, "#fff", rx=24, stroke=LINE))

    left_pad = 70
    bottom_pad = 52
    inner_x = mx + left_pad
    inner_y = my + 22
    inner_w = mw - left_pad - 26
    inner_h = mh - bottom_pad - 34
    max_month = max(row.total for row in monthly)

    for tick in range(0, max_month + 1, 50):
        y = inner_y + inner_h - (tick / max_month) * inner_h
        parts.append(line(inner_x, y, inner_x + inner_w, y, GRID, 1))
        parts.append(f'<text x="{inner_x - 14}" y="{y + 4:.1f}" text-anchor="end" class="axis">{tick}</text>\n')

    bar_slot = inner_w / len(monthly)
    bar_w = bar_slot * 0.58
    for index, row in enumerate(monthly):
        x = inner_x + index * bar_slot + (bar_slot - bar_w) / 2
        total_h = (row.total / max_month) * inner_h
        orig_h = (row.original / max_month) * inner_h
        up_h = (row.upscaled / max_month) * inner_h
        y_base = inner_y + inner_h
        if orig_h:
            parts.append(rect(x, y_base - orig_h, bar_w, orig_h, ACCENT, rx=8))
        if up_h:
            parts.append(rect(x, y_base - orig_h - up_h, bar_w, up_h, ACCENT_ORANGE, rx=8))
        parts.append(
            f'<text x="{x + bar_w / 2:.1f}" y="{y_base + 22}" text-anchor="middle" class="axis">{esc(row.month[2:])}</text>\n'
        )
        parts.append(
            f'<text x="{x + bar_w / 2:.1f}" y="{y_base - total_h - 10:.1f}" text-anchor="middle" class="value">{row.total}</text>\n'
        )

    ux, uy, uw, uh = 110, 760, 1380, 290
    top_users = users[:10]
    max_user = max(row.image_count for row in top_users)
    parts.append(f'<text x="{ux}" y="{uy - 28}" class="section">Top 10 users by image count</text>\n')
    parts.append(
        f'<text x="{ux}" y="{uy - 6}" class="body">Horizontal bars are stacked by originals and upscales.</text>\n'
    )
    parts.append(rect(ux, uy, uw, uh, "#fff", rx=24, stroke=LINE))

    label_w = 280
    inner_x = ux + label_w
    inner_y = uy + 28
    inner_w = uw - label_w - 34
    inner_h = uh - 52
    row_gap = inner_h / len(top_users)
    bar_h = row_gap * 0.56

    for tick in range(0, max_user + 1, 50):
        x = inner_x + (tick / max_user) * inner_w
        parts.append(line(x, inner_y, x, inner_y + inner_h, GRID, 1))
        parts.append(f'<text x="{x:.1f}" y="{uy + uh - 12}" text-anchor="middle" class="axis">{tick}</text>\n')

    for index, row in enumerate(top_users):
        y = inner_y + index * row_gap + (row_gap - bar_h) / 2
        short_id = row.user_id[-10:]
        orig_w = (row.original_count / max_user) * inner_w
        up_w = (row.upscaled_count / max_user) * inner_w
        parts.append(f'<text x="{ux + 22}" y="{y + bar_h / 2 + 5:.1f}" class="axis">...{esc(short_id)}</text>\n')
        parts.append(rect(inner_x, y, orig_w, bar_h, ACCENT, rx=8))
        if up_w:
            parts.append(rect(inner_x + orig_w, y, up_w, bar_h, ACCENT_ORANGE, rx=8))
        parts.append(
            f'<text x="{inner_x + orig_w + up_w + 10:.1f}" y="{y + bar_h / 2 + 5:.1f}" class="value">{row.image_count}</text>\n'
        )

    parts.append(
        '<text x="110" y="1090" class="small">Source files: rotpunkt-images-monthly-summary and rotpunkt-user-image-counts exports</text>\n'
    )
    parts.append("</svg>\n")
    out_path.write_text("".join(parts), encoding="utf-8")


def write_monthly_trend_chart(
    out_path: Path,
    monthly: list[MonthlyRow],
    total_images: int,
    total_originals: int,
    total_upscales: int,
    snapshot_label: str,
) -> None:
    peak_month = max(monthly, key=lambda row: row.total)
    highest_upscale_share = max(monthly, key=lambda row: (row.upscaled / row.total) if row.total else 0)

    parts = start_svg(
        "Rotpunkt monthly image trend",
        f"Monthly volume by type, based on the {snapshot_label} Supabase snapshot.",
    )
    card(parts, 88, 172, 240, 92, "Peak month", f"{month_label(peak_month.month)} · {fmt_int(peak_month.total)}", ACCENT)
    card(
        parts,
        350,
        172,
        240,
        92,
        "Highest upscale share",
        f"{month_label(highest_upscale_share.month)} · {fmt_pct(highest_upscale_share.upscaled / highest_upscale_share.total * 100)}",
        ACCENT_ORANGE,
    )
    card(parts, 612, 172, 240, 92, "Months tracked", str(len(monthly)), SUCCESS)
    card(parts, 874, 172, 240, 92, "Total images", fmt_int(total_images), ACCENT_DARK)
    card(parts, 1136, 172, 240, 92, "Upscales", fmt_int(total_upscales), ACCENT_ORANGE)

    parts.append(rect(88, 292, 1304, 540, "#fff", rx=26, stroke=LINE))
    parts.append(text(118, 330, "Originals are stacked under upscales; the dark line tracks total monthly output.", "label"))
    parts.append(rect(1090, 314, 260, 50, "#fffaf4", rx=16, stroke=LINE))
    parts.append(rect(1110, 332, 18, 18, ACCENT, rx=5))
    parts.append(text(1138, 346, "Originals", "label"))
    parts.append(rect(1226, 332, 18, 18, ACCENT_ORANGE, rx=5))
    parts.append(text(1254, 346, "Upscales", "label"))
    parts.append(line(1322, 341, 1350, 341, ACCENT_DARK, 3))
    parts.append(text(1358, 346, "Total", "label"))

    chart_x, chart_y, chart_w, chart_h = 118, 380, 1248, 392
    max_total = nice_max(max(row.total for row in monthly), 50)
    for tick in range(0, max_total + 1, 50):
        y = chart_y + chart_h - (tick / max_total) * chart_h
        parts.append(line(chart_x, y, chart_x + chart_w, y, GRID, 1))
        parts.append(text(chart_x - 12, y + 5, tick, "axis", anchor="end"))

    slot = chart_w / len(monthly)
    bar_w = slot * 0.46
    line_points = []
    for index, row in enumerate(monthly):
        x = chart_x + index * slot + (slot - bar_w) / 2
        orig_h = (row.original / max_total) * chart_h
        up_h = (row.upscaled / max_total) * chart_h
        total_h = (row.total / max_total) * chart_h
        base_y = chart_y + chart_h
        if row.original:
            parts.append(rect(x, base_y - orig_h, bar_w, orig_h, ACCENT, rx=10))
        if row.upscaled:
            parts.append(rect(x, base_y - orig_h - up_h, bar_w, up_h, ACCENT_ORANGE, rx=10))
        cx = x + bar_w / 2
        cy = base_y - total_h
        line_points.append((cx, cy))
        parts.append(text(cx, base_y + 26, month_label(row.month), "axis", anchor="middle"))
        parts.append(text(cx, cy - 10, row.total, "value", anchor="middle"))

    parts.append(polyline(line_points, ACCENT_DARK, 3.5))
    for cx, cy in line_points:
        parts.append(circle(cx, cy, 4.5, "#fff", stroke=ACCENT_DARK, stroke_width=2))

    finish_svg(parts, out_path)


def write_user_distribution_chart(
    out_path: Path,
    users: list[UserRow],
    total_images: int,
    snapshot_label: str,
) -> None:
    sorted_counts = sorted(row.image_count for row in users)
    median_images = sorted_counts[len(sorted_counts) // 2]
    average_images = total_images / len(users)
    one_image_users = sum(1 for count in sorted_counts if count == 1)
    over_ten_users = sum(1 for count in sorted_counts if count > 10)
    top5_share = sum(row.image_count for row in users[:5]) / total_images * 100

    bucket_specs = [
        ("1 image", lambda count: count == 1),
        ("2-4", lambda count: 2 <= count <= 4),
        ("5-9", lambda count: 5 <= count <= 9),
        ("10-24", lambda count: 10 <= count <= 24),
        ("25-49", lambda count: 25 <= count <= 49),
        ("50-99", lambda count: 50 <= count <= 99),
        ("100+", lambda count: count >= 100),
    ]
    buckets = [
        {"label": label, "users": sum(1 for row in users if matcher(row.image_count))}
        for label, matcher in bucket_specs
    ]

    parts = start_svg(
        "Rotpunkt user distribution",
        f"How image generation is distributed across {len(users)} user IDs in the {snapshot_label} snapshot.",
    )
    parts.append(rect(88, 178, 860, 650, "#fff", rx=26, stroke=LINE))
    parts.append(text(118, 216, "Users grouped by image-count bucket", "section"))
    parts.append(text(118, 244, "This view emphasizes the long tail rather than only the top accounts.", "label"))

    hist_x, hist_y, hist_w, hist_h = 118, 288, 800, 470
    max_bucket = nice_max(max(bucket["users"] for bucket in buckets), 5)
    for tick in range(0, max_bucket + 1, 5):
        y = hist_y + hist_h - (tick / max_bucket) * hist_h
        parts.append(line(hist_x, y, hist_x + hist_w, y, GRID, 1))
        parts.append(text(hist_x - 12, y + 5, tick, "axis", anchor="end"))

    slot = hist_w / len(buckets)
    bar_w = slot * 0.54
    for index, bucket in enumerate(buckets):
        x = hist_x + index * slot + (slot - bar_w) / 2
        h = (bucket["users"] / max_bucket) * hist_h
        parts.append(rect(x, hist_y + hist_h - h, bar_w, h, ACCENT if index < 4 else ACCENT_ORANGE, rx=10))
        parts.append(text(x + bar_w / 2, hist_y + hist_h + 26, bucket["label"], "axis", anchor="middle"))
        parts.append(text(x + bar_w / 2, hist_y + hist_h - h - 10, bucket["users"], "value", anchor="middle"))

    parts.append(rect(978, 178, 414, 650, "#fff", rx=26, stroke=LINE))
    parts.append(text(1008, 216, "Concentration", "section"))
    parts.append(text(1008, 244, "A small set of users drives most of the volume.", "label"))
    card(parts, 1008, 276, 170, 92, "Median per user", str(median_images), SUCCESS)
    card(parts, 1198, 276, 164, 92, "Average per user", f"{average_images:.1f}", ACCENT)
    card(parts, 1008, 388, 170, 92, "Single-image users", str(one_image_users), ACCENT_ORANGE)
    card(parts, 1198, 388, 164, 92, "Users above 10", str(over_ten_users), ACCENT_DARK)
    parts.append(text(1008, 538, "Top 5 users share", "section"))
    parts.append(rect(1008, 560, 354, 38, ACCENT_WASH, rx=19))
    parts.append(rect(1008, 560, 354 * (top5_share / 100), 38, ACCENT, rx=19))
    parts.append(text(1185, 585, fmt_pct(top5_share), "value", anchor="middle", fill="#fff"))
    parts.append(text(1008, 630, "Remaining users share", "label"))
    parts.append(f'<text x="1008" y="652" class="kpi-value">{esc(fmt_pct(100 - top5_share))}</text>\n')
    parts.append(text(1008, 714, "Readout", "section"))
    parts.append(text(1008, 744, f"{one_image_users} users generated exactly one image.", "label"))
    parts.append(text(1008, 770, f"{sum(1 for row in users if row.image_count <= 4)} users stayed at four images or fewer.", "label"))
    parts.append(text(1008, 796, f"Top user volume: {fmt_int(users[0].image_count)} images.", "label"))
    finish_svg(parts, out_path)


def write_originals_vs_upscales_chart(
    out_path: Path,
    monthly: list[MonthlyRow],
    total_images: int,
    total_originals: int,
    total_upscales: int,
) -> None:
    first_upscale_month = next(row.month for row in monthly if row.upscaled > 0)
    highest_upscale_share = max(monthly, key=lambda row: (row.upscaled / row.total) if row.total else 0)

    parts = start_svg(
        "Rotpunkt originals vs. upscales",
        "Overall split between first-pass generations and upscale operations.",
    )
    parts.append(rect(88, 178, 1304, 650, "#fff", rx=26, stroke=LINE))
    parts.append(text(118, 216, "Share of total image activity", "section"))
    parts.append(
        text(
            118,
            244,
            f"Upscaling begins in {month_label(first_upscale_month)} and reaches {fmt_int(total_upscales)} total records.",
            "label",
        )
    )

    cx, cy = 420, 500
    outer_r, inner_r = 170, 104
    orig_angle = 360 * (total_originals / total_images)
    parts.append(donut_segment(cx, cy, outer_r, inner_r, 0, orig_angle, ACCENT))
    parts.append(donut_segment(cx, cy, outer_r, inner_r, orig_angle, 360, ACCENT_ORANGE))
    parts.append(circle(cx, cy, inner_r - 2, "#fff"))
    parts.append(text(cx, cy - 8, "Total", "label", anchor="middle"))
    parts.append(
        f'<text x="{cx}" y="{cy + 30}" text-anchor="middle" '
        f'style="font-family:Raleway,Arial,sans-serif;font-size:44px;font-weight:800;fill:{INK};">{fmt_int(total_images)}</text>\n'
    )
    parts.append(text(cx, cy + 58, "images", "label", anchor="middle"))

    card(parts, 720, 300, 250, 100, "Originals", f"{fmt_int(total_originals)} · {fmt_pct(total_originals / total_images * 100)}", ACCENT)
    card(parts, 990, 300, 250, 100, "Upscales", f"{fmt_int(total_upscales)} · {fmt_pct(total_upscales / total_images * 100)}", ACCENT_ORANGE)
    card(parts, 720, 420, 250, 100, "First month with upscales", month_label(first_upscale_month), SUCCESS)
    card(
        parts,
        990,
        420,
        250,
        100,
        "Highest monthly upscale rate",
        f"{month_label(highest_upscale_share.month)} · {fmt_pct(highest_upscale_share.upscaled / highest_upscale_share.total * 100)}",
        ACCENT_DARK,
    )

    parts.append(text(720, 592, "Monthly upscale rate", "section"))
    parts.append(text(720, 620, "Percent of each month’s activity that came from upscales.", "label"))
    mini_x, mini_y, mini_w, mini_h = 720, 646, 520, 120
    parts.append(rect(mini_x, mini_y, mini_w, mini_h, "#fffaf4", rx=18, stroke=LINE))
    slot = mini_w / len(monthly)
    bar_w = slot * 0.56
    for index, row in enumerate(monthly):
        rate = (row.upscaled / row.total * 100) if row.total else 0
        h = (rate / 30) * (mini_h - 42)
        x = mini_x + index * slot + (slot - bar_w) / 2
        y = mini_y + mini_h - 24 - h
        parts.append(rect(x, y, bar_w, h, ACCENT_ORANGE if rate else ACCENT_TAN, rx=8))
        parts.append(text(x + bar_w / 2, mini_y + mini_h - 8, month_label(row.month), "small", anchor="middle"))
        parts.append(text(x + bar_w / 2, y - 8, f"{rate:.0f}%", "small", anchor="middle"))

    finish_svg(parts, out_path)


def write_cumulative_growth_chart(
    out_path: Path,
    images: list[ImageRow],
    total_images: int,
) -> None:
    per_day: dict[date, dict[str, int]] = defaultdict(lambda: {"total": 0, "original": 0, "upscaled": 0})
    for row in images:
        key = row.created_at.date()
        per_day[key]["total"] += 1
        if row.is_upscaled:
            per_day[key]["upscaled"] += 1
        else:
            per_day[key]["original"] += 1

    start_day = min(per_day)
    end_day = max(per_day)
    series = []
    current = start_day
    cum_total = 0
    cum_upscaled = 0
    while current <= end_day:
        day_counts = per_day.get(current, {"total": 0, "original": 0, "upscaled": 0})
        cum_total += day_counts["total"]
        cum_upscaled += day_counts["upscaled"]
        series.append(
            {
                "date": current,
                "cum_total": cum_total,
                "cum_upscaled": cum_upscaled,
            }
        )
        current += timedelta(days=1)

    def first_date_at_or_above(target: int) -> date:
        for row in series:
            if row["cum_total"] >= target:
                return row["date"]
        return end_day

    milestones = {target: first_date_at_or_above(target) for target in (250, 500, 750) if target <= total_images}

    parts = start_svg(
        "Rotpunkt cumulative image growth",
        "Running total of generated images across the full tracking window.",
    )
    tracking_days = (end_day - start_day).days + 1
    card(parts, 88, 172, 220, 92, "Tracking window", f"{tracking_days} days", SUCCESS)
    card(parts, 330, 172, 220, 92, "Average per day", f"{total_images / tracking_days:.1f}", ACCENT)
    card(parts, 572, 172, 220, 92, "Latest total", fmt_int(total_images), ACCENT_DARK)
    parts.append(rect(88, 292, 1304, 540, "#fff", rx=26, stroke=LINE))
    parts.append(text(118, 330, "Filled area tracks total cumulative images; the orange dashed line shows cumulative upscales.", "label"))
    parts.append(rect(1010, 314, 330, 50, "#fffaf4", rx=16, stroke=LINE))
    parts.append(rect(1032, 332, 18, 18, ACCENT, rx=5))
    parts.append(text(1060, 346, "Total cumulative", "label"))
    parts.append(line(1178, 341, 1206, 341, ACCENT_ORANGE, 3, dash="8 6"))
    parts.append(text(1216, 346, "Upscales cumulative", "label"))

    chart_x, chart_y, chart_w, chart_h = 118, 380, 1248, 392
    max_cum = nice_max(total_images, 100)
    for tick in range(0, max_cum + 1, 100):
        y = chart_y + chart_h - (tick / max_cum) * chart_h
        parts.append(line(chart_x, y, chart_x + chart_w, y, GRID, 1))
        parts.append(text(chart_x - 12, y + 5, tick, "axis", anchor="end"))

    days_span = (end_day - start_day).days or 1

    def point_for(day: date, value: int) -> tuple[float, float]:
        x = chart_x + ((day - start_day).days / days_span) * chart_w
        y = chart_y + chart_h - (value / max_cum) * chart_h
        return x, y

    area_points = [point_for(row["date"], row["cum_total"]) for row in series]
    area_d = (
        f"M {chart_x:.2f} {chart_y + chart_h:.2f} "
        + " ".join(f"L {x:.2f} {y:.2f}" for x, y in area_points)
        + f" L {chart_x + chart_w:.2f} {chart_y + chart_h:.2f} Z"
    )
    parts.append(path(area_d, fill=ACCENT_WASH, opacity=0.95))
    parts.append(polyline(area_points, ACCENT, 4))
    upscale_points = [point_for(row["date"], row["cum_upscaled"]) for row in series]
    parts.append(polyline(upscale_points, ACCENT_ORANGE, 3, dash="8 6"))

    month_cursor = date(start_day.year, start_day.month, 1)
    while month_cursor <= end_day:
        x, _ = point_for(month_cursor, 0)
        parts.append(line(x, chart_y, x, chart_y + chart_h, GRID, 1, opacity=0.5))
        parts.append(text(x, chart_y + chart_h + 26, month_cursor.strftime("%b '%y"), "axis", anchor="middle"))
        if month_cursor.month == 12:
            month_cursor = date(month_cursor.year + 1, 1, 1)
        else:
            month_cursor = date(month_cursor.year, month_cursor.month + 1, 1)

    for target, milestone_day in milestones.items():
        x, y = point_for(milestone_day, target)
        parts.append(circle(x, y, 5.5, "#fff", stroke=ACCENT, stroke_width=3))
        parts.append(rect(x + 12, y - 42, 122, 38, "#fffaf4", rx=12, stroke=LINE))
        parts.append(text(x + 24, y - 18, f"{fmt_int(target)} on {milestone_day.strftime('%b %d')}", "small"))

    finish_svg(parts, out_path)


def write_recent_weekly_activity_chart(
    out_path: Path,
    images: list[ImageRow],
    snapshot_label: str,
) -> None:
    def week_start(value: date) -> date:
        return value - timedelta(days=value.weekday())

    by_week: dict[date, dict[str, object]] = defaultdict(
        lambda: {"total": 0, "original": 0, "upscaled": 0, "users": set()}
    )
    for row in images:
        key = week_start(row.created_at.date())
        entry = by_week[key]
        entry["total"] += 1
        if row.is_upscaled:
            entry["upscaled"] += 1
        else:
            entry["original"] += 1
        if row.user_id:
            entry["users"].add(row.user_id)

    latest_week = week_start(max(row.created_at.date() for row in images))
    weeks = []
    for offset in range(15, -1, -1):
        key = latest_week - timedelta(weeks=offset)
        entry = by_week.get(key, {"total": 0, "original": 0, "upscaled": 0, "users": set()})
        weeks.append(
            {
                "week": key,
                "total": int(entry["total"]),
                "original": int(entry["original"]),
                "upscaled": int(entry["upscaled"]),
                "users": len(entry["users"]),
            }
        )

    last_four = sum(row["total"] for row in weeks[-4:])
    previous_four = sum(row["total"] for row in weeks[-8:-4])
    change = ((last_four - previous_four) / previous_four * 100) if previous_four else 0

    parts = start_svg(
        "Rotpunkt recent weekly activity",
        f"The latest 16 weeks through the {snapshot_label} snapshot; the final week is partial.",
    )
    card(parts, 88, 172, 240, 92, "Latest 4 weeks", fmt_int(last_four), ACCENT)
    card(parts, 350, 172, 240, 92, "Previous 4 weeks", fmt_int(previous_four), SUCCESS)
    card(parts, 612, 172, 240, 92, "4-week change", fmt_pct(change), ACCENT_DARK if change < 0 else ACCENT_ORANGE)
    card(parts, 874, 172, 240, 92, "Latest week", fmt_int(weeks[-1]["total"]), ACCENT_ORANGE)
    card(parts, 1136, 172, 240, 92, "Latest active users", str(weeks[-1]["users"]), SUCCESS)

    parts.append(rect(88, 292, 1304, 540, "#fff", rx=26, stroke=LINE))
    parts.append(text(118, 330, "Stacked weekly output with active-user count shown as the dark line.", "label"))
    parts.append(rect(1060, 314, 290, 50, "#fffaf4", rx=16, stroke=LINE))
    parts.append(rect(1080, 332, 18, 18, ACCENT, rx=5))
    parts.append(text(1108, 346, "Originals", "label"))
    parts.append(rect(1190, 332, 18, 18, ACCENT_ORANGE, rx=5))
    parts.append(text(1218, 346, "Upscales", "label"))
    parts.append(line(1304, 341, 1332, 341, ACCENT_DARK, 3))

    chart_x, chart_y, chart_w, chart_h = 118, 380, 1248, 392
    max_total = nice_max(max(row["total"] for row in weeks), 10)
    max_users = max(1, max(row["users"] for row in weeks))
    for tick in range(0, max_total + 1, 10):
        y = chart_y + chart_h - (tick / max_total) * chart_h
        parts.append(line(chart_x, y, chart_x + chart_w, y, GRID, 1))
        parts.append(text(chart_x - 12, y + 5, tick, "axis", anchor="end"))

    slot = chart_w / len(weeks)
    bar_w = slot * 0.5
    user_points = []
    for index, row in enumerate(weeks):
        x = chart_x + index * slot + (slot - bar_w) / 2
        orig_h = (row["original"] / max_total) * chart_h
        up_h = (row["upscaled"] / max_total) * chart_h
        base_y = chart_y + chart_h
        if orig_h:
            parts.append(rect(x, base_y - orig_h, bar_w, orig_h, ACCENT, rx=8))
        if up_h:
            parts.append(rect(x, base_y - orig_h - up_h, bar_w, up_h, ACCENT_ORANGE, rx=8))
        cx = x + bar_w / 2
        user_y = base_y - (row["users"] / max_users) * chart_h
        user_points.append((cx, user_y))
        parts.append(text(cx, base_y + 24, row["week"].strftime("%d %b"), "small", anchor="middle"))
        if row["total"]:
            parts.append(text(cx, base_y - orig_h - up_h - 8, row["total"], "value", anchor="middle"))

    parts.append(polyline(user_points, ACCENT_DARK, 3))
    for cx, cy in user_points:
        parts.append(circle(cx, cy, 4, "#fff", stroke=ACCENT_DARK, stroke_width=2))
    finish_svg(parts, out_path)


def write_new_returning_users_chart(
    out_path: Path,
    monthly: list[MonthlyRow],
    users: list[UserRow],
    snapshot_label: str,
) -> None:
    latest_three_new = sum(row.new_users for row in monthly[-3:])
    latest_three_returning = sum(row.returning_users for row in monthly[-3:])
    peak_acquisition = max(monthly, key=lambda row: row.new_users)

    parts = start_svg(
        "Rotpunkt new vs. returning users",
        f"Monthly active-user composition through the {snapshot_label} snapshot.",
    )
    card(parts, 88, 172, 240, 92, "All user IDs", str(len(users)), ACCENT)
    card(parts, 350, 172, 240, 92, "New users · last 3 months", str(latest_three_new), ACCENT_ORANGE)
    card(parts, 612, 172, 240, 92, "Returning users · last 3 months", str(latest_three_returning), SUCCESS)
    card(parts, 874, 172, 240, 92, "Peak acquisition", month_label(peak_acquisition.month), ACCENT_DARK)
    card(parts, 1136, 172, 240, 92, "New users at peak", str(peak_acquisition.new_users), ACCENT_ORANGE)

    parts.append(rect(88, 292, 1304, 540, "#fff", rx=26, stroke=LINE))
    parts.append(text(118, 330, "Monthly active users split into first-time and previously active user IDs.", "label"))
    parts.append(rect(1110, 314, 240, 50, "#fffaf4", rx=16, stroke=LINE))
    parts.append(rect(1130, 332, 18, 18, ACCENT_ORANGE, rx=5))
    parts.append(text(1158, 346, "New", "label"))
    parts.append(rect(1220, 332, 18, 18, ACCENT_DARK, rx=5))
    parts.append(text(1248, 346, "Returning", "label"))

    chart_x, chart_y, chart_w, chart_h = 118, 380, 1248, 392
    max_users = nice_max(max(row.distinct_users for row in monthly), 5)
    for tick in range(0, max_users + 1, 5):
        y = chart_y + chart_h - (tick / max_users) * chart_h
        parts.append(line(chart_x, y, chart_x + chart_w, y, GRID, 1))
        parts.append(text(chart_x - 12, y + 5, tick, "axis", anchor="end"))

    slot = chart_w / len(monthly)
    bar_w = slot * 0.5
    for index, row in enumerate(monthly):
        x = chart_x + index * slot + (slot - bar_w) / 2
        new_h = (row.new_users / max_users) * chart_h
        returning_h = (row.returning_users / max_users) * chart_h
        base_y = chart_y + chart_h
        if returning_h:
            parts.append(rect(x, base_y - returning_h, bar_w, returning_h, ACCENT_DARK, rx=8))
        if new_h:
            parts.append(rect(x, base_y - returning_h - new_h, bar_w, new_h, ACCENT_ORANGE, rx=8))
        parts.append(text(x + bar_w / 2, base_y + 26, month_label(row.month), "axis", anchor="middle"))
        parts.append(text(x + bar_w / 2, base_y - returning_h - new_h - 10, row.distinct_users, "value", anchor="middle"))
    finish_svg(parts, out_path)


def write_gallery_html(out_path: Path, chart_paths: dict[str, Path], snapshot_label: str) -> None:
    html_doc = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Rotpunkt chart gallery</title>
  <style>
    body {{ margin: 0; background: {BG}; color: {INK}; font-family: Raleway, Arial, sans-serif; }}
    main {{ max-width: 1280px; margin: 0 auto; padding: 48px 24px 72px; }}
    h1 {{ font-size: 40px; margin: 0 0 8px; }}
    p {{ color: {MUTED}; line-height: 1.5; }}
    section {{ margin-top: 28px; background: {PAPER}; border: 1px solid {LINE}; border-radius: 22px; padding: 18px; }}
    img {{ width: 100%; height: auto; display: block; border-radius: 16px; }}
    h2 {{ font-size: 24px; margin: 0 0 10px; }}
  </style>
</head>
<body>
  <main>
    <h1>Rotpunkt chart gallery</h1>
    <p>Exported from the Supabase snapshot pulled on {esc(snapshot_label)}.</p>
    <section><h2>Overview</h2><img src="{chart_paths['overview']}" alt="Overview chart" /></section>
    <section><h2>Monthly trend</h2><img src="{chart_paths['monthly']}" alt="Monthly trend chart" /></section>
    <section><h2>User distribution</h2><img src="{chart_paths['users']}" alt="User distribution chart" /></section>
    <section><h2>Originals vs. upscales</h2><img src="{chart_paths['split']}" alt="Originals vs upscales chart" /></section>
    <section><h2>Cumulative growth</h2><img src="{chart_paths['growth']}" alt="Cumulative growth chart" /></section>
    <section><h2>Recent weekly activity</h2><img src="{chart_paths['weekly']}" alt="Recent weekly activity chart" /></section>
    <section><h2>New vs. returning users</h2><img src="{chart_paths['retention']}" alt="New vs returning users chart" /></section>
  </main>
</body>
</html>
"""
    out_path.write_text(html_doc, encoding="utf-8")


def main() -> None:
    args = parse_args()
    report_dir = Path(args.report_dir)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    stamp = args.stamp or infer_latest_stamp(report_dir)
    snapshot_label = stamp_label(stamp)
    monthly, users, images = load_inputs(report_dir, stamp)

    total_images = len(images)
    total_originals = sum(1 for row in images if not row.is_upscaled)
    total_upscales = total_images - total_originals

    outputs = {
        "overview": out_dir / f"rotpunkt-image-generation-chart-{stamp}.svg",
        "monthly": out_dir / f"rotpunkt-chart-monthly-trend-{stamp}.svg",
        "users": out_dir / f"rotpunkt-chart-user-distribution-{stamp}.svg",
        "split": out_dir / f"rotpunkt-chart-originals-vs-upscales-{stamp}.svg",
        "growth": out_dir / f"rotpunkt-chart-cumulative-growth-{stamp}.svg",
        "weekly": out_dir / f"rotpunkt-chart-recent-weekly-activity-{stamp}.svg",
        "retention": out_dir / f"rotpunkt-chart-new-vs-returning-users-{stamp}.svg",
        "gallery": out_dir / f"rotpunkt-chart-gallery-{stamp}.html",
    }

    write_overview_chart(
        outputs["overview"],
        monthly,
        users,
        total_images,
        total_originals,
        total_upscales,
        snapshot_label,
    )
    write_monthly_trend_chart(
        outputs["monthly"],
        monthly,
        total_images,
        total_originals,
        total_upscales,
        snapshot_label,
    )
    write_user_distribution_chart(outputs["users"], users, total_images, snapshot_label)
    write_originals_vs_upscales_chart(outputs["split"], monthly, total_images, total_originals, total_upscales)
    write_cumulative_growth_chart(outputs["growth"], images, total_images)
    write_recent_weekly_activity_chart(outputs["weekly"], images, snapshot_label)
    write_new_returning_users_chart(outputs["retention"], monthly, users, snapshot_label)
    write_gallery_html(outputs["gallery"], outputs, snapshot_label)

    for path in outputs.values():
        print(path)


if __name__ == "__main__":
    main()
