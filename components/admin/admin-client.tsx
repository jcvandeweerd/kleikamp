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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  createInvite,
  getInvites,
  getMembers,
  revokeInvite,
  updateMemberRole,
} from "@/lib/actions/admin";
import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";

interface Member {
  id: string;
  name: string;
  surname: string;
  role: string;
  created_at: string;
}

interface Invite {
  id: string;
  email: string;
  token: string;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

export function AdminClient() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async () => {
    const [membersResult, invitesResult] = await Promise.all([
      getMembers(),
      getInvites(),
    ]);

    if ("data" in membersResult && membersResult.data) {
      setMembers(membersResult.data);
    }
    if ("data" in invitesResult && invitesResult.data) {
      setInvites(invitesResult.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInvite = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setInviteError(null);
      setInviteLink(null);

      const formData = new FormData(e.currentTarget);

      startTransition(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = await createInvite(formData);
        if (result?.error) {
          const msg =
            typeof result.error === "string"
              ? result.error
              : Object.values(result.error as Record<string, string[]>)
                  .flat()
                  .join(", ");
          setInviteError(msg);
          return;
        }

        if (result?.token) {
          const link = `${window.location.origin}/auth/register?token=${result.token}`;
          setInviteLink(link);
          setInviteEmail("");
          await loadData();
        }
      });
    },
    [loadData],
  );

  const handleCopyLink = useCallback(() => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [inviteLink]);

  const handleRoleChange = useCallback(
    (userId: string, newRole: string) => {
      startTransition(async () => {
        const formData = new FormData();
        formData.set("userId", userId);
        formData.set("role", newRole);
        await updateMemberRole(formData);
        await loadData();
      });
    },
    [loadData],
  );

  const handleRevokeInvite = useCallback(
    (inviteId: string) => {
      startTransition(async () => {
        await revokeInvite(inviteId);
        await loadData();
      });
    },
    [loadData],
  );

  if (loading) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        Laden…
      </p>
    );
  }

  const pendingInvites = invites.filter(
    (i) => !i.accepted_at && new Date(i.expires_at) > new Date(),
  );
  const acceptedInvites = invites.filter((i) => !!i.accepted_at);
  const expiredInvites = invites.filter(
    (i) => !i.accepted_at && new Date(i.expires_at) <= new Date(),
  );

  return (
    <div className="space-y-8">
      {/* ── Invite Form ──────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📨 Familielid uitnodigen</CardTitle>
          <CardDescription>
            Stuur een uitnodigingslink naar een familielid. De link is 7 dagen
            geldig.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex gap-2">
            <Input
              name="email"
              type="email"
              placeholder="naam@voorbeeld.nl"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              className="max-w-xs text-sm"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !inviteEmail.trim()}
              className="bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600"
            >
              {isPending ? "Verzenden…" : "Uitnodigen"}
            </Button>
          </form>

          {inviteError && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {inviteError}
            </p>
          )}

          {inviteLink && (
            <div className="mt-4 rounded-lg border bg-lime-50 p-3">
              <p className="mb-1 text-xs font-medium text-lime-800">
                ✅ Uitnodiging aangemaakt! Deel deze link:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-white px-2 py-1 text-xs">
                  {inviteLink}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleCopyLink}
                >
                  {copied ? "Gekopieerd!" : "Kopiëren"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Members ──────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">👨‍👩‍👧‍👦 Familieleden</CardTitle>
          <CardDescription>
            {members.length} {members.length === 1 ? "lid" : "leden"} geregistreerd
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nog geen familieleden geregistreerd.
            </p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {member.name} {member.surname}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Lid sinds{" "}
                      {new Date(member.created_at).toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Select
                    value={member.role}
                    onValueChange={(val) => handleRoleChange(member.id, val)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">🛡️ Admin</SelectItem>
                      <SelectItem value="family">👤 Familie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Pending Invites ───────────── */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">⏳ Openstaande uitnodigingen</CardTitle>
            <CardDescription>
              {pendingInvites.length} uitnodiging{pendingInvites.length !== 1 && "en"} wachtend op acceptatie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{invite.email}</p>
                    <p className="text-muted-foreground text-xs">
                      Verstuurd op{" "}
                      {new Date(invite.created_at).toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {" · "}
                      Verloopt{" "}
                      {new Date(invite.expires_at).toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-red-600 hover:text-red-700"
                    disabled={isPending}
                    onClick={() => handleRevokeInvite(invite.id)}
                  >
                    Intrekken
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Accepted/Expired Invites ──── */}
      {(acceptedInvites.length > 0 || expiredInvites.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📋 Uitnodigingsoverzicht</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {acceptedInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between rounded-lg border border-lime-200 bg-lime-50 px-4 py-2"
              >
                <p className="text-sm">{invite.email}</p>
                <span className="text-xs text-lime-700">✅ Geaccepteerd</span>
              </div>
            ))}
            {expiredInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2"
              >
                <p className="text-muted-foreground text-sm">{invite.email}</p>
                <span className="text-muted-foreground text-xs">Verlopen</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="text-center">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            ← Terug naar dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
