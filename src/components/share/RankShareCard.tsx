import type { LeaderboardEntry } from "@/lib/types";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";

export function RankShareCard({ entry }: { entry: LeaderboardEntry }) {
  const category = getCategoryLabel(entry.category);
  const initials = entry.channelName.slice(0, 2).toUpperCase();

  return (
    <article className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/10 bg-[#09090b] text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(245,158,11,0.28),transparent_46%)]" />
      <div className="pointer-events-none absolute inset-3 rounded-[22px] border border-white/10" />

      <div className="relative flex h-full flex-col px-6 py-6">
        <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.22em] text-zinc-400">
          <span className="text-amber-300">TOPCREATOR.IN</span>
          <span>INDIA</span>
        </div>

        <p
          className={`mt-8 text-7xl font-semibold leading-none tracking-tight ${
            entry.rank === 1 ? "text-amber-300" : "text-white"
          }`}
        >
          {entry.rank > 0 ? `#${entry.rank}` : "—"}
        </p>
        <p className="mt-3 text-[11px] font-semibold tracking-[0.28em] text-zinc-500">
          {category.toUpperCase()}
        </p>

        <div className="mt-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-zinc-900 text-sm font-semibold">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{entry.channelName}</p>
            <p className="truncate text-sm text-zinc-400">
              {entry.handle ? `@${entry.handle}` : "Creator"}
              {entry.verified ? " · Verified" : ""}
            </p>
          </div>
        </div>

        <div className="mt-auto border-t border-white/10 pt-5">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-zinc-500">CURRENT BID</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{formatCurrency(entry.bidAmount)}</p>
          <p className="mt-3 truncate text-[11px] text-zinc-500">
            {entry.slug ? `topcreator.in/creator/${entry.slug}` : "topcreator.in"}
          </p>
        </div>
      </div>
    </article>
  );
}
