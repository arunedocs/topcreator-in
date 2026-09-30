import type { Metadata } from "next";
import Link from "next/link";
import { getBiggestMovers } from "@/lib/leaderboard";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Biggest movers",
  description: "Creators who gained rank against their previous recorded position.",
};

export default async function MoversPage() {
  const movers = await getBiggestMovers(40);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Biggest movers</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Movement is previous recorded rank minus current rank. Creators without a previous rank are not listed.
      </p>
      <div className="mt-8 grid gap-3">
        {movers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-800 px-6 py-12 text-center text-sm text-zinc-500">
            No rank changes recorded yet.
          </p>
        ) : (
          movers.map((entry) => (
            <Link
              key={entry.id}
              href={`/creator/${entry.slug}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 px-4 py-4 hover:border-zinc-600"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-white">
                  {entry.channelName}
                  {entry.verified ? " ✓" : ""}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  #{entry.previousRank} → #{entry.rank} · {getCategoryLabel(entry.category)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-emerald-400">+{entry.movement} positions</p>
                <p className="text-xs text-zinc-500">{formatCurrency(entry.bidAmount)}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
