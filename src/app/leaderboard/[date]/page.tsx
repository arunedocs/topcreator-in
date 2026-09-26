import Link from "next/link";
import { notFound } from "next/navigation";
import { RankingsBoard } from "@/components/leaderboard/RankingsBoard";
import { getTodayLeaderboard } from "@/lib/leaderboard";
import { getIstDateString, shiftIstDate } from "@/lib/time";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  return {
    title: `Leaderboard · ${date}`,
    description: `Historical TopCreator rankings for ${date} (Asia/Kolkata).`,
  };
}

export default async function HistoricalLeaderboardPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const entries = await getTodayLeaderboard(undefined, date);
  const today = getIstDateString();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Historical ranking</p>
      <h1 className="mt-2 text-3xl font-semibold text-white">{date}</h1>
      <div className="mt-4 flex gap-3 text-sm">
        <Link href={`/leaderboard/${shiftIstDate(date, -1)}`} className="text-zinc-400 hover:text-white">
          Previous day
        </Link>
        {date < today ? (
          <Link href={`/leaderboard/${shiftIstDate(date, 1)}`} className="text-zinc-400 hover:text-white">
            Next day
          </Link>
        ) : (
          <Link href="/leaderboard/today" className="text-zinc-400 hover:text-white">
            Today
          </Link>
        )}
      </div>
      <div className="mt-8">
        <RankingsBoard initialEntries={entries} initialPeriod="today" />
      </div>
    </div>
  );
}
