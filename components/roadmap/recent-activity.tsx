import { UserAvatar } from "@/components/roadmap/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/lib/types";

// ── Event-based feed (wired to Supabase events table) ────────

interface EventRow {
  id: string;
  type: string;
  actor: Profile;
  item_id: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

interface RecentActivityFeedProps {
  events: EventRow[];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "zojuist";
  if (mins < 60) return `${mins}m geleden`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}u geleden`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d geleden`;
  return `${Math.floor(days / 7)}w geleden`;
}

const emojiMap: Record<string, string> = {
  item_created: "🆕",
  item_updated: "📝",
  status_changed: "🔄",
  comment_added: "💬",
  item_deleted: "🗑️",
};

function eventLabel(type: string, payload: Record<string, unknown>): string {
  switch (type) {
    case "item_created":
      return `"${payload.title ?? "item"}" aangemaakt`;
    case "item_updated":
      return `Een item bijgewerkt`;
    case "status_changed":
      return `Status gewijzigd → ${payload.status ?? "onbekend"}`;
    case "comment_added":
      return String(payload.message ?? "Reactie geplaatst").slice(0, 100);
    case "item_deleted":
      return `"${payload.title ?? "item"}" verwijderd`;
    default:
      return type.replace(/_/g, " ");
  }
}

/**
 * Shows a feed of recent events from the events table.
 * Server Component — designed to accept realtime data later.
 */
export function RecentActivityFeed({ events }: RecentActivityFeedProps) {
  const recent = events.slice(0, 5);

  return (
    <Card className="border-none bg-gradient-to-br from-orange-50 to-rose-50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span aria-hidden>⚡</span>
          Recente Activiteit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recent.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nog geen activiteit — laten we beginnen! 🚀
          </p>
        ) : (
          recent.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 rounded-lg bg-white/60 px-3 py-2"
            >
              <span className="mt-0.5 text-base" aria-hidden>
                {emojiMap[event.type] ?? "📌"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <UserAvatar profile={event.actor} />
                  <span className="text-xs font-medium">
                    {event.actor.name}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    {timeAgo(event.created_at)}
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5 line-clamp-1 text-sm">
                  {eventLabel(event.type, event.payload)}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
