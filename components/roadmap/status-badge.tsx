import { Badge } from "@/components/ui/badge";
import {
  STATUS_COLORS,
  STATUS_EMOJI,
  STATUS_LABELS,
  type Status,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        colors.bg,
        colors.text,
        colors.border,
        "font-medium",
        className,
      )}
    >
      <span className="mr-1" aria-hidden>
        {STATUS_EMOJI[status]}
      </span>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
