import { DashboardClient } from "@/components/roadmap/dashboard-client";
import { ProgressSummary } from "@/components/roadmap/progress-summary";
import { RecentActivityFeed } from "@/components/roadmap/recent-activity";
import { UpcomingEvents } from "@/components/roadmap/upcoming-events";
import { UserMenu } from "@/components/roadmap/user-menu";
import { Separator } from "@/components/ui/separator";
import { ensureProfile } from "@/lib/supabase/ensure-profile";
import { getItems, getRecentEvents } from "@/lib/supabase/queries";

export const metadata = {
  title: "Dashboard · Kleikamp 10 · Family App",
  description: "Overzicht van onze familieroutekaart voor de nieuwbouw",
};

/**
 * Server Component – fetches real data from Supabase.
 * ensureProfile() bootstraps the user's profile row on first visit.
 */
export default async function DashboardPage() {
  const profile = await ensureProfile();
  const [items, events] = await Promise.all([getItems(), getRecentEvents(20)]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* ── Header ─────────────────────────── */}
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-3xl shrink-0" aria-hidden>
            🏡
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl truncate">
              Kleikamp 10 - Family App
            </h1>
            <p className="text-muted-foreground text-sm truncate">
              Ons nieuwe huis krijgt vorm - we bouwen dit samen! 💪
            </p>
          </div>
        </div>
        {profile && (
          <UserMenu name={profile.name} surname={profile.surname} role={profile.role as "admin" | "family"} />
        )}
      </header>

      {/* ── Progress overview ──────────────── */}
      <div className="mb-6">
        <ProgressSummary items={items} />
      </div>

      {/* ── Upcoming & Activity cards ──────── */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <UpcomingEvents items={items} />
        <RecentActivityFeed events={events} />
      </div>

      <Separator className="mb-8" />

      {/* ── Roadmap views ─────────────────── */}
      <DashboardClient initialItems={items} />
    </main>
  );
}
