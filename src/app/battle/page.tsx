import Link from "next/link";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import { getGlobalLeaderboard } from "@/lib/leaderboard";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Creator battle",
  description: "Compare two ranked creators side by side.",
};

export default async function BattlePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { a, b } = await searchParams;
  const board = await getGlobalLeaderboard(80);
  const left = board.find((item) => item.slug === a) ?? board[0];
  const right = board.find((item) => item.slug === b) ?? board[1];

  if (!left || !right) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-white">Creator battle</h1>
        <p className="mt-3 text-sm text-zinc-400">Need at least two ranked creators to compare.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Creator battle</h1>
      <p className="mt-2 text-sm text-zinc-400">Comparison uses live rank and bid — no invented winner score.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto_1fr]">
        <CompareCard entry={left} />
        <div className="flex items-center justify-center text-sm font-semibold text-zinc-500">VS</div>
        <CompareCard entry={right} />
      </div>
      <div className="mt-10 grid gap-3">
        <h2 className="text-sm text-zinc-500">Pick another matchup</h2>
        {board.slice(0, 8).map((entry) => (
          <LeaderboardRow key={entry.id} entry={entry} showCategory />
        ))}
      </div>
    </div>
  );
}

function CompareCard({
  entry,
}: {
  entry: Awaited<ReturnType<typeof getGlobalLeaderboard>>[number];
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
      <p className="text-xs text-zinc-500">#{entry.rank} · {getCategoryLabel(entry.category)}</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{entry.channelName}</h2>
      <p className="text-sm text-zinc-500">@{entry.handle}</p>
      <p className="mt-4 text-3xl font-semibold text-amber-300">{formatCurrency(entry.bidAmount)}</p>
      <p className="mt-2 text-sm text-zinc-400">
        Movement {entry.movement > 0 ? `+${entry.movement}` : entry.movement} · clicks {entry.youtubeClicks ?? 0}
      </p>
      <Link href={`/creator/${entry.slug}`} className="mt-5 inline-block text-sm text-white">
        Outbid from profile →
      </Link>
    </div>
  );
}
