import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ENCRYPTION_PREFIX = "enc:v1";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const ALGORITHM = "aes-256-gcm";

let cachedKey: Buffer | null = null;

function getEncryptionKey() {
  if (cachedKey) return cachedKey;

  const rawKey = process.env.CLIENT_ACCOUNT_CREDENTIALS_KEY?.trim();
  if (!rawKey) {
    throw new Error("CLIENT_ACCOUNT_CREDENTIALS_KEY is not configured.");
  }

  let key: Buffer;
  if (/^[A-Fa-f0-9]{64}$/.test(rawKey)) {
    key = Buffer.from(rawKey, "hex");
  } else {
    key = Buffer.from(rawKey, "base64");
  }

  if (key.length !== 32) {
    throw new Error("CLIENT_ACCOUNT_CREDENTIALS_KEY must decode to exactly 32 bytes. Use base64 or 64-character hex.");
  }

  cachedKey = key;
  return key;
}

export function encryptAccountSecret(value: string) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    ENCRYPTION_PREFIX,
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export function decryptAccountSecret(value: string) {
  const parts = value.split(":");
  const prefix = parts.slice(0, 2).join(":");
  const [ivB64, authTagB64, encryptedB64] = parts.slice(2);

  if (prefix !== ENCRYPTION_PREFIX || !ivB64 || !authTagB64 || !encryptedB64) {
    throw new Error("Unsupported encrypted account secret format.");
  }

  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const encrypted = Buffer.from(encryptedB64, "base64");

  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Corrupt encrypted account secret.");
  }

  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
