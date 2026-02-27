import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Profile } from "@/lib/types";

const BG_COLORS = [
  "bg-sky-200 text-sky-800",
  "bg-violet-200 text-violet-800",
  "bg-orange-200 text-orange-800",
  "bg-lime-200 text-lime-800",
  "bg-rose-200 text-rose-800",
  "bg-teal-200 text-teal-800",
  "bg-amber-200 text-amber-800",
  "bg-emerald-200 text-emerald-800",
  "bg-fuchsia-200 text-fuchsia-800",
  "bg-cyan-200 text-cyan-800",
];

function getColorForId(profile: Profile): string {
  // Use the user ID for a stable color, fall back to name hash
  const key = profile.id || [profile.name, profile.surname].filter(Boolean).join(" ");
  let hash = 0;
  for (const ch of key) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return BG_COLORS[Math.abs(hash) % BG_COLORS.length];
}

interface UserAvatarProps {
  profile: Profile;
  size?: "sm" | "md";
}

export function UserAvatar({ profile, size = "sm" }: UserAvatarProps) {
  const fullName = [profile.name, profile.surname].filter(Boolean).join(" ");
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 1);

  return (
    <Avatar className={size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs"}>
      <AvatarFallback className={`font-semibold ${getColorForId(profile)}`}>
        {initials || "?"}
      </AvatarFallback>
    </Avatar>
  );
}
