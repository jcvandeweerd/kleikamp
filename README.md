# 🏡 Kleikamp 10 - Family App

Family dashboard to build our dream home together — a roadmap app with timeline, kanban and list views.

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**, TypeScript (strict)
- **Tailwind CSS v4** + shadcn/ui
- **Supabase** (Auth, Postgres, RLS)
- **Zod** for server action validation

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up Supabase

1. Create a project on [supabase.com](https://supabase.com)
2. Copy `.env.local.example` to `.env.local` and fill in the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_EMAILS=your@email.com
```

3. Run the SQL in the **Supabase SQL Editor**:
   - `supabase/migrations/00001_initial_schema.sql` — for a fresh database
   - `supabase/migrations/00002_invites_and_surname.sql` — only if the first migration was already applied

4. **Recommended**: Disable email confirmation in Supabase Dashboard → Authentication → Providers → Email → Toggle off "Confirm email"

### 3. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The first user can create an admin account without an invite.

## Features

- **Roadmap** — timeline (week/month), kanban and list views
- **Sorting** — by title, date, status, tags or owner
- **Item management** — create, edit, change status, delete
- **Comments** — comment thread per item
- **Audit log** — automatic activity feed
- **Auth** — email + password registration, password reset
- **Invites** — admins invite family members via unique link
- **Role management** — admin or family, configurable via admin panel
- **Dutch UI** — fully translated

## Project structure

```
app/
  auth/login/          # Login page
  auth/register/       # Registration (via invite link)
  auth/reset-password/ # Set password
  auth/callback/       # OAuth/magic link callback
  dashboard/           # Main dashboard
  dashboard/admin/     # Family management (admin-only)
components/
  admin/               # Admin panel components
  roadmap/             # Dashboard, views, drawers, dialogs
  ui/                  # shadcn/ui components
lib/
  actions/             # Server actions (roadmap CRUD, admin)
  supabase/            # Supabase clients, types, queries
supabase/
  migrations/          # SQL migrations
```

## Deployment

Deploy via [Vercel](https://vercel.com) — set the environment variables in the Vercel dashboard.
