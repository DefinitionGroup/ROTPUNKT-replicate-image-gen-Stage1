#!/usr/bin/env node

/**
 * Download all generated images from Supabase/MinIO into the ARC/ folder.
 *
 * Usage:  node scripts/download-arc.mjs
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { writeFile } from "fs/promises";
import { resolve, join } from "path";

// ── Load env from .env.local ────────────────────────────────────────
const ROOT = resolve(import.meta.dirname, "..");
const envPath = join(ROOT, ".env.local");
const envContent = readFileSync(envPath, "utf-8");

function env(key) {
  const match = envContent.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match) throw new Error(`Missing ${key} in .env.local`);
  return match[1].trim();
}

const SUPABASE_URL = env("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE_KEY = env("SUPABASE_SERVICE_ROLE_KEY");

// ── Setup ───────────────────────────────────────────────────────────
const ARC_DIR = join(ROOT, "ARC");
mkdirSync(ARC_DIR, { recursive: true });

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Fetch all image rows (paginated) ────────────────────────────────
async function fetchAllImages() {
  const PAGE_SIZE = 1000;
  let all = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("images")
      .select("id, url, created_at, is_upscaled, user_id, imageprompt")
      .order("created_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`Supabase query error: ${error.message}`);
    if (!data || data.length === 0) break;

    all = all.concat(data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}

// ── Download a single image ─────────────────────────────────────────
async function downloadImage(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
  return buf.length;
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log("Fetching image records from Supabase...");
  const images = await fetchAllImages();
  console.log(`Found ${images.length} images.\n`);

  if (images.length === 0) {
    console.log("Nothing to download.");
    return;
  }

  let downloaded = 0;
  let failed = 0;
  const manifest = [];

  for (const img of images) {
    // Build filename: 2025-12-15_a1b2c3d4_upscaled.webp
    const date = img.created_at
      ? img.created_at.slice(0, 10)
      : "unknown-date";
    const shortId = img.id.slice(0, 8);
    const ext = img.url.split(".").pop() || "webp";
    const upscaledSuffix = img.is_upscaled ? "_upscaled" : "";
    const filename = `${date}_${shortId}${upscaledSuffix}.${ext}`;
    const destPath = join(ARC_DIR, filename);

    // Skip if already downloaded
    if (existsSync(destPath)) {
      console.log(`  [skip] ${filename} (already exists)`);
      manifest.push({ ...img, filename, status: "skipped" });
      downloaded++;
      continue;
    }

    try {
      const bytes = await downloadImage(img.url, destPath);
      downloaded++;
      console.log(
        `  [${downloaded}/${images.length}] ${filename}  (${(bytes / 1024).toFixed(0)} KB)`
      );
      manifest.push({ ...img, filename, status: "ok" });
    } catch (err) {
      failed++;
      console.error(`  [FAIL] ${filename}: ${err.message}`);
      manifest.push({ ...img, filename, status: "error", error: err.message });
    }
  }

  // Write manifest
  const manifestPath = join(ARC_DIR, "manifest.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\nDone. ${downloaded} downloaded, ${failed} failed.`);
  console.log(`Manifest: ${manifestPath}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
