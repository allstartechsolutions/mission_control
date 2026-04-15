import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const SUGGESTION_UPLOADS_ROOT = path.join(process.cwd(), "uploads", "suggestions");

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "-");
}

function sanitizeFilename(filename: string) {
  const extension = path.extname(filename).toLowerCase();
  const basename =
    path.basename(filename, extension).replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "file";
  return `${basename}-${Date.now()}${extension}`;
}

export function getSuggestionAttachmentRelativePath(suggestionId: string, filename: string) {
  return `/uploads/suggestions/${sanitizeSegment(suggestionId)}/${filename}`;
}

export async function saveSuggestionAttachment(suggestionId: string, file: File) {
  const dir = path.join(SUGGESTION_UPLOADS_ROOT, sanitizeSegment(suggestionId));
  await mkdir(dir, { recursive: true });

  const storedName = sanitizeFilename(file.name || "file");
  const filePath = path.join(dir, storedName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return {
    filePath: getSuggestionAttachmentRelativePath(suggestionId, storedName),
    fileName: file.name || storedName,
    storedName,
    fileSize: file.size,
    mimeType: file.type || null,
  };
}

export async function deleteSuggestionAttachment(relativePath: string) {
  const absolutePath = path.join(process.cwd(), relativePath.replace(/^\//, ""));
  await rm(absolutePath, { force: true }).catch(() => {});
}

export async function deleteAllSuggestionAttachments(suggestionId: string) {
  const dir = path.join(SUGGESTION_UPLOADS_ROOT, sanitizeSegment(suggestionId));
  const files = await readdir(dir).catch(() => []);
  await Promise.all(files.map((file) => rm(path.join(dir, file), { force: true, recursive: true })));
}
