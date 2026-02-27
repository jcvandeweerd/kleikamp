"use client";

import { CommentThread } from "@/components/roadmap/comment-thread";
import { EditItemDialog } from "@/components/roadmap/edit-item-dialog";
import { StatusBadge } from "@/components/roadmap/status-badge";
import { TagList } from "@/components/roadmap/tag-list";
import { UserAvatar } from "@/components/roadmap/user-avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatDate, formatDateTime } from "@/lib/date-utils";
import { addComment } from "@/lib/actions/roadmap";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Comment, RoadmapItem } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

interface ItemDrawerProps {
  item: RoadmapItem | null;
  open: boolean;
  onClose: () => void;
}

export function ItemDrawer({ item, open, onClose }: ItemDrawerProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch comments when item changes
  useEffect(() => {
    if (!item) {
      setComments([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const supabase = createBrowserClient();
    supabase
      .from("comments")
      .select("*, profiles:user_id(id, name, avatar_url)")
      .eq("item_id", item.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setComments((data ?? []).map((row: any) => ({
          id: row.id,
          item_id: row.item_id,
          message: row.message,
          author: {
            id: row.profiles?.id ?? row.user_id,
            name: row.profiles?.name ?? "Unknown",            surname: row.profiles?.surname ?? "",            avatar_url: row.profiles?.avatar_url ?? undefined,
          },
          created_at: row.created_at,
        })));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [item]);

  const handleAddComment = useCallback(
    async (message: string) => {
      if (!item) return;
      await addComment(item.id, message);
      // Re-fetch comments
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("comments")
        .select("*, profiles:user_id(id, name, surname, avatar_url)")
        .eq("item_id", item.id)
        .order("created_at", { ascending: true });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setComments((data ?? []).map((row: any) => ({
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
      })));
    },
    [item],
  );

  const [editOpen, setEditOpen] = useState(false);

  if (!item) return null;

  return (
    <>
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        className="w-full sm:max-w-lg overflow-y-auto"
        side="right"
        aria-describedby="item-drawer-description"
      >
        <SheetHeader>
          <SheetTitle className="pr-6 text-base leading-snug">
            {item.title}
          </SheetTitle>
        </SheetHeader>

        <div id="item-drawer-description" className="mt-4 space-y-5 px-4">
          {/* Action buttons */}
          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              ✕ Sluiten
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              ✏️ Bewerken
            </Button>
          </div>

          {/* Status & tags */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={item.status} />
            <TagList tags={item.tags} />
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed">{item.description}</p>

          {/* Dates */}
          {(item.start_date || item.end_date) && (
            <div className="text-muted-foreground space-y-1 text-xs">
              {item.start_date && (
                <p>
                  <span className="font-medium text-foreground">Start:</span>{" "}
                  {formatDate(item.start_date)}
                </p>
              )}
              {item.end_date && (
                <p>
                  <span className="font-medium text-foreground">Eind:</span>{" "}
                  {formatDate(item.end_date)}
                </p>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3">
            <UserAvatar profile={item.created_by} size="md" />
            <div>
              <p className="text-xs font-medium">{[item.created_by.name, item.created_by.surname].filter(Boolean).join(" ")}</p>
              <p className="text-muted-foreground text-[10px]">
                Aangemaakt {formatDateTime(item.created_at)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Comments */}
          {loading ? (
            <p className="text-muted-foreground py-4 text-center text-xs">
              Reacties laden…
            </p>
          ) : (
            <CommentThread
              comments={comments}
              onSubmit={handleAddComment}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>

    <EditItemDialog
      item={item}
      open={editOpen}
      onOpenChange={setEditOpen}
    />
    </>
  );
}
