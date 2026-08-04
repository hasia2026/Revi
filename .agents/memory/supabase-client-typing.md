---
name: Supabase client typing workaround
description: Why we don't pass Database generic to createBrowserClient/createServerClient, and how to keep type safety
---

# Supabase client typing under TypeScript 5.9

## The rule
Do NOT pass `<Database>` generic to `createBrowserClient` or `createServerClient` in this project.

**Why:** `@supabase/postgrest-js@2.109.0` uses complex template-literal string parsing for `.select("col1, col2")` calls. Under TypeScript 5.9 strict mode, this parser generates `SelectQueryError<...>` for both partial column selects AND relationship join selects (e.g. `select("businesses(id, name)")`). The PostgrestFilterBuilder then maps `SelectQueryError` → `data: never`, causing every query result to be un-usable.

The `GenericSchema` check itself passes fine — the issue is solely in the select-string type parser behavior at TS 5.9.

**How to apply:**
- Clients in `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts` call `createBrowserClient()` / `createServerClient()` without generics → query results are typed as `any`.
- For prop-level type safety, annotate variables explicitly: `const data = res.data as ProfileRow | null`.
- For JOIN results, use `as unknown as T` to bypass TypeScript's overlap check.
- The `Database` type in `src/types/database.ts` remains available for explicit annotations throughout components.

**Cookie handler types:** Without the Database generic, `setAll`'s parameter `cookiesToSet` has no inferred type. Import `CookieOptions` from `@supabase/ssr` and annotate: `setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[])`.
