"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABELS, STATUS_OPTIONS, type Status } from "@/lib/types";

interface SearchAndFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: Status | "all";
  onStatusFilterChange: (value: Status | "all") => void;
}

export function SearchAndFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: SearchAndFilterProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        placeholder="Zoek items…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-9 sm:max-w-[260px]"
        aria-label="Zoek in routekaart"
      />
      <Select
        value={statusFilter}
        onValueChange={(v) => onStatusFilterChange(v as Status | "all")}
      >
        <SelectTrigger className="h-9 w-full sm:w-[150px]" aria-label="Filter op status">
          <SelectValue placeholder="Alle statussen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle statussen</SelectItem>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
