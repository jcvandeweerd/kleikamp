// ──────────────────────────────────────────────
// Domain types for the Family New-Build Roadmap
// ──────────────────────────────────────────────

export type Status = "planned" | "active" | "waiting" | "done";

export const STATUS_OPTIONS: Status[] = ["planned", "active", "waiting", "done"];

export const STATUS_LABELS: Record<Status, string> = {
  planned: "Gepland",
  active: "Actief",
  waiting: "Wachten",
  done: "Klaar",
};

/** Emoji per status */
export const STATUS_EMOJI: Record<Status, string> = {
  planned: "📋",
  active: "🔨",
  waiting: "⏳",
  done: "✅",
};

/** Display colours per status – Tailwind class fragments */
export const STATUS_COLORS: Record<
  Status,
  { bg: string; text: string; border: string }
> = {
  planned: {
    bg: "bg-violet-100",
    text: "text-violet-700",
    border: "border-violet-300",
  },
  active: {
    bg: "bg-sky-100",
    text: "text-sky-700",
    border: "border-sky-300",
  },
  waiting: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
  },
  done: {
    bg: "bg-lime-100",
    text: "text-lime-700",
    border: "border-lime-300",
  },
};

export interface Profile {
  id: string;
  name: string;
  surname?: string;
  avatar_url?: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  start_date?: string; // ISO date string
  end_date?: string; // ISO date string
  status: Status;
  tags: string[];
  created_by: Profile;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export interface Comment {
  id: string;
  item_id: string;
  message: string;
  author: Profile;
  created_at: string; // ISO datetime
}

// ──────────────────────────────────────────────
// View types
// ──────────────────────────────────────────────

export type ViewMode = "timeline" | "kanban" | "list";

export type TimelineGrouping = "week" | "month";
