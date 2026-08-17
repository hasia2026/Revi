import { test } from "node:test";
import assert from "node:assert/strict";
import { toPropertyDate, propertyDayBoundsUtc } from "./property-time";

const HOUR = 3600_000;

// --- toPropertyDate: the UTC-rollover bug this whole change exists to fix ---

test("evening in LA is still the previous UTC-day date", () => {
  // 2026-08-17T02:30Z is 7:30pm on 2026-08-16 in Los Angeles.
  const instant = new Date("2026-08-17T02:30:00Z");
  assert.equal(toPropertyDate(instant, "America/Los_Angeles"), "2026-08-16");
  assert.equal(toPropertyDate(instant, "UTC"), "2026-08-17");
});

test("property date is timezone-specific, not server-specific", () => {
  const instant = new Date("2026-08-17T02:30:00Z");
  assert.equal(toPropertyDate(instant, "America/New_York"), "2026-08-16");
  assert.equal(toPropertyDate(instant, "America/Chicago"), "2026-08-16");
  assert.equal(toPropertyDate(instant, "Asia/Tokyo"), "2026-08-17");
});

// --- propertyDayBoundsUtc: DST is where naive implementations fail ---

function hoursBetween({ start, end }: { start: Date; end: Date }) {
  return (end.getTime() - start.getTime()) / HOUR;
}

test("Los_Angeles: normal winter day is 24 hours", () => {
  const bounds = propertyDayBoundsUtc("2026-01-15", "America/Los_Angeles");
  assert.equal(bounds.start.toISOString(), "2026-01-15T08:00:00.000Z");
  assert.equal(hoursBetween(bounds), 24);
});

test("Los_Angeles: normal summer day is 24 hours", () => {
  const bounds = propertyDayBoundsUtc("2026-07-15", "America/Los_Angeles");
  assert.equal(bounds.start.toISOString(), "2026-07-15T07:00:00.000Z");
  assert.equal(hoursBetween(bounds), 24);
});

test("Los_Angeles: spring-forward day is 23 hours", () => {
  const bounds = propertyDayBoundsUtc("2026-03-08", "America/Los_Angeles");
  assert.equal(bounds.start.toISOString(), "2026-03-08T08:00:00.000Z");
  assert.equal(bounds.end.toISOString(), "2026-03-09T07:00:00.000Z");
  assert.equal(hoursBetween(bounds), 23);
});

test("Los_Angeles: fall-back day is 25 hours", () => {
  const bounds = propertyDayBoundsUtc("2026-11-01", "America/Los_Angeles");
  assert.equal(bounds.start.toISOString(), "2026-11-01T07:00:00.000Z");
  assert.equal(bounds.end.toISOString(), "2026-11-02T08:00:00.000Z");
  assert.equal(hoursBetween(bounds), 25);
});

test("New_York: spring-forward day is 23 hours", () => {
  const bounds = propertyDayBoundsUtc("2026-03-08", "America/New_York");
  assert.equal(bounds.start.toISOString(), "2026-03-08T05:00:00.000Z");
  assert.equal(hoursBetween(bounds), 23);
});

test("New_York: fall-back day is 25 hours", () => {
  const bounds = propertyDayBoundsUtc("2026-11-01", "America/New_York");
  assert.equal(bounds.start.toISOString(), "2026-11-01T04:00:00.000Z");
  assert.equal(hoursBetween(bounds), 25);
});

test("Phoenix does not observe DST", () => {
  const spring = propertyDayBoundsUtc("2026-03-08", "America/Phoenix");
  const fall = propertyDayBoundsUtc("2026-11-01", "America/Phoenix");
  assert.equal(hoursBetween(spring), 24);
  assert.equal(hoursBetween(fall), 24);
});

test("bounds round-trip: start of day maps back to that date", () => {
  for (const date of ["2026-03-08", "2026-11-01", "2026-07-15"]) {
    const { start } = propertyDayBoundsUtc(date, "America/Los_Angeles");
    assert.equal(toPropertyDate(start, "America/Los_Angeles"), date);
  }
});
