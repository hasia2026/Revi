import { createBrowserClient } from "@supabase/ssr";

// NOTE: We intentionally do not pass the Database generic here.
// @supabase/postgrest-js@2.109.0's select-string type parser generates
// SelectQueryError → data:never under TypeScript 5.9 strict mode for
// both partial column selects and relationship joins. Dropping the generic
// makes query results `any`-typed at the client level; components that need
// strong types should annotate their variables using types from
// src/types/database.ts directly (e.g. `const data = res.data as ProfileRow`).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
