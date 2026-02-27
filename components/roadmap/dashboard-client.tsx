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
import { createBrowserClient } from "@/lib/supabase/client";
import type { RoadmapItem, Status, ViewMode } from "@/lib/types";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

interface DashboardClientProps {
  initialItems: RoadmapItem[];
}

export function DashboardClient({ initialItems }: DashboardClientProps) {
  // ── State ──────────────────────────────────
  const [items, setItems] = useState(initialItems);
  const [view, setView] = useState<ViewMode>("timeline");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Derive selectedItem from the items array so it auto-updates
  const selectedItem = useMemo(
    () => (selectedItemId ? items.find((i) => i.id === selectedItemId) ?? null : null),
    [items, selectedItemId],
  );

  // Sync when server re-renders with new data
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // ── Realtime subscription ──────────────────
  useEffect(() => {
    const supabase = createBrowserClient();

    const channel = supabase
      .channel("roadmap-items-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "roadmap_items" },
        async (payload) => {
          if (payload.eventType === "UPDATE") {
            // Merge changed columns, preserve the joined profile
            const row = payload.new as Record<string, unknown>;
            setItems((prev) =>
              prev.map((item) => {
                if (item.id !== row.id) return item;
                return {
                  ...item,
                  title: row.title as string,
                  description: row.description as string,
                  start_date: (row.start_date as string) ?? undefined,
                  end_date: (row.end_date as string) ?? undefined,
                  status: row.status as Status,
                  tags: row.tags as string[],
                  updated_at: row.updated_at as string,
                };
              }),
            );
          } else if (payload.eventType === "INSERT") {
            // Fetch full item with profile join
            const newId = (payload.new as { id: string }).id;
            const { data } = await supabase
              .from("roadmap_items")
              .select("*, profiles:created_by(id, name, surname, avatar_url)")
              .eq("id", newId)
              .single();

            if (data) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const row = data as any;
              const newItem: RoadmapItem = {
                id: row.id,
                title: row.title,
                description: row.description,
                start_date: row.start_date ?? undefined,
                end_date: row.end_date ?? undefined,
                status: row.status as Status,
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
              setItems((prev) => {
                if (prev.some((i) => i.id === newItem.id)) return prev;
                return [...prev, newItem];
              });
            }
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as { id: string }).id;
            setItems((prev) => prev.filter((i) => i.id !== deletedId));
            setSelectedItemId((prev) => (prev === deletedId ? null : prev));
            if (selectedItemId === deletedId) setDrawerOpen(false);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    setSelectedItemId(item.id);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedItemId(null), 300);
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

      // Server action (realtime will confirm the update)
      startTransition(async () => {
        await setStatusAction(itemId, newStatus);
      });
    },
    [],
  );

  const handleDrawerClose = useCallback(() => {
    closeDrawer();
  }, [closeDrawer]);

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
