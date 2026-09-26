import Link from "next/link";
import { RankingsBoard } from "@/components/leaderboard/RankingsBoard";
import { getTodayLeaderboard } from "@/lib/leaderboard";
import { ensureTodaySnapshot } from "@/lib/snapshots";
import { getIstDateString, shiftIstDate } from "@/lib/time";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Today's leaderboard",
  description: "Today's creator rankings on TopCreator.in — midnight IST window.",
};

export default async function TodayLeaderboardPage() {
  await ensureTodaySnapshot().catch(() => undefined);
  const today = getIstDateString();
  const entries = await getTodayLeaderboard(undefined, today);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Daily ranking · {today} IST</p>
      <h1 className="mt-2 text-3xl font-semibold text-white">Today</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Resets conceptually at midnight Asia/Kolkata. Historical bids are never deleted.
      </p>
      <div className="mt-4 flex gap-3 text-sm">
        <Link href={`/leaderboard/${shiftIstDate(today, -1)}`} className="text-zinc-400 hover:text-white">
          Yesterday
        </Link>
        <Link href="/rankings" className="text-zinc-400 hover:text-white">
          All time
        </Link>
      </div>
      <div className="mt-8">
        <RankingsBoard initialEntries={entries} initialPeriod="today" />
      </div>
    </div>
  );
}
