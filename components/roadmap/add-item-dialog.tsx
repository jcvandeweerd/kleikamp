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
  SheetTrigger,
} from "@/components/ui/sheet";
import { createItem } from "@/lib/actions/roadmap";
import { STATUS_EMOJI, STATUS_OPTIONS, STATUS_LABELS } from "@/lib/types";
import { plusOneHour } from "@/lib/date-utils";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";

export function AddItemDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
        const result: any = await createItem(formData);
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
        setOpen(false);
        form.reset();
        router.refresh();
      });
    },
    [router],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          className="h-9 bg-linear-to-r from-orange-500 to-rose-500 text-white shadow-sm hover:from-orange-600 hover:to-rose-600"
        >
          <span aria-hidden className="mr-1">
            ✨
          </span>
          Add item
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto"
        aria-describedby="add-item-description"
        elevated
      >
        <SheetHeader>
          <SheetTitle>Nieuw item toevoegen</SheetTitle>
        </SheetHeader>

        <p
          id="add-item-description"
          className="text-muted-foreground mt-1 text-sm px-4"
        >
          Maak een nieuw item aan voor het familieproject.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 px-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="add-title" className="text-xs font-medium">
              Titel *
            </label>
            <Input
              id="add-title"
              name="title"
              required
              placeholder="bijv. Keukentegels kiezen"
              className="text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="add-desc" className="text-xs font-medium">
              Omschrijving
            </label>
            <Textarea
              id="add-desc"
              name="description"
              rows={3}
              placeholder="Optionele details…"
              className="resize-none text-sm"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="add-start" className="text-xs font-medium">
                Startdatum
              </label>
              <Input
                id="add-start"
                name="start_date"
                type="datetime-local"
                onChange={handleStartChange}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="add-end" className="text-xs font-medium">
                Einddatum
              </label>
              <Input
                id="add-end"
                name="end_date"
                type="datetime-local"
                ref={endRef}
                className="text-sm"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label htmlFor="add-status" className="text-xs font-medium">
              Status
            </label>
            <Select name="status" defaultValue="planned">
              <SelectTrigger id="add-status" className="text-sm">
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
            <label htmlFor="add-tags" className="text-xs font-medium">
              Tags
            </label>
            <Input
              id="add-tags"
              name="tags"
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
              onClick={() => setOpen(false)}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600"
            >
              {isPending ? "Aanmaken…" : "Item aanmaken"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
