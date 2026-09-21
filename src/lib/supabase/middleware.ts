import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// NOTE: We intentionally do not pass the Database generic here.
// See src/lib/supabase/client.ts for the full explanation.
export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  if (
    request.nextUrl.pathname === "/company-compass" &&
    request.nextUrl.searchParams.get("demo") === "housecall-pro"
  ) {
    requestHeaders.set("x-cue-public-demo", "housecall-pro");
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Login/signup redirect authenticated users to the dashboard.
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  // Password recovery routes must remain reachable before and after
  // Supabase establishes the recovery session.
  const isPasswordRecoveryRoute =
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  const isRegistrationRoute =
    pathname === "/register" || pathname.startsWith("/register/");

  // Public Housecall Pro demo route. The page itself also verifies demo mode
  // before rendering any authenticated business data.
  const isHousecallProDemo =
    pathname === "/company-compass" &&
    request.nextUrl.searchParams.get("demo") === "housecall-pro";

  // Public routes that anyone (authenticated or not) can access.
  // /auth/* must be public so the callback route can exchange the code BEFORE
  // a session exists — otherwise the proxy would redirect to /login first.
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/demo" ||
    isAuthRoute ||
    isPasswordRecoveryRoute ||
    pathname.startsWith("/auth/") ||
    isRegistrationRoute ||
    isHousecallProDemo;

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
