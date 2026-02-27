-- ============================================================
-- Migration 2: Invite system + surname
-- Run this on databases that already have the initial schema.
-- ============================================================

-- ── Add surname column to profiles ───────────────────────────
alter table public.profiles
  add column if not exists surname text not null default '';

-- ── Admins can update any profile (for role changes) ─────────
-- (drop first in case it exists, then recreate)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles'
      and policyname = 'Admins can update any profile'
  ) then
    create policy "Admins can update any profile"
      on public.profiles for update
      to authenticated
      using (public.is_admin(auth.uid()));
  end if;
end $$;

-- ── Invites table ────────────────────────────────────────────
create table if not exists public.invites (
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

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'invites'
      and policyname = 'Admins can read invites'
  ) then
    create policy "Admins can read invites"
      on public.invites for select
      to authenticated
      using (public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'invites'
      and policyname = 'Admins can create invites'
  ) then
    create policy "Admins can create invites"
      on public.invites for insert
      to authenticated
      with check (public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'invites'
      and policyname = 'Admins can delete invites'
  ) then
    create policy "Admins can delete invites"
      on public.invites for delete
      to authenticated
      using (public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'invites'
      and policyname = 'Admins can update invites'
  ) then
    create policy "Admins can update invites"
      on public.invites for update
      to authenticated
      using (public.is_admin(auth.uid()));
  end if;
end $$;

-- ── Functions ────────────────────────────────────────────────
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

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists invites_token_idx on public.invites (token);
create index if not exists invites_email_idx on public.invites (email);
