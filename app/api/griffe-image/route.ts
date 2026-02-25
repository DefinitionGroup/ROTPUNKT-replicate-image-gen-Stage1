import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const GRIFFE_DIR = path.resolve(process.cwd(), "grifffronten");
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);
const VERBOSE_LOGS =
  process.env.DEBUG_IMAGE_PROXY === "true" ||
  process.env.NODE_ENV === "development";

function logInfo(message: string, data?: Record<string, unknown>) {
  if (!VERBOSE_LOGS) return;
  if (data) {
    console.log(message, data);
    return;
  }
  console.log(message);
}

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
  const requestId = crypto.randomUUID().slice(0, 8);
  const { searchParams } = new URL(request.url);
  const requestedPath = searchParams.get("path");
  logInfo(`[griffe-image][${requestId}] request received`, {
    requestedPath,
  });

  if (!requestedPath) {
    console.warn(`[griffe-image][${requestId}] missing image path`);
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
    console.warn(`[griffe-image][${requestId}] invalid image path`, {
      requestedPath,
      normalizedPath,
      relativePath,
    });
    return NextResponse.json({ error: "Invalid image path." }, { status: 400 });
  }

  const extension = path.extname(absoluteImagePath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    console.warn(`[griffe-image][${requestId}] unsupported file extension`, {
      requestedPath,
      extension,
    });
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  try {
    const fileBuffer = await readFile(absoluteImagePath);
    logInfo(`[griffe-image][${requestId}] image served`, {
      requestedPath,
      absoluteImagePath,
      bytes: fileBuffer.byteLength,
    });
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": getMimeType(extension),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    const errorCode =
      error instanceof Error && "code" in error
        ? String((error as { code?: unknown }).code ?? "unknown")
        : "unknown";
    console.error(`[griffe-image][${requestId}] image read failed`, {
      requestedPath,
      absoluteImagePath,
      errorCode,
    });
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }
}
