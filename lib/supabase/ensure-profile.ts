import { createServerClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Ensures a profile row exists for the current authenticated user.
 * Call this from server components/layouts on protected pages.
 *
 * Strategy for admin role:
 *   If env var ADMIN_EMAILS contains the user's email, set role to 'admin'.
 *   Otherwise default to 'family'.
 */
export async function ensureProfile(): Promise<{
  id: string;
  name: string;
  surname: string;
  role: string;
} | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Check if profile exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, name, surname, role")
    .eq("id", user.id)
    .single();

  if (existing) return existing;

  // Derive name from user metadata or email
  const metaName =
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined);
  const metaSurname =
    (user.user_metadata?.surname as string | undefined) ?? "";
  const emailLocal = user.email?.split("@")[0] ?? "User";
  const name = metaName || emailLocal;

  // Determine role
  // First user (bootstrap) or email in ADMIN_EMAILS → admin
  const isBootstrap = user.user_metadata?.is_bootstrap === true;
  const isAdminEmail =
    user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
  const role = isBootstrap || isAdminEmail ? "admin" : "family";

  const { data: profile, error } = await supabase
    .from("profiles")
    .insert({ id: user.id, name, surname: metaSurname, role })
    .select("id, name, surname, role")
    .single();

  if (error) {
    // Race condition: another request inserted it first
    const { data: retry } = await supabase
      .from("profiles")
      .select("id, name, surname, role")
      .eq("id", user.id)
      .single();
    return retry;
  }

  return profile;
}
