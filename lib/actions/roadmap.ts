"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Status } from "@/lib/types";

// ──────────────────────────────────────────────
// Validation schemas
// ──────────────────────────────────────────────

const CreateItemSchema = z.object({
  title: z.string().min(1, "Titel is verplicht").max(200),
  description: z.string().max(2000).default(""),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  status: z.enum(["planned", "active", "waiting", "done"]).default("planned"),
  tags: z.array(z.string()).default([]),
});

const UpdateItemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  status: z.enum(["planned", "active", "waiting", "done"]).optional(),
  tags: z.array(z.string()).optional(),
});

const SetStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["planned", "active", "waiting", "done"]),
});

const AddCommentSchema = z.object({
  item_id: z.string().uuid(),
  message: z.string().min(1, "Bericht is verplicht").max(2000),
});

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

async function getAuthUserId(): Promise<string> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

async function logEvent(
  type: "item_created" | "item_updated" | "status_changed" | "comment_added" | "item_deleted",
  actorId: string,
  itemId: string | null,
  payload: Record<string, unknown> = {},
) {
  const supabase = await createServerClient();
  await supabase.from("events").insert({
    type,
    actor_id: actorId,
    item_id: itemId,
    payload,
  });
}

// ──────────────────────────────────────────────
// Actions
// ──────────────────────────────────────────────

export async function createItem(formData: FormData) {
  const userId = await getAuthUserId();
  const supabase = await createServerClient();

  const parsed = CreateItemSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    start_date: formData.get("start_date") || null,
    end_date: formData.get("end_date") || null,
    status: formData.get("status") ?? "planned",
    tags: formData.get("tags")
      ? String(formData.get("tags"))
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data: item, error } = await supabase
    .from("roadmap_items")
    .insert({
      ...parsed.data,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) {
    return { error: { _form: [error.message] } };
  }

  await logEvent("item_created", userId, item.id, { title: parsed.data.title });
  revalidatePath("/dashboard");
  return { success: true, id: item.id };
}

export async function updateItem(id: string, formData: FormData) {
  const userId = await getAuthUserId();
  const supabase = await createServerClient();

  const parsed = UpdateItemSchema.safeParse({
    title: formData.get("title") || undefined,
    description: formData.get("description") !== null ? String(formData.get("description")) : undefined,
    start_date: formData.has("start_date") ? formData.get("start_date") || null : undefined,
    end_date: formData.has("end_date") ? formData.get("end_date") || null : undefined,
    status: formData.get("status") || undefined,
    tags: formData.has("tags")
      ? String(formData.get("tags"))
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // Filter out undefined values
  const updates: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(parsed.data)) {
    if (val !== undefined) updates[key] = val;
  }

  if (Object.keys(updates).length === 0) {
    return { error: { _form: ["Geen wijzigingen opgegeven"] } };
  }

  const { error } = await supabase
    .from("roadmap_items")
    .update(updates)
    .eq("id", id);

  if (error) {
    return { error: { _form: [error.message] } };
  }

  await logEvent("item_updated", userId, id, updates);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function setStatus(id: string, status: Status) {
  const userId = await getAuthUserId();
  const supabase = await createServerClient();

  const parsed = SetStatusSchema.safeParse({ id, status });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from("roadmap_items")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);

  if (error) {
    return { error: { _form: [error.message] } };
  }

  await logEvent("status_changed", userId, id, { status });
  revalidatePath("/dashboard");
  return { success: true };
}

export async function addComment(itemId: string, message: string) {
  const userId = await getAuthUserId();
  const supabase = await createServerClient();

  const parsed = AddCommentSchema.safeParse({ item_id: itemId, message });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from("comments")
    .insert({
      item_id: parsed.data.item_id,
      user_id: userId,
      message: parsed.data.message,
    });

  if (error) {
    return { error: { _form: [error.message] } };
  }

  await logEvent("comment_added", userId, itemId, {
    message: message.slice(0, 200),
  });
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteItem(id: string) {
  const userId = await getAuthUserId();
  const supabase = await createServerClient();

  // Fetch title for the event log before deleting
  const { data: item } = await supabase
    .from("roadmap_items")
    .select("title")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("roadmap_items")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await logEvent("item_deleted", userId, null, {
    deleted_id: id,
    title: item?.title,
  });
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteComment(commentId: string) {
  await getAuthUserId();
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
