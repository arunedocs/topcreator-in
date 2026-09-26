import { RankingsBoard } from "@/components/leaderboard/RankingsBoard";
import { LEADERBOARD_PERIODS, type LeaderboardPeriod } from "@/lib/constants";
import { getLeaderboardByPeriod } from "@/lib/leaderboard";
import { isValidCategory } from "@/lib/validation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rankings",
  description: "All-time, today, trending, and biggest movers on TopCreator.in",
};

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; category?: string }>;
}) {
  const params = await searchParams;
  const period = LEADERBOARD_PERIODS.some((item) => item.id === params.period)
    ? (params.period as LeaderboardPeriod)
    : "all-time";
  const category = params.category && isValidCategory(params.category) ? params.category : undefined;
  const entries = await getLeaderboardByPeriod(period, category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Rankings</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Server-authoritative ranks. Daily window uses Asia/Kolkata midnight snapshots.
      </p>
      <div className="mt-8">
        <RankingsBoard initialEntries={entries} initialPeriod={period} initialCategory={category} />
      </div>
    </div>
  );
}
