import { ResetCountdown } from "@/components/leaderboard/ResetCountdown";
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
  const ranked = await getLeaderboardByPeriod(period, category);
  const entries = ranked.slice(0, 20);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start">
        <div>
          <h1 className="text-3xl font-semibold text-white">Paid rankings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Position is determined by verified bids. This is paid placement, not an organic ranking.
            Trending is a separate list.
          </p>
        </div>
        <ResetCountdown />
      </div>
      <div className="mt-8">
        <RankingsBoard
          initialEntries={entries}
          total={ranked.length}
          initialPeriod={period}
          initialCategory={category}
        />
      </div>
    </div>
  );
}
