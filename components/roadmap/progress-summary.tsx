import {
  STATUS_EMOJI,
  STATUS_LABELS,
  STATUS_OPTIONS,
  type RoadmapItem,
} from "@/lib/types";

interface ProgressSummaryProps {
  items: RoadmapItem[];
}

/**
 * A fun row of status counts with emoji.
 */
export function ProgressSummary({ items }: ProgressSummaryProps) {
  const counts = STATUS_OPTIONS.map((s) => ({
    status: s,
    count: items.filter((i) => i.status === s).length,
  }));

  const total = items.length;
  const doneCount = counts.find((c) => c.status === "done")?.count ?? 0;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Totale voortgang</span>
          <span className="text-muted-foreground">{pct}% klaar</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-lime-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        {counts.map(({ status, count }) => (
          <div
            key={status}
            className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium shadow-sm"
          >
            <span aria-hidden>{STATUS_EMOJI[status]}</span>
            <span>{count}</span>
            <span className="text-muted-foreground">
              {STATUS_LABELS[status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
