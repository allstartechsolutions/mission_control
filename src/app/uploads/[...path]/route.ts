import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

function contentTypeFor(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".txt": "text/plain; charset=utf-8",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };

  return map[extension] ?? "application/octet-stream";
}

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path: pathSegments } = await context.params;
  const relativePath = pathSegments.join("/");
  const absolutePath = path.join(process.cwd(), "uploads", relativePath);

  if (!absolutePath.startsWith(path.join(process.cwd(), "uploads"))) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await readFile(absolutePath);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": contentTypeFor(absolutePath),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
