# CUE — STATE.md

**Purpose:** This file is the single source of truth for what is actually built in CUE.
Chat history is not ground truth. This file is. If they disagree, this file wins.

**Prime rule:** Nothing graduates to `WORKING NOW` because code exists.
It graduates only after the real flow has been exercised end to end and the result recorded here.

---

## 1. Authoritative Pointer

| Field | Value |
| --- | --- |
| Authoritative branch | `main` |
| Last verified commit | `2871f9981b694e430b10539723c9f43b7ab203d8` — Complete front desk check-in flow |
| Commit date | 2026-09-08 |
| `main` last updated | 2026-09-10 — merge commit `ba7a9558a26980639a15824cbb4628296e34463c` |
| Merged to `main`? | Yes — 2026-09-10 |
| Last verified through full E2E chain | **NEVER** (see §8) |
| Verification method for this revision | Static repo audit + live database inspection via `pg_get_functiondef()` + registration migration preflight against live Supabase + `npm run build` + one manual check-in performed against production data. Repository synchronization rechecked after merge: `main` contains the former authoritative branch with no code differences. |

> `main` is now authoritative. Read state, review code, and base new work on `main` unless a newer explicitly designated working branch is recorded here.

**Quarantined branch:** `wip-copilot-snapshot` — contains unreviewed Copilot work.
**Never merge it.** Recover only individually reviewed paths from it, for example with
`git restore --source=origin/wip-copilot-snapshot -- <paths>`.
Never merge or wholesale cherry-pick the quarantined branch.

---

## 2. Status Ladder

| Label | Means |
| --- | --- |
| `WORKING NOW` | Exercised against real data and confirmed. Date recorded. |
| `PARTIALLY BUILT` | Committed to the authoritative branch, but the path has not been exercised. |
| `PROTOTYPE ONLY` | UI or scaffolding with no real backing implementation. |
| `PLANNED` | Decided, not written. |

Never use bare "done", "shipped", or "complete" in this repo's docs.

---

## 3. Locked Product Decisions

**Five pillars:** `Capture → Understand → Enhance → Execute → Expand`
Enhance is a real pillar. Brand Studio, Website Builder, and Mascot Studio live under it.

**Brand:** HASI is silent infrastructure — no persona, no chat surface. CUE (the dog) is the only user-facing voice.

**Codebase:** CUE is a rebrand and architectural expansion of Revi. Same repo, same Supabase project. Not a rewrite.

**Roles:** Shannon (product owner, final authority) · ChatGPT (product strategy + UX; implementation gated behind design approval) · Claude (architecture + engineering) · Copilot (mechanical edits only, output always reviewed).

**Party registration — ratified current scope:** A registration link registers the reservation's **primary guest** for the current Hospitality pilot path. It does not create separate attestations for every member of the party. `reservation_guests` may support a broader party model later, but do not silently expand the legal/registration semantics without a product decision.

---

## 4. Feature Status

### Hospitality (active vertical)

| Feature | Status | Notes |
| --- | --- | --- |
| Reservations list / front desk | `PARTIALLY BUILT` | |
| Create / reissue registration link | `PARTIALLY BUILT` | 256-bit token, SHA-256 hashed at rest, atomic revoke-then-insert. Migration and live function preflight verified; flow not yet exercised in the uninterrupted E2E chain. |
| Public `/register/[token]` route | `PARTIALLY BUILT` | **Never exercised by an anonymous browser as part of the uninterrupted acceptance chain.** Highest-risk unverified surface. |
| Guest registration form + submit | `PARTIALLY BUILT` | Registration migration/live-function preflight passed; user flow still needs uninterrupted E2E verification. |
| Typed attestation persistence | `PARTIALLY BUILT` | Persists `signature_name`, consent timestamp, locale, provenance link, versioned submission. Schema/function preflight verified; actual write still needs uninterrupted E2E verification. |
| Drawn / image signature artifact | `PLANNED` | Not implemented. May not be on the pilot path — confirm the requirement before solving it. |
| Arrivals page + ArrivalsWorkspace | `PARTIALLY BUILT` | Renders Ready-for-check-in state correctly. Has not yet been watched receiving Ready state from an anonymous guest submission in one continuous run. |
| **Front-desk check-in (RPC + UI)** | **`WORKING NOW`** | Verified 2026-09-08. Ready → Check In clicked → RPC succeeded → status became Checked in, registration Complete, dashboard count incremented. Verified as a single step, **not** as part of the full chain. |
| Rooms management UI | `PARTIALLY BUILT` | Single add, bulk numeric-range create, activate/deactivate exist. Not exercised. |
| Property timezone system | `PARTIALLY BUILT` | `businesses.timezone` + `property-time.ts`. 10 unit tests; no npm script runs them (§7). |

### Platform

| Feature | Status | Notes |
| --- | --- | --- |
| CU³ Module Framework | `PARTIALLY BUILT` | Module pages must stay Server Components. |
| Dashboard v1 | `PARTIALLY BUILT` | |
| CU³ dark / glass design pass | `PARTIALLY BUILT` | Login, Nav, Dashboard only. |
| AI calls of any kind | `PLANNED` | **Zero AI implementations in the repo.** |
| Secure AI gateway | `PLANNED` | |
| Revi consolidation (Scal3 brain / Capture voice / ReviSystemV3 face) | `PLANNED` | Integration layer only; none of the three need rebuilding. |
| Company Compass intelligence layer | `PLANNED` | **Explicitly backlogged.** No tables, migrations, or UI without permission. |
| Password reset flow | `PLANNED` | **Required before pilot.** |
| Website publishing | `PLANNED` | Complete feature (validation, generation, AI activation, live URL). Never a boolean toggle. |

---

## 5. Database — Migration Inventory

| Migration | Applied to Supabase | Notes |
| --- | --- | --- |
| `20260816_business_timezone_add.sql` | Yes | `businesses.timezone` added. |
| `20260816_business_timezone_not_null.sql` | Yes — 2026-08-20 | Two-phase timezone migration completed with `NOT NULL`. |
| `20260816_reservation_edit_cancel.sql` | **UNVERIFIED** | Present in authoritative branch. Verify live DB before treating migration state as authoritative. |
| `20260820_registration_links.sql` | Yes — live preflight verified 2026-09-08 | Registration-link objects/functions required by the current flow exist live. |
| `20260827_guest_registration_slice1.sql` | Yes — live preflight verified 2026-09-08 | Registration schema required by the current flow exists live. |
| `20260828_guest_registration_submit.sql` | Yes — live preflight verified 2026-09-08 | Submit-path objects/functions exist live; current hardened definitions supersede earlier function bodies where applicable. |
| `20260829_check_in_reservation.sql` | **Yes — applied 2026-08-29** | Live function verified against the repo file via `pg_get_functiondef()`. The file was restored to the repo on 2026-09-08 **to document what is already live.** It was NOT re-executed. **Do not re-run it.** |
| `20260905_registration_hardening.sql` | Yes — 2026-09-05 | Live hardened definitions verified 2026-09-08. `SECURITY DEFINER` confined to the anonymous resolver/submit entry points; provenance server-derived; versioning backed by a unique index; attestation-critical fields are structurally non-null. |

> **The database has been ahead of the repo before and will be again.** Presence of a migration file does not prove whether it has or has not been applied. Verify live state before changing an `UNVERIFIED` entry.

---

## 6. Known Defects, Limitations & Debt

### Defects

**D1 — `check_in_reservation` has an unguarded UPDATE.** `SEVERITY: MEDIUM`
The function returns `true` unconditionally after the `UPDATE`. Under `SECURITY INVOKER`, Postgres evaluates SELECT policies for the `FOR UPDATE` lock and UPDATE policies separately at write time. A caller who can view but not modify a reservation can get a silent zero-row update and a success response — the UI reports a check-in that never happened. Same class as the guest-update bug previously caught in reservation-edit.

*Fix:* `GET DIAGNOSTICS v_updated = ROW_COUNT;` then raise if `<> 1`. Must ship as a **new migration** — the existing file documents live state and must not be edited.

*Why it didn't surface in testing:* the test account passes the UPDATE policy.

### Limitations / debt

**L1 — No room-occupancy semantics.** Two reservations can be assigned the same room on the same night; nothing rejects it. Explicitly out of Slice 4 scope. Must be resolved before any real hotel uses room assignment.

**L2 — No `checked_in_by`.** Check-in records *when*, not *who*. Audit gap for a hospitality product. Schema change — requires Shannon's approval. Deferrable past pilot.

**L3 — No policy-content snapshot model yet.** `policy_version` is nullable by design. Do not populate a placeholder or synthetic value: that would assert a policy snapshot that was never captured. Before attestations are displayed, reprinted, exported, or treated as legal evidence of exact terms, build the policy-content/version model that can identify the exact text presented to the guest.

**L4 — `registration_link_id` provenance is not structurally required.** `submit_guest_registration` always derives and supplies `registration_link_id` from the validated/locked link, but the column remains nullable to preserve honest provenance for historical rows that could not be backfilled unambiguously. A future write path could therefore create an attestation without link provenance. Before strengthening it, verify no null rows remain that can be truthfully resolved, then use the existing two-phase pattern to add `NOT NULL`. This is a schema change and requires Shannon's approval.

**L5 — Attestation locale is shape-permissive and currently write-only.**
`guest_registration_submissions.locale` is stored as audit/provenance data but is not
currently read by an application rendering path. The normal CUE registration UI submits
only supported base locales (`en`, `es`, `ar`, `vi`): stored guest/reservation language
preferences are reduced to their base language before lookup, and the server action
rejects unsupported locales.

The underlying anonymous `submit_guest_registration` RPC intentionally accepts any
well-formed BCP-47-shaped tag and stores it lowercased. A direct RPC caller could therefore
persist a regional or currently unsupported tag such as `es-mx`.

Before attestation display, reprint, PDF, or export is built, decide how stored tags map
to rendered copy and whether locale should remain caller-supplied or become stronger
server-derived provenance.

**L6 — Root document language is hardcoded to English.**
`src/app/layout.tsx` renders `<html lang="en">`. The public registration page correctly
sets localized `lang` and `dir` on its own page container, including `dir="rtl"` for Arabic,
so RTL presentation is handled locally. Document-level language metadata is still
inaccurate for non-English registration pages and should be corrected before the
multilingual public surface is considered fully hardened.

### Blockers

**B1 — Drawn signature persistence.** `files.uploader_id` is `NOT NULL → auth.users`; an anonymous guest has no row there. **Never use a fake or sentinel UUID** — it corrupts provenance. Typed attestation already persists, so confirm this is actually required before designing around it.

### Documentation debt

**B2 —** Code comments reference `docs/Roadmap.md`, which does not exist. Dangling references.
**B3 —** `Architecture.md` does not exist.

### Rebrand debt

**B4 —** `README.md` still says "Revi — Your AI Employee for Service Businesses."
**B5 —** User-visible "Ask Revi" strings remain in the UI.

### Tooling

**B6 —** `package.json` has only `dev`, `build`, `start`, `lint`. No `test` script, so the `node:test` suite can't gate anything.

### Not verifiable from the repo (by design)

**B7 —** Supabase `service_role` key rotation. Verify in the Supabase and Vercel dashboards only.

---

## 7. Test Inventory

| Suite | Runner | Count | Covers |
| --- | --- | ---: | --- |
| `property-time` | `node:test` | 10 | UTC rollover, LA + New York DST, Phoenix (no DST), 23/24/25-hour days, round-tripping |

**Gap:** no npm script invokes these. Add `"test": "node --test"` before treating them as a gate.

---

## 8. E2E Acceptance Chain — Hospitality

Definition of done for the vertical. Every box in **one uninterrupted run** against real data.

- [ ] Front desk opens a reservation
- [ ] Create registration link
- [ ] Reissue link — old token dead, new token works
- [ ] Anonymous browser (no session) opens the link
- [ ] Expired token fails closed and is non-enumerable
- [ ] Guest submits registration
- [ ] Versioned attestation written with locale, consent timestamp, provenance link
- [ ] Arrivals board reflects the submission
- [ ] Reservation shows eligible for check-in
- [x] **Front desk performs check-in** — verified 2026-09-08, in isolation
- [ ] Checked-in state survives a page refresh
- [ ] Headers confirmed via `curl -sI` on `/register/[token]`: `Cache-Control: no-store`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex, nofollow, noarchive`

**Note:** the check-in step was verified starting from a reservation already in Ready state.
The path *to* that state — link → anonymous guest → submit → arrivals — remains unverified.

---

## 9. Standing Engineering Rules

### Schema

- Never modify schema without Shannon's explicit approval.
- Never insert into `profiles` — the `on_auth_user_created` trigger owns it.
- Two-phase migrations for new `NOT NULL` columns.
- Never use a fake or sentinel UUID to satisfy a constraint.
- Never edit a migration file that has already been applied. Write a new one.

### Security

- Token possession is temporary *authorization*, not authentication. It never inherits business-member capability.
- Registration bearer tokens must be generated and hashed only in server-controlled code. Token generation/hashing modules must remain `server-only` and/or behind `"use server"`; do not move hashing to browser code. The browser necessarily possesses the raw token because it is the bearer credential in `/register/<token>`, but the raw token must never be logged or persisted, and only the SHA-256 hash reaches the database.
- `SECURITY DEFINER` only when the caller genuinely lacks the authority. For atomicity use `SECURITY INVOKER` in a transaction.
- All RPCs: `set search_path to ''` with fully schema-qualified identifiers.
- `REVOKE ... FROM PUBLIC` before any `GRANT ... TO anon` — Postgres inherits PUBLIC grants.
- Every write in an RPC must verify it persisted (`GET DIAGNOSTICS`). A `SELECT` policy passing does not mean the `UPDATE` policy will.
- Public-surface failures must be non-enumerable.
- The submit RPC independently revalidates the token; it never trusts the resolver.
- `robots.txt` must **not** `Disallow: /register/` — that stops crawlers reading the `noindex` header, the opposite of the intent.
- Verify headers with `curl -sI` against real responses. Never assume from config.

### Architecture

- Module pages stay Server Components — `ModuleConfig` carries Lucide icons that can't cross the RSC boundary.
- Locale resolution belongs in the app layer, not in SQL.

### Delivery

- `git apply --check` before every patch. Uploads land with a `(1)` suffix — check the real filename first.
- GPG signing is disabled repo-locally (`git config --local commit.gpgsign false`) due to a Codespaces `403 | Author is invalid` error.
- Measure before patching. Never edit a file from memory.
- Copilot output is reviewed before it lands, always.

---

## 10. Open Product Questions

| Question | Blocks | Status |
| --- | --- | --- |
| Signature provenance model | Drawn signature persistence | Needs full `files` schema + RLS inspection first. |
| Room occupancy / double-booking rules | Rooms + check-in correctness | Deferred out of Slice 4. Must be decided before a real hotel. |
| CU³ nav + capability-registry refactor | — | Deferred until registration slices close; design against the finished Hospitality vertical. |

### Open Product Question — Attestation language provenance

`guest_registration_submissions.locale` is the only caller-supplied field on an otherwise
server-derived attestation record. It is currently write-only, so nothing depends on it.

If attestation display, reprint, or export is built, `locale` becomes an assertion about
which language the guest actually consented in. That assertion should not rest on a value
the browser supplied to an anonymous RPC.

Decide at that point whether locale becomes server-derived — resolved from the reservation
or link record rather than the request — and whether it should be captured alongside a
policy content snapshot (`policy_version`, currently null by design) so the record states
*which text* was agreed to, not merely which language tag was posted.

---

## 11. Update Protocol

Update this file in the **same commit** as the change it describes.

Every revision updates:

1. Authoritative branch, last verified commit, date
2. The verification method actually used
3. Any status transition, with the evidence that justified it

A status moves **up** the ladder only with recorded verification.
It may move **down** at any time, for any reason, without one.
