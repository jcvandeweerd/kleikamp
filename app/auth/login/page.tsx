"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noUsers, setNoUsers] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Check if any users exist (bootstrap scenario)
  useEffect(() => {
    const supabase = createBrowserClient();
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => {
        if (count === 0) setNoUsers(true);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError("Ongeldig e-mailadres of wachtwoord.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm border-none bg-white/80 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 text-4xl" aria-hidden>
            🏡
          </div>
          <CardTitle className="text-xl">Kleikamp Family HQ</CardTitle>
          <CardDescription>
            Log in om de routekaart te openen.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-medium">
                E-mailadres
              </label>
              <Input
                id="login-email"
                type="email"
                placeholder="naam@voorbeeld.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                aria-label="E-mailadres"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-xs font-medium">
                Wachtwoord
              </label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                aria-label="Wachtwoord"
              />
            </div>

            {error && (
              <p className="text-destructive text-xs" role="alert">
                {error}
              </p>
            )}

            {resetSent && (
              <p className="text-xs text-lime-700" role="status">
                📬 Er is een e-mail verstuurd om je wachtwoord in te stellen. Check je inbox!
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 to-violet-500 text-white hover:from-sky-600 hover:to-violet-600"
              disabled={loading || !email.trim() || !password}
            >
              {loading ? "Inloggen…" : "🔑 Inloggen"}
            </Button>

            <button
              type="button"
              className="text-muted-foreground hover:text-foreground w-full text-center text-[11px] underline"
              disabled={resetLoading || !email.trim()}
              onClick={async () => {
                setResetLoading(true);
                setError(null);
                const supabase = createBrowserClient();
                const { error: resetError } =
                  await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/reset-password`,
                  });
                setResetLoading(false);
                if (resetError) {
                  setError(resetError.message);
                } else {
                  setResetSent(true);
                }
              }}
            >
              {resetLoading
                ? "Verzenden…"
                : "Wachtwoord vergeten of nog niet ingesteld?"}
            </button>
          </form>

          <p className="text-muted-foreground mt-4 text-center text-xs">
            {noUsers ? (
              <Link href="/auth/register" className="text-foreground underline">
                Eerste keer? Maak een admin-account aan →
              </Link>
            ) : (
              "Nog geen account? Vraag een familielid om een uitnodiging."
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
