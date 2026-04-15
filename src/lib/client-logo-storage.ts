import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const CLIENT_UPLOADS_ROOT = path.join(process.cwd(), "uploads", "clients");

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "-");
}

function sanitizeFilename(filename: string) {
  const extension = path.extname(filename).toLowerCase();
  const basename = path.basename(filename, extension).replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "logo";
  return `${basename}-${Date.now()}${extension}`;
}

export function getClientLogoRelativePath(clientId: string, filename: string) {
  return `/uploads/clients/${sanitizeSegment(clientId)}/logo/${filename}`;
}

export async function saveClientLogoFile(clientId: string, file: File) {
  const clientDir = path.join(CLIENT_UPLOADS_ROOT, sanitizeSegment(clientId), "logo");
  await mkdir(clientDir, { recursive: true });

  const existingFiles = await readdir(clientDir).catch(() => []);
  await Promise.all(existingFiles.map((entry) => rm(path.join(clientDir, entry), { force: true, recursive: true })));

  const filename = sanitizeFilename(file.name || "logo");
  const filePath = path.join(clientDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return getClientLogoRelativePath(clientId, filename);
}
