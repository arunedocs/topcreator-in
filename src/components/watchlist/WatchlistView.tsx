"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import { readWatchlist } from "@/components/creator/WatchButton";
import type { LeaderboardEntry } from "@/lib/types";

export function WatchlistView() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    const slugs = readWatchlist();
    if (slugs.length === 0) {
      setEntries([]);
      return;
    }

    void fetch(`/api/creators/cards?slugs=${encodeURIComponent(slugs.join(","))}`)
      .then(async (response) => {
        if (!response.ok) {
          setEntries([]);
          return;
        }
        const json = (await response.json()) as { creators: LeaderboardEntry[] };
        setEntries(json.creators);
      })
      .catch(() => setEntries([]));
  }, []);

  if (entries === null) {
    return <div className="mt-8 h-24 animate-pulse rounded-2xl bg-zinc-900/60" />;
  }

  if (entries.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-zinc-800 px-6 py-12 text-center">
        <p className="text-zinc-400">No watchlist creators yet.</p>
        <Link href="/rankings" className="mt-3 inline-block text-sm text-amber-300">
          Explore rankings
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-3">
      {entries.map((entry) => (
        <LeaderboardRow key={entry.id} entry={entry} showCategory />
      ))}
    </div>
  );
}
