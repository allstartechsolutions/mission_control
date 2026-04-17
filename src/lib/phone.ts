export function normalizePhoneNumber(value: string | null | undefined) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  if (/^\+1\d{10}$/.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
}

export function formatPhoneNumber(value: string | null | undefined) {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^\+1\d{10}$/.test(trimmed)) {
    const digits = trimmed.slice(2);
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  const digits = trimmed.replace(/\D/g, "");
  const localDigits = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  if (localDigits.length === 10) {
    return `(${localDigits.slice(0, 3)}) ${localDigits.slice(3, 6)}-${localDigits.slice(6)}`;
  }

  return trimmed;
}
