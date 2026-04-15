import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const CLIENT_UPLOADS_ROOT = path.join(process.cwd(), "uploads", "clients");

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "-");
}

function sanitizeFilename(filename: string) {
  const extension = path.extname(filename).toLowerCase();
  const basename = path.basename(filename, extension).replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "profile";
  return `${basename}-${Date.now()}${extension}`;
}

function getEmployeeImageRelativePath(clientId: string, employeeId: string, filename: string) {
  return `/uploads/clients/${sanitizeSegment(clientId)}/employees/${sanitizeSegment(employeeId)}/${filename}`;
}

export async function saveClientEmployeeImageFile(clientId: string, employeeId: string, file: File) {
  const employeeDir = path.join(CLIENT_UPLOADS_ROOT, sanitizeSegment(clientId), "employees", sanitizeSegment(employeeId));
  await mkdir(employeeDir, { recursive: true });

  const existingFiles = await readdir(employeeDir).catch(() => []);
  await Promise.all(existingFiles.map((entry) => rm(path.join(employeeDir, entry), { force: true, recursive: true })));

  const filename = sanitizeFilename(file.name || "profile");
  const filePath = path.join(employeeDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return getEmployeeImageRelativePath(clientId, employeeId, filename);
}
