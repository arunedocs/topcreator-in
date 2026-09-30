"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LEADERBOARD_POLL_MS, type CategoryId } from "@/lib/constants";
import type { ActivityItem, LeaderboardEntry } from "@/lib/types";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/time";

export function CategoryBattle({
  category,
  initial,
  activity,
}: {
  category: CategoryId;
  initial: LeaderboardEntry[];
  activity: ActivityItem[];
}) {
  const [entries, setEntries] = useState(initial.slice(0, 3));
  const [events, setEvents] = useState(activity);

  useEffect(() => {
    const id = window.setInterval(async () => {
      const [boardResponse, activityResponse] = await Promise.all([
        fetch(`/api/leaderboard?category=${category}&limit=3`),
        fetch("/api/activity"),
      ]);
      if (boardResponse.ok) {
        const json = (await boardResponse.json()) as { leaderboard: LeaderboardEntry[] };
        setEntries(json.leaderboard.slice(0, 3));
      }
      if (activityResponse.ok) {
        const json = (await activityResponse.json()) as { activity: ActivityItem[] };
        setEvents(json.activity.filter((item) => item.category === category).slice(0, 8));
      }
    }, LEADERBOARD_POLL_MS);
    return () => window.clearInterval(id);
  }, [category]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="grid gap-3">
        {entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-800 px-4 py-10 text-sm text-zinc-500">
            No verified bids in {getCategoryLabel(category)} yet.
          </p>
        ) : (
          entries.map((entry) => (
            <Link
              key={entry.id}
              href={`/creator/${entry.slug}`}
              className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-4 transition hover:border-zinc-600"
            >
              <span className="w-12 text-2xl font-semibold text-amber-200 transition-all">#{entry.rank}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-white">
                  {entry.channelName}
                  {entry.verified ? " ✓" : ""}
                </span>
                <span className="text-xs text-zinc-500">@{entry.handle}</span>
              </span>
              <span className="text-sm font-medium text-white">{formatCurrency(entry.bidAmount)}</span>
            </Link>
          ))
        )}
      </div>
      <div>
        <h2 className="text-sm font-medium text-white">Recent bid activity</h2>
        <div className="mt-3 grid gap-2">
          {events.length === 0 ? (
            <p className="text-sm text-zinc-500">No recorded bid events in this category.</p>
          ) : (
            events.map((item) => (
              <p key={item.id} className="rounded-xl border border-zinc-800 px-3 py-3 text-sm text-zinc-300">
                {item.message}
                <span className="ml-2 text-xs text-zinc-600">{formatRelativeTime(item.timestamp)}</span>
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
