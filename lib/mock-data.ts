// ──────────────────────────────────────────────
// Mock data – replace with Supabase queries later
// ──────────────────────────────────────────────
import type { Comment, Profile, RoadmapItem } from "@/lib/types";

// ── Profiles ─────────────────────────────────
export const profiles: Profile[] = [
  { id: "p1", name: "Jan", avatar_url: undefined },
  { id: "p2", name: "Lisa", avatar_url: undefined },
  { id: "p3", name: "Tom", avatar_url: undefined },
];

// ── Roadmap Items ────────────────────────────
export const roadmapItems: RoadmapItem[] = [
  {
    id: "r1",
    title: "Foundation pouring",
    description:
      "Excavate and pour the reinforced concrete foundation slab for the main house.",
    start_date: "2026-03-02",
    end_date: "2026-03-13",
    status: "done",
    tags: ["construction", "foundation"],
    created_by: profiles[0],
    created_at: "2026-01-10T09:00:00Z",
    updated_at: "2026-03-13T17:00:00Z",
  },
  {
    id: "r2",
    title: "Framing & roof structure",
    description:
      "Erect timber frame walls and install the prefab roof trusses.",
    start_date: "2026-03-16",
    end_date: "2026-04-10",
    status: "active",
    tags: ["construction", "framing"],
    created_by: profiles[0],
    created_at: "2026-01-10T09:05:00Z",
    updated_at: "2026-03-18T08:30:00Z",
  },
  {
    id: "r3",
    title: "Electrical rough-in",
    description:
      "Run electrical wiring through walls and ceilings before drywall.",
    start_date: "2026-04-13",
    end_date: "2026-04-24",
    status: "planned",
    tags: ["electrical", "installation"],
    created_by: profiles[1],
    created_at: "2026-01-12T10:00:00Z",
    updated_at: "2026-01-12T10:00:00Z",
  },
  {
    id: "r4",
    title: "Plumbing rough-in",
    description:
      "Install supply and drain pipes for kitchen, bathrooms and laundry.",
    start_date: "2026-04-13",
    end_date: "2026-04-24",
    status: "planned",
    tags: ["plumbing", "installation"],
    created_by: profiles[1],
    created_at: "2026-01-12T10:05:00Z",
    updated_at: "2026-01-12T10:05:00Z",
  },
  {
    id: "r5",
    title: "Kitchen design finalisation",
    description:
      "Choose cabinets, countertops, appliances and confirm layout with the kitchen supplier.",
    status: "waiting",
    tags: ["design", "kitchen"],
    created_by: profiles[2],
    created_at: "2026-02-01T14:00:00Z",
    updated_at: "2026-02-20T11:00:00Z",
  },
  {
    id: "r6",
    title: "Bathroom tile selection",
    description:
      "Visit showroom and pick floor & wall tiles for all three bathrooms.",
    status: "waiting",
    tags: ["design", "bathroom"],
    created_by: profiles[2],
    created_at: "2026-02-01T14:30:00Z",
    updated_at: "2026-02-15T09:00:00Z",
  },
  {
    id: "r7",
    title: "Insulation & vapour barrier",
    description:
      "Install wall and roof insulation plus vapour barrier before interior finishing.",
    start_date: "2026-04-27",
    end_date: "2026-05-08",
    status: "planned",
    tags: ["construction", "insulation"],
    created_by: profiles[0],
    created_at: "2026-01-15T08:00:00Z",
    updated_at: "2026-01-15T08:00:00Z",
  },
  {
    id: "r8",
    title: "Drywall & plastering",
    description: "Hang drywall sheets and apply plaster finishing coats.",
    start_date: "2026-05-11",
    end_date: "2026-05-29",
    status: "planned",
    tags: ["construction", "interior"],
    created_by: profiles[0],
    created_at: "2026-01-15T08:15:00Z",
    updated_at: "2026-01-15T08:15:00Z",
  },
  {
    id: "r9",
    title: "Garden landscaping plan",
    description:
      "Design the garden layout including patio, lawn areas, and planting beds.",
    status: "planned",
    tags: ["garden", "design"],
    created_by: profiles[2],
    created_at: "2026-02-10T16:00:00Z",
    updated_at: "2026-02-10T16:00:00Z",
  },
  {
    id: "r10",
    title: "Building permit application",
    description: "Submit all required documents to the municipality for the building permit.",
    start_date: "2026-01-20",
    end_date: "2026-02-14",
    status: "done",
    tags: ["admin", "permits"],
    created_by: profiles[0],
    created_at: "2026-01-05T09:00:00Z",
    updated_at: "2026-02-14T16:00:00Z",
  },
];

// ── Comments ─────────────────────────────────
export const comments: Comment[] = [
  {
    id: "c1",
    item_id: "r1",
    message: "Concrete has cured nicely – inspector approved!",
    author: profiles[0],
    created_at: "2026-03-13T16:00:00Z",
  },
  {
    id: "c2",
    item_id: "r2",
    message: "First batch of trusses delivered this morning.",
    author: profiles[0],
    created_at: "2026-03-17T08:00:00Z",
  },
  {
    id: "c3",
    item_id: "r2",
    message: "Weather looks good for the rest of the week 🌤️",
    author: profiles[1],
    created_at: "2026-03-17T09:30:00Z",
  },
  {
    id: "c4",
    item_id: "r5",
    message: "Waiting on the revised quote from the supplier.",
    author: profiles[2],
    created_at: "2026-02-20T11:00:00Z",
  },
  {
    id: "c5",
    item_id: "r5",
    message: "Can we schedule a showroom visit for Saturday?",
    author: profiles[1],
    created_at: "2026-02-21T18:00:00Z",
  },
  {
    id: "c6",
    item_id: "r10",
    message: "Permit approved – we're good to go!",
    author: profiles[0],
    created_at: "2026-02-14T15:30:00Z",
  },
];

// ── Data-access helpers ──────────────────────
// These mirror future Supabase calls. Replace the body
// with `supabase.from(…).select(…)` when ready.

export function getItems(): RoadmapItem[] {
  return roadmapItems;
}

export function getItemById(id: string): RoadmapItem | undefined {
  return roadmapItems.find((i) => i.id === id);
}

export function getCommentsForItem(itemId: string): Comment[] {
  return comments.filter((c) => c.item_id === itemId);
}

export function getAllComments(): Comment[] {
  return comments;
}

export function getProfiles(): Profile[] {
  return profiles;
}
