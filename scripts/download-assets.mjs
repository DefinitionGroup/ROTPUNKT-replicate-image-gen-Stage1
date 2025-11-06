import fs from "fs";
import path from "path";

const SOURCE_JSON = "/Users/martin/Downloads/images_rows (1).json";
const DEST_DIR = "/Users/martin/DEV/replicate-image-gen/public/assets";
const CONCURRENT_DOWNLOADS = 6;

async function main() {
  const raw = await fs.promises.readFile(SOURCE_JSON, "utf8");
  const entries = JSON.parse(raw);

  await fs.promises.mkdir(DEST_DIR, { recursive: true });

  const queue = entries.slice();
  let active = 0;
  let index = 0;

  await new Promise((resolve, reject) => {
    const errors = [];

    const launchNext = () => {
      if (queue.length === 0 && active === 0) {
        if (errors.length) {
          reject(new AggregateError(errors, "One or more downloads failed"));
        } else {
          resolve();
        }
        return;
      }

      while (active < CONCURRENT_DOWNLOADS && queue.length > 0) {
        const entry = queue.shift();
        if (!entry) break;
        active += 1;
        downloadEntry(entry)
          .catch((error) => {
            errors.push({ entry, error });
            console.error(`❌ ${entry.id}: ${error.message}`);
          })
          .finally(() => {
            active -= 1;
            launchNext();
          });
      }
    };

    launchNext();
  });
}

async function downloadEntry(entry) {
  const url = entry.url;
  const parsedUrl = new URL(url);
  const ext = path.extname(parsedUrl.pathname) || ".png";
  const fileName = `${String(entry.idx).padStart(3, "0")}-${entry.id}${ext}`;
  const destinationPath = path.join(DEST_DIR, fileName);

  if (fs.existsSync(destinationPath)) {
    console.log(`⏭️  Skipping existing ${fileName}`);
    return;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await fs.promises.writeFile(destinationPath, Buffer.from(arrayBuffer));
  console.log(`✅ Saved ${fileName}`);
}

main().catch((error) => {
  console.error("Download script failed:", error);
  process.exitCode = 1;
});
