-- Enforce the property timezone invariant.
--
-- PRECONDITION: all write paths that create a businesses row must already
-- populate timezone, and this must return zero rows:
--
--   select id, name, timezone from businesses where timezone is null;
--
-- APPLIED: 2026-08-20. Verified beforehand that onboarding seeds a real IANA
-- timezone from the browser (src/app/(auth)/setup/page.tsx) via a fresh
-- signup, and that zero rows had a null timezone.

alter table businesses
  alter column timezone set not null;
