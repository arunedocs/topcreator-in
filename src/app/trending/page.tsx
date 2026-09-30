import type { Metadata } from "next";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import {
  getBiggestMovers,
  getCreatorsByMetric,
  getNewCreators,
  getTrendingCreators,
} from "@/lib/leaderboard";
import type { LeaderboardEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trending creators",
  description: "Creators moving fastest from recent bids, rank changes, clicks, and shares.",
};

export default async function TrendingPage() {
  const [trending, rising, viewed, clicks, shares, newcomers] = await Promise.all([
    getTrendingCreators(12),
    getBiggestMovers(8),
    getCreatorsByMetric("profileViews", 8),
    getCreatorsByMetric("youtubeClicks", 8),
    getCreatorsByMetric("shareCount", 8),
    getNewCreators(8),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Trending</h1>
      <p className="mt-2 max-w-2xl rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm leading-6 text-emerald-100">
        Position is determined by platform engagement and activity signals. This is not the paid ranking.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
        Score = bids in the last 24 hours × 10 + positive rank movement × 8 + lifetime profile views
        × 0.5 + lifetime YouTube clicks × 2 + shares × 3 + a boost if the creator joined in the last
        72 hours. This is not the paid rank order. Views and clicks are lifetime totals, so this page
        does not pretend to be a 7-day or 30-day window.
      </p>

      <Board title="Trending now" entries={trending} empty="No trending score yet." />
      <Board title="Fastest rising" entries={rising} empty="No positive rank movement recorded." />
      <Board title="Most viewed" entries={viewed} empty="No profile views recorded yet." />
      <Board title="Most YouTube clicks" entries={clicks} empty="No YouTube clicks recorded yet." />
      <Board title="Most shared" entries={shares} empty="No shares recorded yet." />
      <Board title="New creators" entries={newcomers} empty="No new creators yet." />
    </div>
  );
}

function Board({
  title,
  entries,
  empty,
}: {
  title: string;
  entries: LeaderboardEntry[];
  empty: string;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4 grid gap-3">
        {entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-800 px-4 py-8 text-sm text-zinc-500">
            {empty}
          </p>
        ) : (
          entries.map((entry) => <LeaderboardRow key={`${title}-${entry.id}`} entry={entry} showCategory />)
        )}
      </div>
    </section>
  );
}
