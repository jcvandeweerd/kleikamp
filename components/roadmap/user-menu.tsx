"use client";

import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

interface UserMenuProps {
  name: string;
  surname?: string;
  role: "admin" | "family";
}

export function UserMenu({ name, surname, role }: UserMenuProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const displayName = [name, surname].filter(Boolean).join(" ");

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  }, [router]);

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-medium leading-tight">{displayName}</p>
        <p className="text-muted-foreground text-[10px] capitalize">{role}</p>
      </div>
      {role === "admin" && (
        <Link href="/dashboard/admin">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            ⚙️ Beheer
          </Button>
        </Link>
      )}
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        disabled={signingOut}
        onClick={handleSignOut}
      >
        {signingOut ? "Uitloggen…" : "Uitloggen"}
      </Button>
    </div>
  );
}
