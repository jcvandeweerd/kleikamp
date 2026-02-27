"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ViewMode } from "@/lib/types";

interface ViewSwitcherProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as ViewMode)}
      className="w-auto"
    >
      <TabsList className="h-9">
        <TabsTrigger value="timeline" className="text-xs sm:text-sm">
          Tijdlijn
        </TabsTrigger>
        <TabsTrigger value="kanban" className="text-xs sm:text-sm">
          Kanban
        </TabsTrigger>
        <TabsTrigger value="list" className="text-xs sm:text-sm">
          Lijst
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
