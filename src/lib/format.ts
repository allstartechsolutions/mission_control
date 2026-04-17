import { formatPhoneNumber } from "@/lib/phone";

export function formatEnumLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatPhoneDisplay(value: string | null | undefined, fallback = "") {
  const formatted = formatPhoneNumber(value);
  return formatted || fallback;
}
