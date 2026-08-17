/**
 * Property time — the single source of truth for operational dates in CUE.
 *
 * RULES:
 * - Timestamps (created_at, updated_at, audit events) stay in UTC. Always.
 * - Calendar-only fields (arrival_date, departure_date) stay as YYYY-MM-DD
 *   strings with no timezone attached. A date is not an instant.
 * - UTC is converted to property-local ONLY to decide what the property's
 *   current calendar date or time is.
 * - No module may call Intl.DateTimeFormat directly. Use these functions.
 * - No module may read businesses.timezone itself. Take it from
 *   getModulePageContext().
 */

/** Reusable formatter cache — constructing Intl formatters is not cheap. */
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

type WallClock = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

/**
 * Read the wall-clock reading a person standing at the property would see
 * at the given instant. Built from formatToParts so the output does not
 * depend on locale formatting conventions.
 */
function getWallClock(instant: Date, timeZone: string): WallClock {
  const parts = getFormatter(timeZone).formatToParts(instant);
  const lookup: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") lookup[part.type] = part.value;
  }
  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    // Some ICU builds render midnight as "24" under hour12: false.
    hour: Number(lookup.hour) % 24,
    minute: Number(lookup.minute),
    second: Number(lookup.second),
  };
}

/**
 * The property's calendar date at a given instant, as "YYYY-MM-DD".
 * Constructed explicitly rather than relying on any locale's date format.
 */
export function toPropertyDate(instant: Date, timeZone: string): string {
  const { year, month, day } = getWallClock(instant, timeZone);
  const yyyy = String(year).padStart(4, "0");
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * The property's current calendar date, as "YYYY-MM-DD".
 *
 * This is the function that answers "is this reservation arriving today?".
 * It is deliberately not derivable from new Date() alone.
 */
export function getPropertyToday(timeZone: string): string {
  return toPropertyDate(new Date(), timeZone);
}

/** The UTC offset in milliseconds in effect at `instant` for `timeZone`. */
function getOffsetMs(instant: Date, timeZone: string): number {
  const wall = getWallClock(instant, timeZone);
  const asIfUtc = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
  );
  // Discard sub-second precision so the comparison is exact.
  return asIfUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/**
 * The UTC instant corresponding to midnight at the start of a property-local
 * calendar date.
 *
 * Two passes are required. The first guesses the offset using the offset that
 * applies at the naive instant; on a DST boundary that guess can be off by an
 * hour, so the second pass re-reads the offset at the corrected instant.
 *
 * On a spring-forward date in a zone that transitions at midnight, local
 * midnight does not exist. This resolves to the first instant that does exist
 * on that date, which is the correct notion of "start of day".
 */
function startOfPropertyDayUtc(dateStr: string, timeZone: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const naive = Date.UTC(year, month - 1, day, 0, 0, 0);

  let instant = new Date(naive - getOffsetMs(new Date(naive), timeZone));
  instant = new Date(naive - getOffsetMs(instant, timeZone));

  return instant;
}

/** Add one calendar day to a YYYY-MM-DD string. Pure calendar arithmetic. */
function nextCalendarDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  const yyyy = String(next.getUTCFullYear()).padStart(4, "0");
  const mm = String(next.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(next.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * The half-open UTC instant range [start, end) spanned by a property-local
 * calendar date. Use this to filter UTC timestamp columns by a property day.
 *
 * The end bound is the start of the NEXT property day, never start + 24h.
 * A property day is 23 hours on spring-forward and 25 on fall-back.
 *
 * NOT YET USED IN PRODUCTION CODE. See property-time.test.ts.
 */
export function propertyDayBoundsUtc(
  dateStr: string,
  timeZone: string,
): { start: Date; end: Date } {
  return {
    start: startOfPropertyDayUtc(dateStr, timeZone),
    end: startOfPropertyDayUtc(nextCalendarDate(dateStr), timeZone),
  };
}
