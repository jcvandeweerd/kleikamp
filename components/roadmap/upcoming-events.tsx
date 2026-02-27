import { StatusBadge } from "@/components/roadmap/status-badge";
import { UserAvatar } from "@/components/roadmap/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/date-utils";
import type { RoadmapItem } from "@/lib/types";

interface UpcomingEventsProps {
  items: RoadmapItem[];
}

/**
 * Shows the next few active/planned items sorted by start_date.
 * Rendered as a Server Component – no interactivity needed.
 */
export function UpcomingEvents({ items }: UpcomingEventsProps) {
  const upcoming = items
    .filter(
      (i) =>
        (i.status === "active" || i.status === "planned") && i.start_date,
    )
    .sort(
      (a, b) =>
        new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime(),
    )
    .slice(0, 4);

  return (
    <Card className="border-none bg-gradient-to-br from-sky-50 to-violet-50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span aria-hidden>📅</span>
          Binnenkort
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nog niks gepland — tijd om te plannen! 🎉
          </p>
        ) : (
          upcoming.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg bg-white/60 px-3 py-2"
            >
              <UserAvatar profile={item.created_by} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="text-muted-foreground text-xs">
                  {formatDate(item.start_date!)}
                  {item.end_date && ` → ${formatDate(item.end_date)}`}
                </p>
              </div>
              <StatusBadge status={item.status} className="shrink-0" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
