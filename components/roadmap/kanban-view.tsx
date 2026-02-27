"use client";

import { EmptyState } from "@/components/roadmap/empty-state";
import { ItemCard } from "@/components/roadmap/item-card";
import { StatusBadge } from "@/components/roadmap/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  STATUS_LABELS,
  STATUS_OPTIONS,
  type RoadmapItem,
  type Status,
} from "@/lib/types";

interface KanbanViewProps {
  items: RoadmapItem[];
  onItemClick: (item: RoadmapItem) => void;
  onStatusChange: (itemId: string, newStatus: Status) => void;
}

export function KanbanView({
  items,
  onItemClick,
  onStatusChange,
}: KanbanViewProps) {
  if (items.length === 0) {
    return <EmptyState />;
  }

  const columns = STATUS_OPTIONS.map((status) => ({
    status,
    items: items.filter((i) => i.status === status),
  }));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {columns.map((col) => (
        <div key={col.status} className="space-y-3">
          <div className="flex items-center justify-between">
            <StatusBadge status={col.status} />
            <span className="text-muted-foreground text-xs">
              {col.items.length}
            </span>
          </div>

          <div className="space-y-2">
            {col.items.map((item) => (
              <div key={item.id} className="space-y-1">
                <ItemCard item={item} onClick={onItemClick} />
                <QuickStatusChange
                  currentStatus={item.status}
                  onStatusChange={(s) => onStatusChange(item.id, s)}
                />
              </div>
            ))}

            {col.items.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-primary/10 bg-white/40 p-6 text-center">
                <p className="text-muted-foreground text-xs">
                  Nog geen {STATUS_LABELS[col.status].toLowerCase()} items ✨
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickStatusChange({
  currentStatus,
  onStatusChange,
}: {
  currentStatus: Status;
  onStatusChange: (s: Status) => void;
}) {
  return (
    <Select value={currentStatus} onValueChange={(v) => onStatusChange(v as Status)}>
      <SelectTrigger
        className="h-7 text-xs"
        aria-label="Status wijzigen"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            {STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
