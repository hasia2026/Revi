-- Property operational timezone (IANA identifier).
--
-- SEMANTICS: the timezone of the physical property where the business
-- operates. NOT an account preference, NOT a user display setting.
-- All operational date concepts ("today", arrival day, overnight rollover,
-- expiration, scheduled work) resolve against this value.
--
-- If CUE later supports one organization with multiple properties, this
-- column moves to the property/location record. It does not become a
-- user setting.
--
-- Nullable in this migration by design. Onboarding did not yet write this
-- column when it was applied; enforcing NOT NULL first would have broken
-- new signups. The NOT NULL constraint lands in a follow-up migration.
--
-- No DEFAULT, ever: a default silently assigns one region's timezone to
-- properties elsewhere. Absence must fail loudly, not resolve wrongly.
--
-- APPLIED: 2026-08-16

alter table businesses
  add column timezone text;

update businesses
  set timezone = 'America/Los_Angeles'
  where timezone is null;
