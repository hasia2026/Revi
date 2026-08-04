import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

/**
 * Handles the Supabase email-confirmation / OAuth callback.
 *
 * Supabase sends the user here with ?code=... (PKCE flow).
 * We exchange the code for a session, create the profile row if it doesn't
 * exist yet, and redirect to the intended destination (default: /setup).
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/setup";
  const origin = requestUrl.origin;

  if (!code) {
    // No code — just redirect (handles token-hash flows that don't need exchange)
    return NextResponse.redirect(`${origin}${next}`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore — cookies written to the redirect response below
          }
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (!error && user) {
    // Create / update the profile row so the dashboard never 404s on it.
    // Uses upsert so a concurrent DB trigger won't cause a duplicate-key error.
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name:
          (user.user_metadata?.full_name as string | undefined) ?? null,
      },
      { onConflict: "id" }
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
