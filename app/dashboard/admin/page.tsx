import { AdminClient } from "@/components/admin/admin-client";
import { ensureProfile } from "@/lib/supabase/ensure-profile";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Beheer · Kleikamp 10 Admin · Family App",
  description: "Beheer familieleden en uitnodigingen",
};

export default async function AdminPage() {
  const profile = await ensureProfile();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            ⚙️
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Familiebeheer
            </h1>
            <p className="text-muted-foreground text-sm">
              Nodig familieleden uit en beheer rollen.
            </p>
          </div>
        </div>
      </header>

      <AdminClient />
    </main>
  );
}
