import { RankingsBoard } from "@/components/leaderboard/RankingsBoard";
import { getTrendingCreators } from "@/lib/leaderboard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trending creators",
  description: "Creators moving fastest from bids, rank changes, clicks, and shares.",
};

export default async function TrendingPage() {
  const entries = await getTrendingCreators(40);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Trending now</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Score = recent bids × 10 + positive rank movement × 8 + profile views × 0.5 + YouTube
        clicks × 2 + shares × 3 + a newcomer boost. Not sorted by highest bid.
      </p>
      <div className="mt-8">
        <RankingsBoard initialEntries={entries} initialPeriod="trending" />
      </div>
    </div>
  );
}
