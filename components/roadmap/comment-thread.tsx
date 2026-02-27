"use client";

import { UserAvatar } from "@/components/roadmap/user-avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Comment } from "@/lib/types";
import { formatDateTime } from "@/lib/date-utils";
import { useState } from "react";

interface CommentThreadProps {
  /** Current list of comments – designed to accept live updates from a realtime subscription */
  comments: Comment[];
  /** Called when the user submits a new comment */
  onSubmit?: (message: string) => void | Promise<void>;
}

export function CommentThread({ comments, onSubmit }: CommentThreadProps) {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onSubmit?.(trimmed);
      setDraft("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-semibold">
        Comments{" "}
        <span className="text-muted-foreground font-normal">
          ({comments.length})
        </span>
      </h4>

      <ScrollArea className="max-h-[320px] pr-2">
        {comments.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-xs">
            Nog geen reacties. Begin het gesprek!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <article key={c.id} className="flex gap-3">
                <UserAvatar profile={c.author} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium">
                      {[c.author.name, c.author.surname].filter(Boolean).join(" ")}
                    </span>
                    <time className="text-muted-foreground text-[10px]">
                      {formatDateTime(c.created_at)}
                    </time>
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed">{c.message}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </ScrollArea>

      <Separator />

      {/* Composer */}
      <div className="space-y-2">
        <Textarea
          placeholder="Schrijf een reactie…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          className="resize-none text-sm"
          aria-label="Reactie"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-[10px]">
            ⌘ + Enter om te versturen
          </p>
          <Button
            size="sm"
            className="h-8 text-xs"
            disabled={!draft.trim() || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Verzenden…" : "Verstuur"}
          </Button>
        </div>
      </div>
    </div>
  );
}
