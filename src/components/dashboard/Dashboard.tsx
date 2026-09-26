"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CategoryId } from "@/lib/constants";
import { CATEGORIES, LEADERBOARD_POLL_MS } from "@/lib/constants";
import type { ActivityItem, BidSuccessPayload, LeaderboardEntry } from "@/lib/types";
import { applyOptimisticBid } from "@/lib/utils";
import { ActivityTicker } from "@/components/activity/ActivityTicker";
import { BidModal } from "@/components/bid/BidModal";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/landing/Hero";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { ShareFlexModal } from "@/components/share/ShareFlexModal";

interface DashboardProps {
  initialData: Record<CategoryId, LeaderboardEntry[]>;
  initialActivity: ActivityItem[];
}

export function Dashboard({ initialData, initialActivity }: DashboardProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("TECH");
  const [leaderboards, setLeaderboards] = useState(initialData);
  const [activity, setActivity] = useState(initialActivity);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [shareEntry, setShareEntry] = useState<LeaderboardEntry | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const entries = leaderboards[activeCategory] ?? [];
  const topBid = entries[0]?.bidAmount ?? 0;
  const categoryLabel = CATEGORIES.find((item) => item.id === activeCategory)?.label ?? "Tech";

  const topBidsByCategory = useMemo(
    () =>
      CATEGORIES.reduce(
        (acc, category) => {
          acc[category.id] = leaderboards[category.id]?.[0]?.bidAmount ?? 0;
          return acc;
        },
        {} as Record<CategoryId, number>
      ),
    [leaderboards]
  );

  const refreshCategory = useCallback(async (category: CategoryId) => {
    const response = await fetch(`/api/leaderboard?category=${category}`);

    if (!response.ok) {
      throw new Error("Failed to refresh leaderboard");
    }

    const data = (await response.json()) as { leaderboard: LeaderboardEntry[] };

    setLeaderboards((current) => ({
      ...current,
      [category]: data.leaderboard,
    }));
  }, []);

  const refreshActivity = useCallback(async () => {
    const response = await fetch("/api/activity");
    if (!response.ok) return;

    const data = (await response.json()) as { activity: ActivityItem[] };
    setActivity(data.activity);
  }, []);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    setFetchError(null);

    try {
      await Promise.all([
        ...CATEGORIES.map((category) => refreshCategory(category.id)),
        refreshActivity(),
      ]);
    } catch {
      setFetchError("Could not refresh live data. Showing last known ranks.");
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshActivity, refreshCategory]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshAll();
    }, LEADERBOARD_POLL_MS);

    return () => window.clearInterval(intervalId);
  }, [refreshAll]);

  const handleBidSuccess = async (payload: BidSuccessPayload) => {
    setLeaderboards((current) => ({
      ...current,
      [payload.category]: applyOptimisticBid(current[payload.category] ?? [], payload),
    }));

    setActivity((current) => {
      const categoryLabel =
        CATEGORIES.find((item) => item.id === payload.category)?.label ?? payload.category;

      const nextItem: ActivityItem = {
        id: `activity-${Date.now()}`,
        channelName: payload.channelName,
        category: payload.category,
        categoryLabel,
        bidAmount: payload.bidAmount,
        timestamp: new Date().toISOString(),
        message: `${payload.channelName} grabbed #1 in ${categoryLabel} with ₹${payload.bidAmount.toLocaleString("en-IN")}! 🔥`,
      };

      return [nextItem, ...current.filter((item) => item.id !== nextItem.id)].slice(0, 20);
    });

    if (payload.category !== activeCategory) {
      setActiveCategory(payload.category);
    }

    try {
      await Promise.all([refreshCategory(payload.category), refreshActivity()]);
    } catch {
      setFetchError("Bid placed, but live refresh failed. Reload if ranks look stale.");
    }
  };

  return (
    <>
      <Header onBidClick={() => setBidModalOpen(true)} />
      <Hero
        topBidAmount={topBid}
        categoryLabel={categoryLabel}
        onBidClick={() => setBidModalOpen(true)}
        onScrollToLeaderboard={() => {
          document.getElementById("leaderboard")?.scrollIntoView({ behavior: "smooth" });
        }}
      />
      <Leaderboard
        activeCategory={activeCategory}
        entries={entries}
        isRefreshing={isRefreshing}
        fetchError={fetchError}
        onCategoryChange={setActiveCategory}
        onBidClick={() => setBidModalOpen(true)}
        onShare={(entry) => setShareEntry(entry)}
      />

      <ActivityTicker activity={activity} />

      <footer className="border-t border-zinc-800/80 bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>TopCreator.in — India&apos;s creator economy flex board.</p>
          <FooterStats leaderboards={leaderboards} />
        </div>
      </footer>

      <BidModal
        open={bidModalOpen}
        onClose={() => setBidModalOpen(false)}
        activeCategory={activeCategory}
        topBidsByCategory={topBidsByCategory}
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

function FooterStats({
  leaderboards,
}: {
  leaderboards: Record<CategoryId, LeaderboardEntry[]>;
}) {
  const { totalBids, totalVolume } = useMemo(() => {
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
    <p>
      {totalBids} live bids · ₹{totalVolume.toLocaleString("en-IN")} total volume
    </p>
  );
}
