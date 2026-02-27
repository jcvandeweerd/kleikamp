import { createServerClient } from "@/lib/supabase/server";
import type { Comment, Profile, RoadmapItem } from "@/lib/types";

// ──────────────────────────────────────────────
// Server-side data queries
// Replace mock-data.ts reads — called from Server Components
// ──────────────────────────────────────────────

/** Map a Supabase roadmap_items row (with joined profile) to our RoadmapItem type */
function toRoadmapItem(row: {
  id: string;
  title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  profiles: { id: string; name: string; surname: string; avatar_url: string | null } | null;
}): RoadmapItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    start_date: row.start_date ?? undefined,
    end_date: row.end_date ?? undefined,
    status: row.status as RoadmapItem["status"],
    tags: row.tags,
    created_by: {
      id: row.profiles?.id ?? row.created_by,
      name: row.profiles?.name ?? "Unknown",
      surname: row.profiles?.surname ?? "",
      avatar_url: row.profiles?.avatar_url ?? undefined,
    },
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** Fetch all roadmap items ordered by start_date, then created_at */
export async function getItems(): Promise<RoadmapItem[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("roadmap_items")
    .select("*, profiles:created_by(id, name, surname, avatar_url)")
    .order("start_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getItems error:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => toRoadmapItem(row));
}

/** Fetch comments for a specific item, ordered by created_at asc */
export async function getCommentsForItem(itemId: string): Promise<Comment[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles:user_id(id, name, surname, avatar_url)")
    .eq("item_id", itemId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getCommentsForItem error:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    item_id: row.item_id,
    message: row.message,
    author: {
      id: row.profiles?.id ?? row.user_id,
      name: row.profiles?.name ?? "Unknown",
      surname: row.profiles?.surname ?? "",
      avatar_url: row.profiles?.avatar_url ?? undefined,
    },
    created_at: row.created_at,
  }));
}

/** Fetch last N events with actor profile for the activity feed */
export async function getRecentEvents(limit = 20): Promise<
  {
    id: string;
    type: string;
    actor: Profile;
    item_id: string | null;
    payload: Record<string, unknown>;
    created_at: string;
  }[]
> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, profiles:actor_id(id, name, surname, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentEvents error:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    type: row.type,
    actor: {
      id: row.profiles?.id ?? row.actor_id,
      name: row.profiles?.name ?? "Unknown",
      surname: row.profiles?.surname ?? "",
      avatar_url: row.profiles?.avatar_url ?? undefined,
    },
    item_id: row.item_id,
    payload: (row.payload as Record<string, unknown>) ?? {},
    created_at: row.created_at,
  }));
}

/** Fetch all profiles */
export async function getProfiles(): Promise<Profile[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, name, surname, avatar_url")
    .order("name");

  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    surname: p.surname ?? "",
    avatar_url: p.avatar_url ?? undefined,
  }));
}
