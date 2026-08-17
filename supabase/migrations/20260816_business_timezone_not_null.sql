-- Enforce the property timezone invariant.
--
-- PRECONDITION: all write paths that create a businesses row must already
-- populate timezone, and this must return zero rows:
--
--   select id, name, timezone from businesses where timezone is null;
--
-- NOT YET APPLIED as of 2026-08-17. Onboarding now seeds timezone from the
-- browser (src/app/(auth)/setup/page.tsx), but a fresh signup has not been
-- verified end to end. Run the check above before applying.

alter table businesses
  alter column timezone set not null;
