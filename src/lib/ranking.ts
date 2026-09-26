import { Category, type Creator, type CreatorBid } from "@prisma/client";
import type { CategoryId } from "./constants";
import type { LeaderboardEntry } from "./types";
import { extractHandleFromUrl } from "./youtube";
import { slugify } from "./slug";

type BidWithCreator = CreatorBid & { creator?: Creator | null };

export function rankBids<T extends { bidAmount: number; createdAt: Date | string }>(
  bids: T[]
): Array<T & { rank: number }> {
  return [...bids]
    .sort((a, b) => {
      if (b.bidAmount !== a.bidAmount) return b.bidAmount - a.bidAmount;
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return aTime - bTime;
    })
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

export function toLeaderboardEntry(bid: BidWithCreator, rank: number): LeaderboardEntry {
  const previousRank = bid.previousRank ?? null;
  const movement = previousRank != null ? previousRank - rank : 0;
  const handle = bid.handle || bid.creator?.handle || extractHandleFromUrl(bid.channelUrl);
  const slug = bid.slug || bid.creator?.slug || slugify(handle || bid.channelName);

  return {
    id: bid.id,
    rank,
    channelName: bid.channelName,
    channelUrl: bid.channelUrl,
    avatarUrl: bid.avatarUrl,
    subscriberCount: bid.subscriberCount,
    category: bid.category as CategoryId,
    bidAmount: bid.bidAmount,
    createdAt: bid.createdAt.toISOString(),
    slug,
    handle,
    verified: bid.creator?.verified ?? false,
    previousRank,
    movement,
    youtubeClicks: bid.creator?.youtubeClicks,
    profileViews: bid.creator?.profileViews,
  };
}

export function asCategory(category: CategoryId): Category {
  return category as Category;
}

/**
 * Trending score is not highest-bid.
 * Weighted recency + movement + engagement.
 */
export function computeTrendingScore(input: {
  bidsLast24h: number;
  rankMovement: number;
  profileViews: number;
  youtubeClicks: number;
  shares: number;
  hoursSinceJoin: number;
}): number {
  const positiveMove = Math.max(0, input.rankMovement);
  const recencyBoost = input.hoursSinceJoin < 72 ? 6 : 0;

  return (
    input.bidsLast24h * 10 +
    positiveMove * 8 +
    input.profileViews * 0.5 +
    input.youtubeClicks * 2 +
    input.shares * 3 +
    recencyBoost
  );
}
