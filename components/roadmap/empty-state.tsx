interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "Hier is nog niks!",
  description = "Pas je zoekopdracht of filters aan — of voeg iets nieuws toe 🌟",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-b from-white/60 to-muted/30 p-12 text-center">
      <div className="text-5xl mb-4" aria-hidden>
        Planning
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </div>
  );
}
