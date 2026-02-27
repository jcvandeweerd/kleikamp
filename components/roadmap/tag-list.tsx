import { Badge } from "@/components/ui/badge";

interface TagListProps {
  tags: string[];
}

export function TagList({ tags }: TagListProps) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs font-normal">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
