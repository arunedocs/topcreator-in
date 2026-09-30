"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, LEADERBOARD_PERIODS, type CategoryId, type LeaderboardPeriod } from "@/lib/constants";
import type { LeaderboardEntry } from "@/lib/types";
import { getMinimumBid } from "@/lib/utils";
import { useBid } from "@/components/bid/BidProvider";
import { LeaderboardRow } from "./LeaderboardRow";
import { ShareFlexModal } from "@/components/share/ShareFlexModal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function RankingsBoard({
  initialEntries,
  total = initialEntries.length,
  initialCategory,
  initialPeriod = "all-time",
  showCategoryFilter = true,
}: {
  initialEntries: LeaderboardEntry[];
  total?: number;
  initialCategory?: CategoryId;
  initialPeriod?: LeaderboardPeriod;
  showCategoryFilter?: boolean;
}) {
  const { openBid } = useBid();
  const [period, setPeriod] = useState<LeaderboardPeriod>(initialPeriod);
  const [category, setCategory] = useState<CategoryId | "ALL">(initialCategory ?? "ALL");
  const [entries, setEntries] = useState(initialEntries);
  const [totalCount, setTotalCount] = useState(total);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [shareEntry, setShareEntry] = useState<LeaderboardEntry | null>(null);

  const topBid = entries[0]?.bidAmount ?? 0;
  const minimumBid = getMinimumBid(topBid);

  const refresh = async (nextPeriod: LeaderboardPeriod, nextCategory: CategoryId | "ALL") => {
    setLoading(true);
    const params = new URLSearchParams({ period: nextPeriod, limit: "20" });
    if (nextCategory !== "ALL") params.set("category", nextCategory);
    const response = await fetch(`/api/leaderboard?${params.toString()}`);
    if (response.ok) {
      const data = (await response.json()) as { leaderboard: LeaderboardEntry[]; total?: number };
      setEntries(data.leaderboard);
      setTotalCount(data.total ?? data.leaderboard.length);
    }
    setLoading(false);
  };

  const filters = useMemo(
    () => (
      <>
        <div className="flex flex-wrap gap-2">
          {LEADERBOARD_PERIODS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setPeriod(item.id);
                void refresh(item.id, category);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs",
                period === item.id
                  ? "border-white/20 bg-white text-zinc-950"
                  : "border-zinc-800 text-zinc-400"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        {showCategoryFilter ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setCategory("ALL");
                void refresh(period, "ALL");
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs",
                category === "ALL" ? "border-white/20 bg-zinc-100 text-zinc-950" : "border-zinc-800 text-zinc-400"
              )}
            >
              All
            </button>
            {CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCategory(item.id);
                  void refresh(period, item.id);
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs",
                  category === item.id ? "border-white/20 bg-zinc-100 text-zinc-950" : "border-zinc-800 text-zinc-400"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </>
    ),
    [category, period, showCategoryFilter]
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            Current #1 · {topBid > 0 ? `₹${topBid.toLocaleString("en-IN")}` : "Unclaimed"}
          </p>
          <p className="mt-1 text-sm text-zinc-400">Minimum required bid {`₹${minimumBid}`}</p>
        </div>
        <div className="flex gap-2">
          <Button
            className="lg:hidden"
            variant="secondary"
            onClick={() => setFilterOpen((value) => !value)}
          >
            Filters
          </Button>
          <Button onClick={() => openBid({ category: category === "ALL" ? "TECH" : category })}>
            Claim #1
          </Button>
        </div>
      </div>

      <div className="mb-6 hidden lg:block">{filters}</div>
      {filterOpen ? (
        <div className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 lg:hidden">
          {filters}
        </div>
      ) : null}

      {loading ? <p className="mb-4 text-xs text-zinc-500">Updating ranks…</p> : null}

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 px-6 py-16 text-center">
          <p className="text-white">No creators in this view yet.</p>
          <Button className="mt-4" onClick={() => openBid()}>
            Be the first
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {entries.map((entry) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              showCategory={category === "ALL"}
              onShare={setShareEntry}
            />
          ))}
          {entries.length < totalCount ? (
            <Button
              variant="secondary"
              disabled={loading}
              onClick={() => {
                setLoading(true);
                const params = new URLSearchParams({
                  period,
                  limit: String(entries.length + 20),
                });
                if (category !== "ALL") params.set("category", category);
                void fetch(`/api/leaderboard?${params.toString()}`)
                  .then(async (response) => {
                    if (!response.ok) return;
                    const data = (await response.json()) as { leaderboard: LeaderboardEntry[]; total?: number };
                    setEntries(data.leaderboard);
                    setTotalCount(data.total ?? data.leaderboard.length);
                  })
                  .finally(() => setLoading(false));
              }}
            >
              Show more
            </Button>
          ) : null}
        </div>
      )}

      <ShareFlexModal open={Boolean(shareEntry)} onClose={() => setShareEntry(null)} entry={shareEntry} />
    </div>
  );
}
