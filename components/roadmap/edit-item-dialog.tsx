"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { updateItem } from "@/lib/actions/roadmap";
import {
  STATUS_EMOJI,
  STATUS_OPTIONS,
  STATUS_LABELS,
  type RoadmapItem,
} from "@/lib/types";
import { isoToLocal, plusOneHour } from "@/lib/date-utils";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";

interface EditItemDialogProps {
  item: RoadmapItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditItemDialog({ item, open, onOpenChange }: EditItemDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const handleStartChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val && endRef.current && !endRef.current.value) {
        endRef.current.value = plusOneHour(val);
      }
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      const form = e.currentTarget;
      const formData = new FormData(form);

      startTransition(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = await updateItem(item.id, formData);
        if (result?.error) {
          const msg =
            typeof result.error === "string"
              ? result.error
              : Object.values(result.error as Record<string, string[]>)
                  .flat()
                  .join(", ");
          setError(msg);
          return;
        }
        onOpenChange(false);
        router.refresh();
      });
    },
    [item.id, router, onOpenChange],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto"
        aria-describedby="edit-item-description"
        elevated
      >
        <SheetHeader>
          <SheetTitle>Item bewerken</SheetTitle>
        </SheetHeader>

        <p
          id="edit-item-description"
          className="text-muted-foreground mt-1 text-sm"
        >
          Pas de gegevens van dit item aan.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 px-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="edit-title" className="text-xs font-medium">
              Titel *
            </label>
            <Input
              id="edit-title"
              name="title"
              required
              defaultValue={item.title}
              className="text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="edit-desc" className="text-xs font-medium">
              Omschrijving
            </label>
            <Textarea
              id="edit-desc"
              name="description"
              rows={3}
              defaultValue={item.description}
              className="resize-none text-sm"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="edit-start" className="text-xs font-medium">
                Startdatum
              </label>
              <Input
                id="edit-start"
                name="start_date"
                type="datetime-local"
                defaultValue={isoToLocal(item.start_date)}
                onChange={handleStartChange}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="edit-end" className="text-xs font-medium">
                Einddatum
              </label>
              <Input
                id="edit-end"
                name="end_date"
                type="datetime-local"
                defaultValue={isoToLocal(item.end_date)}
                ref={endRef}
                className="text-sm"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label htmlFor="edit-status" className="text-xs font-medium">
              Status
            </label>
            <Select name="status" defaultValue={item.status}>
              <SelectTrigger id="edit-status" className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_EMOJI[s]} {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label htmlFor="edit-tags" className="text-xs font-medium">
              Tags
            </label>
            <Input
              id="edit-tags"
              name="tags"
              defaultValue={item.tags.join(", ")}
              placeholder="keuken, ontwerp, urgent (kommagescheiden)"
              className="text-sm"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600"
            >
              {isPending ? "Opslaan…" : "Opslaan"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
