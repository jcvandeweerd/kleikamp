/** Simple date formatting helpers */

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Returns the ISO week number and year for a given date string.
 */
export function getWeek(iso: string): { week: number; year: number } {
  const d = new Date(iso);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const diff = d.getTime() - startOfYear.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const week = Math.ceil((diff / oneWeek + startOfYear.getDay() + 1) / 7);
  return { week, year: d.getFullYear() };
}

/**
 * Returns "YYYY-MM" key for month grouping.
 */
export function getMonthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(key: string): string {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
}
