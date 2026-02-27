"use client";

import { EmptyState } from "@/components/roadmap/empty-state";
import { StatusBadge } from "@/components/roadmap/status-badge";
import { TagList } from "@/components/roadmap/tag-list";
import { UserAvatar } from "@/components/roadmap/user-avatar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date-utils";
import type { RoadmapItem } from "@/lib/types";
import { useState } from "react";

type SortField = "start_date" | "status" | "title" | "tags" | "owner";

interface ListViewProps {
  items: RoadmapItem[];
  onItemClick: (item: RoadmapItem) => void;
}

const STATUS_ORDER = { planned: 0, active: 1, waiting: 2, done: 3 } as const;

export function ListView({ items, onItemClick }: ListViewProps) {
  const [sortField, setSortField] = useState<SortField>("start_date");
  const [sortAsc, setSortAsc] = useState(true);

  if (items.length === 0) {
    return <EmptyState />;
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sorted = [...items].sort((a, b) => {
    let cmp: number;
    switch (sortField) {
      case "start_date": {
        const da = new Date(a.start_date ?? a.created_at).getTime();
        const db = new Date(b.start_date ?? b.created_at).getTime();
        cmp = da - db;
        break;
      }
      case "status":
        cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        break;
      case "title":
        cmp = a.title.localeCompare(b.title, "nl");
        break;
      case "tags":
        cmp = (a.tags[0] ?? "").localeCompare(b.tags[0] ?? "", "nl");
        break;
      case "owner":
        cmp = a.created_by.name.localeCompare(b.created_by.name, "nl");
        break;
      default:
        cmp = 0;
    }
    return sortAsc ? cmp : -cmp;
  });

  const arrow = (field: SortField) => {
    if (sortField !== field) return "";
    return sortAsc ? " ↑" : " ↓";
  };

  return (
    <div className="overflow-x-auto">
      {/* Sort buttons (mobile-friendly) */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium">
          Sorteer op:
        </span>
        {([
          ["title", "Titel"],
          ["start_date", "Datum"],
          ["status", "Status"],
          ["tags", "Tags"],
          ["owner", "Eigenaar"],
        ] as const).map(([field, label]) => (
          <Button
            key={field}
            variant={sortField === field ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => toggleSort(field)}
          >
            {label}{arrow(field)}
          </Button>
        ))}
      </div>

      {/* Table */}
      <table className="w-full text-sm" role="table">
        <thead>
          <tr className="border-b text-left">
            <th
              className="text-muted-foreground cursor-pointer select-none pb-2 pr-4 text-xs font-medium hover:text-foreground"
              onClick={() => toggleSort("title")}
            >
              Titel{arrow("title")}
            </th>
            <th
              className="text-muted-foreground hidden cursor-pointer select-none pb-2 pr-4 text-xs font-medium hover:text-foreground sm:table-cell"
              onClick={() => toggleSort("start_date")}
            >
              Datum{arrow("start_date")}
            </th>
            <th
              className="text-muted-foreground cursor-pointer select-none pb-2 pr-4 text-xs font-medium hover:text-foreground"
              onClick={() => toggleSort("status")}
            >
              Status{arrow("status")}
            </th>
            <th
              className="text-muted-foreground hidden cursor-pointer select-none pb-2 pr-4 text-xs font-medium hover:text-foreground md:table-cell"
              onClick={() => toggleSort("tags")}
            >
              Tags{arrow("tags")}
            </th>
            <th
              className="text-muted-foreground hidden cursor-pointer select-none pb-2 text-xs font-medium hover:text-foreground lg:table-cell"
              onClick={() => toggleSort("owner")}
            >
              Eigenaar{arrow("owner")}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => (
            <tr
              key={item.id}
              className="cursor-pointer border-b transition-colors hover:bg-muted/50 last:border-0"
              role="button"
              tabIndex={0}
              onClick={() => onItemClick(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onItemClick(item);
                }
              }}
            >
              <td className="py-3 pr-4">
                <span className="font-medium">{item.title}</span>
              </td>
              <td className="text-muted-foreground hidden py-3 pr-4 text-xs sm:table-cell">
                {item.start_date ? formatDate(item.start_date) : "—"}
              </td>
              <td className="py-3 pr-4">
                <StatusBadge status={item.status} />
              </td>
              <td className="hidden py-3 pr-4 md:table-cell">
                <TagList tags={item.tags} />
              </td>
              <td className="hidden py-3 lg:table-cell">
                <UserAvatar profile={item.created_by} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
