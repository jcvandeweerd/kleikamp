-- ============================================================
-- Kleikamp Family Roadmap — Supabase Migration
-- Run this in the Supabase SQL Editor or as a migration file.
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────
create type public.item_status as enum ('planned', 'active', 'waiting', 'done');

create type public.event_type as enum (
  'item_created',
  'item_updated',
  'status_changed',
  'comment_added',
  'item_deleted'
);

-- ── Profiles ─────────────────────────────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  name       text not null default '',
  surname    text not null default '',
  avatar_url text,
  role       text not null default 'family' check (role in ('admin', 'family')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Authenticated users can read all profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- ── Helper: is_admin ─────────────────────────────────────────
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin'
  );
$$;

-- Policy that depends on is_admin()
create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (public.is_admin(auth.uid()));

-- ── Invites ──────────────────────────────────────────────────
create table public.invites (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  token       uuid not null default gen_random_uuid(),
  invited_by  uuid not null references public.profiles(id) on delete cascade,
  accepted_at timestamptz,
  expires_at  timestamptz not null default (now() + interval '7 days'),
  created_at  timestamptz not null default now(),

  constraint invites_token_unique unique (token)
);

alter table public.invites enable row level security;

create policy "Admins can read invites"
  on public.invites for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "Admins can create invites"
  on public.invites for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

create policy "Admins can delete invites"
  on public.invites for delete
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "Admins can update invites"
  on public.invites for update
  to authenticated
  using (public.is_admin(auth.uid()));

-- Validate invite token (usable by unauthenticated users)
create or replace function public.validate_invite(invite_token uuid)
returns table (email text, valid boolean)
language sql
stable
security definer
as $$
  select
    i.email,
    (i.accepted_at is null and i.expires_at > now()) as valid
  from public.invites i
  where i.token = invite_token
  limit 1;
$$;

-- Accept invite (called after signup)
create or replace function public.accept_invite(invite_token uuid)
returns void
language sql
security definer
as $$
  update public.invites
  set accepted_at = now()
  where token = invite_token
    and accepted_at is null;
$$;

-- ── Roadmap Items ────────────────────────────────────────────
create table public.roadmap_items (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  start_date  timestamptz,
  end_date    timestamptz,
  status      public.item_status not null default 'planned',
  tags        text[] not null default '{}',
  created_by  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.roadmap_items enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger roadmap_items_updated_at
  before update on public.roadmap_items
  for each row
  execute function public.set_updated_at();

create policy "Authenticated users can read all items"
  on public.roadmap_items for select
  to authenticated
  using (true);

create policy "Authenticated users can insert items"
  on public.roadmap_items for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Authenticated users can update items"
  on public.roadmap_items for update
  to authenticated
  using (true)
  with check (true);

create policy "Only admins can delete items"
  on public.roadmap_items for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- ── Comments ─────────────────────────────────────────────────
create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  item_id    uuid not null references public.roadmap_items(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  message    text not null,
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "Authenticated users can read all comments"
  on public.comments for select
  to authenticated
  using (true);

create policy "Authenticated users can insert own comments"
  on public.comments for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can delete own comments or admin can delete all"
  on public.comments for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- ── Events (audit log) ──────────────────────────────────────
create table public.events (
  id         uuid primary key default gen_random_uuid(),
  type       public.event_type not null,
  actor_id   uuid not null references public.profiles(id) on delete cascade,
  item_id    uuid references public.roadmap_items(id) on delete set null,
  payload    jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "Authenticated users can read all events"
  on public.events for select
  to authenticated
  using (true);

create policy "Authenticated users can insert own events"
  on public.events for insert
  to authenticated
  with check (actor_id = auth.uid());

-- ── Indexes ──────────────────────────────────────────────────
create index roadmap_items_status_idx on public.roadmap_items (status);
create index roadmap_items_created_by_idx on public.roadmap_items (created_by);
create index comments_item_id_idx on public.comments (item_id);
create index events_item_id_idx on public.events (item_id);
create index events_created_at_idx on public.events (created_at desc);
create index invites_token_idx on public.invites (token);
create index invites_email_idx on public.invites (email);

-- ── Realtime ─────────────────────────────────────────────────
alter publication supabase_realtime add table public.roadmap_items;
