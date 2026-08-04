---
name: Next.js proxy convention
description: Next.js 16+ renamed middleware.ts to proxy.ts; export name changed from middleware to proxy
---

# Next.js proxy convention (Next.js 16+)

## The rule
Route protection / session refresh logic lives in `src/proxy.ts`, NOT `src/middleware.ts`.

**Why:** Next.js 16 deprecated the `middleware` file convention. The replacement is a `proxy` file convention. The build will warn and eventually break if `middleware.ts` is used.

**How to apply:**
- File: `src/proxy.ts`
- Export: `export async function proxy(request: NextRequest) { ... }`
- Config: `export const config = { matcher: [...] }` (same as before)
- The underlying session logic stays in `src/lib/supabase/middleware.ts` (that filename is fine — it's not a Next.js convention file).
