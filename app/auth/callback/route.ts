import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Auth callback route — exchanges the code from the magic link for
 * a session and redirects to the dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If something went wrong, redirect back to login
  return NextResponse.redirect(`${origin}/auth/login`);
}
