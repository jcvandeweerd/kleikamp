"use client";

import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

/**
 * Creates a Supabase client for use in Client Components.
 * Re-uses the same instance across renders (singleton).
 */
export function createBrowserClient() {
  return _createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
