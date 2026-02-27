"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ──────────────────────────────────────────────
// Validation schemas
// ──────────────────────────────────────────────

const InviteSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
});

const UpdateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "family"]),
});

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

async function requireAdmin(): Promise<string> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Niet ingelogd");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Geen beheerdersrechten");
  }

  return user.id;
}

// ──────────────────────────────────────────────
// Actions
// ──────────────────────────────────────────────

/**
 * Create an invite for a family member.
 * Returns the invite token (to build the registration URL).
 */
export async function createInvite(formData: FormData) {
  const adminId = await requireAdmin();
  const supabase = await createServerClient();

  const parsed = InviteSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { email } = parsed.data;

  // Check if email is already registered
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .limit(1);

  // Check by looking through auth — we'll check profiles indirectly
  // Just check if there's already a pending invite for this email
  const { data: existingInvite } = await supabase
    .from("invites")
    .select("id, accepted_at, expires_at")
    .eq("email", email.toLowerCase())
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .limit(1);

  if (existingInvite && existingInvite.length > 0) {
    return { error: { email: ["Er staat al een openstaande uitnodiging voor dit e-mailadres."] } };
  }

  const { data: invite, error } = await supabase
    .from("invites")
    .insert({
      email: email.toLowerCase(),
      invited_by: adminId,
    })
    .select("id, token")
    .single();

  if (error) {
    return { error: { _form: [error.message] } };
  }

  revalidatePath("/dashboard/admin");
  return { success: true, token: invite.token };
}

/**
 * Get all family members (profiles).
 */
export async function getMembers() {
  await requireAdmin();
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, surname, role, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Get all invites.
 */
export async function getInvites() {
  await requireAdmin();
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("invites")
    .select("id, email, token, accepted_at, expires_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Update a user's role (admin ↔ family).
 */
export async function updateMemberRole(formData: FormData) {
  await requireAdmin();
  const supabase = await createServerClient();

  const parsed = UpdateRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.userId);

  if (error) {
    return { error: { _form: [error.message] } };
  }

  revalidatePath("/dashboard/admin");
  return { success: true };
}

/**
 * Revoke (delete) a pending invite.
 */
export async function revokeInvite(inviteId: string) {
  await requireAdmin();
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("invites")
    .delete()
    .eq("id", inviteId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/admin");
  return { success: true };
}
