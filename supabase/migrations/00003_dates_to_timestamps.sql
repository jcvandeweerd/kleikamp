-- ============================================================
-- Migration: Convert start_date and end_date from date to timestamptz
--            + enable Realtime on roadmap_items
-- Only needed if the database was created with the original schema.
-- ============================================================

alter table public.roadmap_items
  alter column start_date type timestamptz using start_date::timestamptz,
  alter column end_date   type timestamptz using end_date::timestamptz;

-- Enable Realtime so dashboard updates live
alter publication supabase_realtime add table public.roadmap_items;
