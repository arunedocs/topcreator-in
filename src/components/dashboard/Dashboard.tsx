"use client";

import { useMemo, useState } from "react";
import type { CategoryId } from "@/lib/constants";
import { CATEGORIES } from "@/lib/constants";
import type { LeaderboardEntry } from "@/lib/types";
import { BidModal } from "@/components/bid/BidModal";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/landing/Hero";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { ShareFlexModal } from "@/components/share/ShareFlexModal";

interface DashboardProps {
  initialData: Record<CategoryId, LeaderboardEntry[]>;
}

export function Dashboard({ initialData }: DashboardProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("TECH");
  const [leaderboards, setLeaderboards] = useState(initialData);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [shareEntry, setShareEntry] = useState<LeaderboardEntry | null>(null);

  const entries = leaderboards[activeCategory] ?? [];
  const topBid = entries[0]?.bidAmount ?? 0;
  const categoryLabel = CATEGORIES.find((item) => item.id === activeCategory)?.label ?? "Tech";

  const refreshCategory = async (category: CategoryId) => {
    const response = await fetch(`/api/leaderboard?category=${category}`);
    const data = (await response.json()) as { leaderboard: LeaderboardEntry[] };

    setLeaderboards((current) => ({
      ...current,
      [category]: data.leaderboard,
    }));
  };

  const handleBidSuccess = async () => {
    await refreshCategory(activeCategory);
  };

  const footerStats = useMemo(() => {
    const totalBids = Object.values(leaderboards).reduce(
      (sum, list) => sum + list.length,
      0
    );
    const totalVolume = Object.values(leaderboards).reduce(
      (sum, list) => sum + list.reduce((inner, entry) => inner + entry.bidAmount, 0),
      0
    );

    return { totalBids, totalVolume };
  }, [leaderboards]);

  return (
    <>
      <Header onBidClick={() => setBidModalOpen(true)} />
      <Hero
        topBidAmount={topBid}
        categoryLabel={categoryLabel}
        onBidClick={() => setBidModalOpen(true)}
      />
      <Leaderboard
        activeCategory={activeCategory}
        entries={entries}
        onCategoryChange={setActiveCategory}
        onBidClick={() => setBidModalOpen(true)}
        onShare={(entry) => setShareEntry(entry)}
      />

      <footer className="border-t border-zinc-800/80 bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>TopCreator.in — India&apos;s creator economy flex board.</p>
          <p>
            {footerStats.totalBids} live bids · ₹
            {footerStats.totalVolume.toLocaleString("en-IN")} total volume
          </p>
        </div>
      </footer>

      <BidModal
        open={bidModalOpen}
        onClose={() => setBidModalOpen(false)}
        activeCategory={activeCategory}
        currentTopBid={topBid}
        onSuccess={handleBidSuccess}
      />

      <ShareFlexModal
        open={Boolean(shareEntry)}
        onClose={() => setShareEntry(null)}
        entry={shareEntry}
      />
    </>
  );
}
