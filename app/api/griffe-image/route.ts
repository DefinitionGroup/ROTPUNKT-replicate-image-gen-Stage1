import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const GRIFFE_DIR = path.resolve(process.cwd(), "Griffe");
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);

function getMimeType(extension: string): string {
  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".tif":
    case ".tiff":
      return "image/tiff";
    default:
      return "application/octet-stream";
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedPath = searchParams.get("path");

  if (!requestedPath) {
    return NextResponse.json({ error: "Missing image path." }, { status: 400 });
  }

  const normalizedPath = path.normalize(requestedPath);
  const absoluteImagePath = path.resolve(GRIFFE_DIR, normalizedPath);
  const relativePath = path.relative(GRIFFE_DIR, absoluteImagePath);

  const isPathInsideBase =
    relativePath !== "" &&
    !relativePath.startsWith("..") &&
    !path.isAbsolute(relativePath);

  if (!isPathInsideBase) {
    return NextResponse.json({ error: "Invalid image path." }, { status: 400 });
  }

  const extension = path.extname(absoluteImagePath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  try {
    const fileBuffer = await readFile(absoluteImagePath);
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": getMimeType(extension),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }
}
