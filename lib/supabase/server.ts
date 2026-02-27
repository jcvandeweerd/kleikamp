import { createServerClient as _createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

/**
 * Creates a Supabase client for use in Server Components, Route Handlers,
 * and Server Actions. Reads/writes auth cookies automatically.
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return _createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — cookies are read-only.
            // The proxy will refresh the session for us.
          }
        },
      },
    },
  );
}
