"use client";

import { AddItemDialog } from "@/components/roadmap/add-item-dialog";
import { ItemDrawer } from "@/components/roadmap/item-drawer";
import { KanbanView } from "@/components/roadmap/kanban-view";
import { ListView } from "@/components/roadmap/list-view";
import { LoadingSkeleton } from "@/components/roadmap/loading-skeleton";
import { SearchAndFilter } from "@/components/roadmap/search-and-filter";
import { TimelineView } from "@/components/roadmap/timeline-view";
import { ViewSwitcher } from "@/components/roadmap/view-switcher";
import { setStatus as setStatusAction } from "@/lib/actions/roadmap";
import type { RoadmapItem, Status, ViewMode } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";

interface DashboardClientProps {
  initialItems: RoadmapItem[];
}

export function DashboardClient({ initialItems }: DashboardClientProps) {
  const router = useRouter();

  // ── State ──────────────────────────────────
  const [items, setItems] = useState(initialItems);
  const [view, setView] = useState<ViewMode>("timeline");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Sync when server re-renders with new data
  if (initialItems !== items && initialItems.length !== items.length) {
    setItems(initialItems);
  }

  // ── Filtering ──────────────────────────────
  const filtered = useMemo(() => {
    let result = items;

    if (statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [items, statusFilter, search]);

  // ── Handlers ───────────────────────────────
  const openDrawer = useCallback((item: RoadmapItem) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedItem(null), 300);
  }, []);

  const handleStatusChange = useCallback(
    (itemId: string, newStatus: Status) => {
      // Optimistic update
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, status: newStatus, updated_at: new Date().toISOString() }
            : i,
        ),
      );

      // Server action
      startTransition(async () => {
        await setStatusAction(itemId, newStatus);
        router.refresh();
      });
    },
    [router],
  );

  const handleDrawerClose = useCallback(() => {
    closeDrawer();
    // Refresh to pick up new comments
    router.refresh();
  }, [closeDrawer, router]);

  // ── Render ─────────────────────────────────
  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ViewSwitcher value={view} onChange={setView} />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchAndFilter
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
          <AddItemDialog />
        </div>
      </div>

      {/* View */}
      <div className="mt-6">
        {isPending ? (
          <LoadingSkeleton />
        ) : (
          <>
            {view === "timeline" && (
              <TimelineView items={filtered} onItemClick={openDrawer} />
            )}
            {view === "kanban" && (
              <KanbanView
                items={filtered}
                onItemClick={openDrawer}
                onStatusChange={handleStatusChange}
              />
            )}
            {view === "list" && (
              <ListView items={filtered} onItemClick={openDrawer} />
            )}
          </>
        )}
      </div>

      {/* Drawer */}
      <ItemDrawer
        item={selectedItem}
        open={drawerOpen}
        onClose={handleDrawerClose}
      />
    </>
  );
}
