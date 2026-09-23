"use client";

import { Flame, Trophy } from "lucide-react";
import type { CategoryId } from "@/lib/constants";
import { CATEGORIES } from "@/lib/constants";
import type { LeaderboardEntry } from "@/lib/types";
import { getMinimumBid } from "@/lib/utils";
import { CategoryTabs } from "@/components/leaderboard/CategoryTabs";
import { LeaderboardCard } from "@/components/leaderboard/LeaderboardCard";
import { Button } from "@/components/ui/Button";

interface LeaderboardProps {
  activeCategory: CategoryId;
  entries: LeaderboardEntry[];
  onCategoryChange: (category: CategoryId) => void;
  onBidClick: () => void;
  onShare: (entry: LeaderboardEntry) => void;
}

export function Leaderboard({
  activeCategory,
  entries,
  onCategoryChange,
  onBidClick,
  onShare,
}: LeaderboardProps) {
  const categoryMeta = CATEGORIES.find((item) => item.id === activeCategory)!;
  const topBid = entries[0]?.bidAmount ?? 0;
  const minimumBid = getMinimumBid(topBid);

  return (
    <section id="leaderboard" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 text-sm text-zinc-400">
            <Flame className="h-4 w-4 text-orange-400" />
            Live category leaderboard
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Who&apos;s flexing in {categoryMeta.label}?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Rank is the bid. Pay via UPI/Razorpay to claim #1 in{" "}
            {categoryMeta.label.toLowerCase()} — minimum outbid is{" "}
            <span className="font-medium text-zinc-200">₹{minimumBid}</span>.
          </p>
        </div>

        <Button onClick={onBidClick} className="w-full sm:w-auto">
          <Trophy className="h-4 w-4" />
          Bid for #1 — ₹{minimumBid}+
        </Button>
      </div>

      <div className="mb-8">
        <CategoryTabs activeCategory={activeCategory} onChange={onCategoryChange} />
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center">
          <p className="text-lg font-medium text-white">No bids yet in this category.</p>
          <p className="mt-2 text-sm text-zinc-400">
            Be the first creator to claim #1 for just ₹49.
          </p>
          <Button onClick={onBidClick} className="mt-6">
            Claim #1 now
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <LeaderboardCard key={entry.id} entry={entry} onShare={onShare} />
          ))}
        </div>
      )}
    </section>
  );
}
