"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LEADERBOARD_POLL_MS, type CategoryId } from "@/lib/constants";
import type { ActivityItem, LeaderboardEntry } from "@/lib/types";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/time";

const MEDALS = ["🥇", "🥈", "🥉"];

export function LiveRankPreview({
  category,
  initial,
  activity,
}: {
  category: CategoryId;
  initial: LeaderboardEntry[];
  activity: ActivityItem | null;
}) {
  const [entries, setEntries] = useState(initial.slice(0, 3));
  const [latest, setLatest] = useState(activity);

  useEffect(() => {
    const id = window.setInterval(async () => {
      const [boardResponse, activityResponse] = await Promise.all([
        fetch(`/api/leaderboard?category=${category}`),
        fetch("/api/activity"),
      ]);
      if (boardResponse.ok) {
        const json = (await boardResponse.json()) as { leaderboard: LeaderboardEntry[] };
        setEntries(json.leaderboard.slice(0, 3));
      }
      if (activityResponse.ok) {
        const json = (await activityResponse.json()) as { activity: ActivityItem[] };
        const next = json.activity.find((item) => item.category === category) ?? json.activity[0];
        if (next) setLatest(next);
      }
    }, LEADERBOARD_POLL_MS);

    return () => window.clearInterval(id);
  }, [category]);

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-[0.16em] text-zinc-300">
          LIVE {getCategoryLabel(category).toUpperCase()} RANKINGS
        </p>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-rose-300">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          LIVE
        </span>
      </div>

      <div className="mt-5 grid gap-2">
        {entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
            This category is open. The first verified bid takes #1.
          </p>
        ) : (
          entries.map((entry, index) => (
            <Link
              key={entry.id}
              href={`/creator/${entry.slug}`}
              className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/20 px-3 py-3 transition hover:border-white/15"
            >
              <span className="w-6 text-center text-base">{MEDALS[index] ?? `#${entry.rank}`}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">
                  {entry.channelName}
                  {entry.verified ? " ✓" : ""}
                </span>
                <span className="text-xs text-zinc-500">
                  #{entry.rank}
                  {entry.movement > 0 ? ` · ↑ ${entry.movement}` : ""}
                </span>
              </span>
              <span className="text-sm font-medium text-amber-200">{formatCurrency(entry.bidAmount)}</span>
            </Link>
          ))
        )}
        {entries.length > 0 && entries.length < 3
          ? Array.from({ length: 3 - entries.length }, (_, index) => (
              <div
                key={`open-${index}`}
                className="rounded-2xl border border-dashed border-zinc-800 px-3 py-3 text-sm text-zinc-600"
              >
                Open spot
              </div>
            ))
          : null}
      </div>

      {latest ? (
        <p className="mt-4 text-xs leading-5 text-zinc-400">
          <span className="text-rose-300">●</span> {latest.message}
          <span className="ml-2 text-zinc-600">{formatRelativeTime(latest.timestamp)}</span>
        </p>
      ) : (
        <p className="mt-4 text-xs text-zinc-600">No bid activity in this category yet.</p>
      )}
    </div>
  );
}
