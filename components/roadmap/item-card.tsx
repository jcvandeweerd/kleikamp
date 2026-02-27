"use client";

import { StatusBadge } from "@/components/roadmap/status-badge";
import { TagList } from "@/components/roadmap/tag-list";
import { UserAvatar } from "@/components/roadmap/user-avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { RoadmapItem } from "@/lib/types";
import { formatDate } from "@/lib/date-utils";

/** Playful emoji per tag category */
const TAG_EMOJI: Record<string, string> = {
  construction: "🚧",
  foundation: "🧱",
  framing: "🏗️",
  electrical: "⚡",
  plumbing: "🚰",
  installation: "🔧",
  design: "🎨",
  kitchen: "🍳",
  bathroom: "🚿",
  garden: "🌻",
  insulation: "🧣",
  interior: "🖼️",
  admin: "📄",
  permits: "📝",
};

function getItemEmoji(tags: string[]): string {
  for (const tag of tags) {
    if (TAG_EMOJI[tag]) return TAG_EMOJI[tag];
  }
  return "📌";
}

interface ItemCardProps {
  item: RoadmapItem;
  onClick?: (item: RoadmapItem) => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  return (
    <Card
      className="cursor-pointer border-transparent bg-white/80 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"
      role="button"
      tabIndex={0}
      aria-label={`Details openen voor ${item.title}`}
      onClick={() => onClick?.(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(item);
        }
      }}
    >
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              {getItemEmoji(item.tags)}
            </span>
            <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
          </div>
          <StatusBadge status={item.status} />
        </div>

        <p className="text-muted-foreground line-clamp-2 text-xs">
          {item.description}
        </p>

        {(item.start_date || item.end_date) && (
          <p className="text-muted-foreground text-xs">
            📆{" "}
            {item.start_date && formatDate(item.start_date)}
            {item.start_date && item.end_date && " → "}
            {item.end_date && formatDate(item.end_date)}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <TagList tags={item.tags} />
          <UserAvatar profile={item.created_by} />
        </div>
      </CardContent>
    </Card>
  );
}
