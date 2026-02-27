-- ============================================================
-- Migration: Convert start_date and end_date from date to timestamptz
-- Only needed if the database was created with the original schema.
-- ============================================================

alter table public.roadmap_items
  alter column start_date type timestamptz using start_date::timestamptz,
  alter column end_date   type timestamptz using end_date::timestamptz;
