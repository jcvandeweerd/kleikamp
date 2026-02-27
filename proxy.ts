import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy that:
 * 1. Refreshes the Supabase auth session on every request (keeps cookies alive)
 * 2. Protects /(app)/* routes — redirects to /auth/login when unauthenticated
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Refresh the session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes: everything under /(app) which maps to /dashboard, etc.
  const isProtected =
    pathname.startsWith("/dashboard") || pathname === "/";

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged-in user visits /auth/login, redirect to dashboard
  if (pathname.startsWith("/auth/login") && user) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashUrl);
  }

  // If logged-in user visits /auth/register, redirect to dashboard
  if (pathname.startsWith("/auth/register") && user) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
