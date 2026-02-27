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
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);
  const [invalidToken, setInvalidToken] = useState(false);
  const [isBootstrap, setIsBootstrap] = useState(false);

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validate invite token — or allow bootstrap if no users exist yet
  useEffect(() => {
    const supabase = createBrowserClient();

    // If no token, check if this is a fresh install (no profiles yet)
    if (!token) {
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .then(({ count }) => {
          if (count === 0) {
            // First user ever — allow registration without invite
            setIsBootstrap(true);
          } else {
            setInvalidToken(true);
          }
          setValidating(false);
        });
      return;
    }

    supabase
      .rpc("validate_invite", { invite_token: token })
      .then(({ data, error: rpcError }) => {
        if (rpcError || !data || data.length === 0 || !data[0].valid) {
          setInvalidToken(true);
        } else {
          setInviteEmail(data[0].email);
          setEmail(data[0].email);
        }
        setValidating(false);
      });
  }, [token]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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

      // Sign up with Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            surname,
            is_bootstrap: isBootstrap,
          },
        },
      });

      if (signUpError) {
        setLoading(false);
        if (signUpError.message.includes("already registered")) {
          setError("Dit e-mailadres is al geregistreerd. Probeer in te loggen.");
        } else {
          setError(signUpError.message);
        }
        return;
      }

      // Mark invite as accepted
      if (token) {
        await supabase.rpc("accept_invite", { invite_token: token });
      }

      // If signUp returned a session, user is logged in immediately
      // (email confirmation disabled). Otherwise, sign in explicitly.
      if (!signUpData.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setLoading(false);
          setError("Account aangemaakt maar automatisch inloggen mislukt. Ga naar de inlogpagina.");
          return;
        }
      }

      setLoading(false);
      setSuccess(true);

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    },
    [email, password, confirmPassword, name, surname, token, isBootstrap, router],
  );

  if (validating) {
    return (
      <Card className="w-full max-w-sm border-none bg-white/80 shadow-lg">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground text-sm">Uitnodiging controleren…</p>
        </CardContent>
      </Card>
    );
  }

  if (invalidToken) {
    return (
      <Card className="w-full max-w-sm border-none bg-white/80 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 text-4xl" aria-hidden>
            🚫
          </div>
          <CardTitle className="text-xl">Ongeldige uitnodiging</CardTitle>
          <CardDescription>
            Deze uitnodigingslink is ongeldig of verlopen. Vraag een familielid
            om een nieuwe uitnodiging te sturen.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/auth/login">
            <Button variant="outline" size="sm">
              Naar inlogpagina
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-sm border-none bg-white/80 shadow-lg">
        <CardContent className="space-y-3 py-12 text-center">
          <p className="text-4xl" aria-hidden>
            🎉
          </p>
          <p className="text-sm font-medium">Account aangemaakt!</p>
          <p className="text-muted-foreground text-xs">
            Je wordt doorgestuurd naar het dashboard…
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm border-none bg-white/80 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 text-4xl" aria-hidden>
          🏡
        </div>
        <CardTitle className="text-xl">Account aanmaken</CardTitle>
        <CardDescription>
          {isBootstrap
            ? "Welkom! Maak het eerste admin-account aan."
            : "Welkom bij de familie! Vul je gegevens in."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="reg-name" className="text-xs font-medium">
                Voornaam *
              </label>
              <Input
                id="reg-name"
                type="text"
                placeholder="Jan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="reg-surname" className="text-xs font-medium">
                Achternaam *
              </label>
              <Input
                id="reg-surname"
                type="text"
                placeholder="Kleikamp"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="text-xs font-medium">
              E-mailadres
            </label>
            <Input
              id="reg-email"
              type="email"
              value={email}
              readOnly={!!inviteEmail}
              className={inviteEmail ? "bg-muted" : ""}
              onChange={(e) => !inviteEmail && setEmail(e.target.value)}
              required
            />
            {inviteEmail && (
              <p className="text-muted-foreground text-[10px]">
                Dit is het e-mailadres waarvoor de uitnodiging is verstuurd.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="text-xs font-medium">
              Wachtwoord *
            </label>
            <Input
              id="reg-password"
              type="password"
              placeholder="Minimaal 6 tekens"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-confirm" className="text-xs font-medium">
              Wachtwoord bevestigen *
            </label>
            <Input
              id="reg-confirm"
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
            className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600"
            disabled={loading || !name || !surname || !email || !password || !confirmPassword}
          >
            {loading ? "Aanmaken…" : "✨ Account aanmaken"}
          </Button>
        </form>

        <p className="text-muted-foreground mt-4 text-center text-xs">
          Al een account?{" "}
          <Link href="/auth/login" className="text-foreground underline">
            Inloggen
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-sm border-none bg-white/80 shadow-lg">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-sm">Laden…</p>
            </CardContent>
          </Card>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
