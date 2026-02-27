"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  const [open, setOpen] = useState(false);

  const displayName = name || surname || "?";
  const initials = [name?.[0], surname?.[0]].filter(Boolean).join("").toUpperCase() || "?";

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  }, [router]);

  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-3 shrink-0">
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

      {/* Mobile */}
      <div className="sm:hidden self-end">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 rounded-full p-0 text-xs font-bold"
              aria-label="Menu openen"
            >
              {initials}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64" elevated>
            <SheetHeader>
              <SheetTitle className="text-left">{displayName}</SheetTitle>
            </SheetHeader>
            <div className="mt-2 px-4">
              <p className="text-muted-foreground text-xs capitalize mb-6">{role}</p>
              <div className="flex flex-col gap-2">
                {role === "admin" && (
                  <Link href="/dashboard/admin" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                      ⚙️ Beheer
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm"
                  disabled={signingOut}
                  onClick={handleSignOut}
                >
                  {signingOut ? "Uitloggen…" : "🚪 Uitloggen"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
