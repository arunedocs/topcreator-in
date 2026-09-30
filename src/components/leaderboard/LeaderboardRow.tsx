import { BadgeCheck, Crown, ExternalLink, Share2, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { LeaderboardEntry } from "@/lib/types";
import { cn, formatCurrency, getCategoryLabel } from "@/lib/utils";

export function LeaderboardRow({
  entry,
  showCategory = false,
  onShare,
}: {
  entry: LeaderboardEntry;
  showCategory?: boolean;
  onShare?: (entry: LeaderboardEntry) => void;
}) {
  const isTop = entry.rank === 1;
  const isPodium = entry.rank <= 3;
  const profileHref = entry.slug ? `/creator/${entry.slug}` : "#";
  const youtubeHref = entry.slug ? `/go/youtube/${entry.slug}` : entry.channelUrl;

  return (
    <article
      className={cn(
        "rounded-2xl border p-4 transition-colors sm:p-5",
        isTop
          ? "border-amber-500/25 bg-amber-500/5"
          : "border-zinc-800/80 bg-zinc-900/30 hover:border-zinc-700"
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold",
            isTop ? "bg-amber-400 text-zinc-950" : isPodium ? "bg-zinc-800 text-white" : "bg-zinc-950 text-zinc-500"
          )}
        >
          {isTop ? <Crown className="h-4 w-4" /> : entry.rank > 0 ? `#${entry.rank}` : "—"}
        </div>

        <img
          src={entry.avatarUrl}
          alt=""
          className="h-11 w-11 rounded-full border border-zinc-800 bg-zinc-800 object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link href={profileHref} className="truncate font-medium text-white hover:underline">
              {entry.channelName}
            </Link>
            {entry.verified ? <BadgeCheck className="h-4 w-4 shrink-0 text-sky-400" /> : null}
          </div>
          <p className="truncate text-xs text-zinc-500">
            @{entry.handle || "creator"}
            {showCategory ? ` · ${getCategoryLabel(entry.category)}` : ""}
          </p>
        </div>

        <div className="hidden text-right sm:block">
          <p className={cn("text-lg font-semibold", isTop ? "text-amber-300" : "text-white")}>
            {formatCurrency(entry.bidAmount)}
          </p>
          <Movement movement={entry.movement} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 sm:hidden">
        <p className={cn("text-base font-semibold", isTop ? "text-amber-300" : "text-white")}>
          {formatCurrency(entry.bidAmount)}
        </p>
        <Movement movement={entry.movement} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={profileHref}
          className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-600"
        >
          Profile
        </Link>
        <a
          href={youtubeHref}
          className="inline-flex items-center gap-1 rounded-full border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-600"
        >
          Visit YouTube
          <ExternalLink className="h-3 w-3" />
        </a>
        {onShare ? (
          <button
            type="button"
            onClick={() => onShare(entry)}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-600"
          >
            <Share2 className="h-3 w-3" />
            Share
          </button>
        ) : null}
      </div>
    </article>
  );
}

function Movement({ movement }: { movement: number }) {
  if (!movement) return <p className="text-xs text-zinc-600">—</p>;
  if (movement > 0) {
    return (
      <p className="inline-flex items-center gap-1 text-xs text-emerald-400">
        <TrendingUp className="h-3.5 w-3.5" />↑ {movement}
      </p>
    );
  }
  return (
    <p className="inline-flex items-center gap-1 text-xs text-rose-400">
      <TrendingDown className="h-3.5 w-3.5" />↓ {Math.abs(movement)}
    </p>
  );
}
