import { Prisma } from "@prisma/client";
import { formatEnumLabel } from "@/lib/format";

export const projectStatusOptions = ["planned", "active", "on_hold", "completed"] as const;
export const projectPriorityOptions = ["low", "medium", "high", "urgent"] as const;
export const milestoneStatusOptions = ["planned", "active", "done", "blocked", "archived"] as const;

export type ProjectStatus = (typeof projectStatusOptions)[number];
export type ProjectPriority = (typeof projectPriorityOptions)[number];
export type MilestoneStatus = (typeof milestoneStatusOptions)[number];

export type MilestoneInput = {
  id?: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  estimatedPrice?: string;
  finalPrice?: string;
};

export function toNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function parseCurrency(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const normalized = Number(trimmed.replace(/[$,\s]/g, ""));
  if (Number.isNaN(normalized)) {
    throw new Error("Invalid currency value.");
  }
  return new Prisma.Decimal(normalized.toFixed(2));
}

export function parseDate(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const date = new Date(`${trimmed}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date value.");
  }
  return date;
}

export function parseMilestones(value: FormDataEntryValue | null): MilestoneInput[] {
  if (typeof value !== "string" || !value.trim()) return [];

  const parsed = JSON.parse(value) as MilestoneInput[];
  if (!Array.isArray(parsed)) {
    throw new Error("Invalid milestones payload.");
  }

  return parsed
    .map((milestone) => ({
      id: milestone.id,
      title: milestone.title?.trim() || "",
      description: milestone.description?.trim() || "",
      status: milestone.status?.trim() || "planned",
      dueDate: milestone.dueDate?.trim() || "",
      estimatedPrice: milestone.estimatedPrice?.trim() || "",
      finalPrice: milestone.finalPrice?.trim() || "",
    }))
    .filter((milestone) => milestone.title);
}

export function serializeCurrency(value: Prisma.Decimal | number | string | null | undefined) {
  if (value == null) return "";
  return Number(value).toFixed(2);
}

export function formatCurrency(value: Prisma.Decimal | number | null | undefined) {
  if (value == null) return "Not set";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export { formatEnumLabel };
