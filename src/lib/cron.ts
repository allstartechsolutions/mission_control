import { CronExpressionParser } from "cron-parser";

/**
 * Calculate the next run time for a cron expression in a given timezone.
 * Returns null if the expression is invalid or has no future occurrences
 * (e.g. a one-time schedule in the past).
 */
export function computeNextRunAt(
  cronExpression: string,
  cronTimezone: string,
  after?: Date,
): Date | null {
  try {
    const parts = cronExpression.trim().split(/\s+/);

    // Handle 6-field one-time expressions: min hour day month dow year
    if (parts.length === 6 && /^\d{4}$/.test(parts[5])) {
      const [minute, hour, day, month, , year] = parts;
      const dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:00`;
      const target = toTimezoneDate(dateStr, cronTimezone);
      const now = after || new Date();
      return target > now ? target : null;
    }

    // Standard 5-field cron
    const interval = CronExpressionParser.parse(cronExpression, {
      tz: cronTimezone,
      currentDate: after || new Date(),
    });
    return interval.next().toDate();
  } catch {
    return null;
  }
}

/**
 * Convert a naive datetime string (no Z, no offset) in a given IANA timezone to a UTC Date.
 */
function toTimezoneDate(naiveDatetime: string, timezone: string): Date {
  // Build a formatter that produces the UTC offset for the target timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Parse the naive datetime as UTC first, then adjust
  const asUtc = new Date(naiveDatetime + "Z");
  const inTz = new Date(
    formatter.format(asUtc).replace(
      /(\d{2})\/(\d{2})\/(\d{4}),\s+(\d{2}):(\d{2}):(\d{2})/,
      "$3-$1-$2T$4:$5:$6Z",
    ),
  );
  const offsetMs = inTz.getTime() - asUtc.getTime();
  return new Date(asUtc.getTime() - offsetMs);
}
