"use client";

import { EmptyState } from "@/components/roadmap/empty-state";
import { ItemCard } from "@/components/roadmap/item-card";
import { Separator } from "@/components/ui/separator";
import { formatMonthLabel, getMonthKey, getWeek } from "@/lib/date-utils";
import type { RoadmapItem, TimelineGrouping } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TimelineViewProps {
  items: RoadmapItem[];
  onItemClick: (item: RoadmapItem) => void;
}

function groupByMonth(items: RoadmapItem[], asc: boolean): Map<string, RoadmapItem[]> {
  const groups = new Map<string, RoadmapItem[]>();
  const dir = asc ? 1 : -1;
  const sorted = [...items].sort(
    (a, b) =>
      dir *
      (new Date(a.start_date ?? a.created_at).getTime() -
        new Date(b.start_date ?? b.created_at).getTime()),
  );

  for (const item of sorted) {
    const key = getMonthKey(item.start_date ?? item.created_at);
    const existing = groups.get(key) ?? [];
    existing.push(item);
    groups.set(key, existing);
  }
  return groups;
}

function groupByWeek(items: RoadmapItem[], asc: boolean): Map<string, RoadmapItem[]> {
  const groups = new Map<string, RoadmapItem[]>();
  const dir = asc ? 1 : -1;
  const sorted = [...items].sort(
    (a, b) =>
      dir *
      (new Date(a.start_date ?? a.created_at).getTime() -
        new Date(b.start_date ?? b.created_at).getTime()),
  );

  for (const item of sorted) {
    const { week, year } = getWeek(item.start_date ?? item.created_at);
    const key = `${year}-W${String(week).padStart(2, "0")}`;
    const existing = groups.get(key) ?? [];
    existing.push(item);
    groups.set(key, existing);
  }
  return groups;
}

export function TimelineView({ items, onItemClick }: TimelineViewProps) {
  const [grouping, setGrouping] = useState<TimelineGrouping>("month");
  const [sortAsc, setSortAsc] = useState(false);

  if (items.length === 0) {
    return <EmptyState />;
  }

  const groups =
    grouping === "month" ? groupByMonth(items, sortAsc) : groupByWeek(items, sortAsc);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium">
          Groepeer op:
        </span>
        <Button
          variant={grouping === "month" ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setGrouping("month")}
        >
          Maand
        </Button>
        <Button
          variant={grouping === "week" ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setGrouping("week")}
        >
          Week
        </Button>
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setSortAsc(!sortAsc)}
        >
          {sortAsc ? "Oud → Nieuw ↑" : "Nieuw → Oud ↓"}
        </Button>
      </div>

      {[...groups.entries()].map(([key, groupItems]) => (
        <section key={key} className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold">
              {grouping === "month" ? formatMonthLabel(key) : key}
            </h3>
            <Separator className="flex-1" />
          </div>

          {/* Range bars for items with start & end dates */}
          <div className="space-y-2">
            {groupItems.map((item) => (
              <div key={item.id} className="space-y-1">
                {item.start_date && item.end_date && (
                  <RangeBar
                    startDate={item.start_date}
                    endDate={item.end_date}
                    status={item.status}
                  />
                )}
                <ItemCard item={item} onClick={onItemClick} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ── Range bar ────────────────────────────────

function RangeBar({
  startDate,
  endDate,
  status,
}: {
  startDate: string;
  endDate: string;
  status: RoadmapItem["status"];
}) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );

  const colorMap: Record<string, string> = {
    planned: "bg-violet-400",
    active: "bg-sky-400",
    waiting: "bg-orange-400",
    done: "bg-lime-400",
  };

  return (
    <div className="flex items-center gap-2 px-1">
      <span className="text-muted-foreground min-w-[60px] text-[10px]">
        {days} dag{days !== 1 ? "en" : ""}
      </span>
      <div className="h-2 flex-1 rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${colorMap[status]}`}
          style={{ width: `${Math.min(100, days * 4)}%` }}
        />
      </div>
    </div>
  );
}
