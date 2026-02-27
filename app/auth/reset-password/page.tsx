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
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    if (password.length < 6) {
      setError("Wachtwoord moet minimaal 6 tekens zijn.");
      return;
    }

    setLoading(true);

    const supabase = createBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm border-none bg-white/80 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 text-4xl" aria-hidden>
            🔐
          </div>
          <CardTitle className="text-xl">Wachtwoord instellen</CardTitle>
          <CardDescription>
            Kies een nieuw wachtwoord voor je account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-3 text-center">
              <p className="text-4xl" aria-hidden>
                ✅
              </p>
              <p className="text-sm font-medium">Wachtwoord ingesteld!</p>
              <p className="text-muted-foreground text-xs">
                Je wordt doorgestuurd naar het dashboard…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="new-password" className="text-xs font-medium">
                  Nieuw wachtwoord
                </label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Minimaal 6 tekens"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="text-xs font-medium">
                  Wachtwoord bevestigen
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Herhaal je wachtwoord"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <p className="text-destructive text-xs" role="alert">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-500 to-violet-500 text-white hover:from-sky-600 hover:to-violet-600"
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? "Opslaan…" : "Wachtwoord opslaan"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
