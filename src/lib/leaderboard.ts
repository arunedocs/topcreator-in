import { Category, type Creator, type CreatorBid } from "@prisma/client";
import { CATEGORIES, type CategoryId, type LeaderboardPeriod } from "./constants";
import { prisma } from "./prisma";
import type { ActivityItem, LeaderboardEntry } from "./types";
import { buildActivityMessage, getCategoryLabel } from "./utils";
import { asCategory, computeTrendingScore, rankBids, toLeaderboardEntry } from "./ranking";
import { getIstDateString, getIstDayBounds, getIstWeekStart } from "./time";
import { findOrCreateCreator } from "./creators";

async function backfillMissingCreators() {
  const orphans = await prisma.creatorBid.findMany({
    where: { creatorId: null },
    take: 50,
  });

  for (const bid of orphans) {
    const creator = await findOrCreateCreator({
      channelName: bid.channelName,
      channelUrl: bid.channelUrl,
      avatarUrl: bid.avatarUrl,
      subscriberCount: bid.subscriberCount,
      category: bid.category as CategoryId,
    });

    await prisma.creatorBid.update({
      where: { id: bid.id },
      data: {
        creatorId: creator.id,
        slug: creator.slug,
        handle: creator.handle,
      },
    });
  }
}

export async function getLeaderboard(category: CategoryId): Promise<LeaderboardEntry[]> {
  await backfillMissingCreators();

  const entries = await prisma.creatorBid.findMany({
    where: { category: asCategory(category) },
    include: { creator: true },
    orderBy: [{ bidAmount: "desc" }, { createdAt: "asc" }],
  });

  return rankBids(entries).map((entry) => toLeaderboardEntry(entry, entry.rank));
}

export async function getGlobalLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  await backfillMissingCreators();

  const entries = await prisma.creatorBid.findMany({
    include: { creator: true },
    orderBy: [{ bidAmount: "desc" }, { createdAt: "asc" }],
    take: limit,
  });

  return rankBids(entries).map((entry) => toLeaderboardEntry(entry, entry.rank));
}

export async function getTopBid(category: CategoryId): Promise<number> {
  const top = await prisma.creatorBid.findFirst({
    where: { category: asCategory(category) },
    orderBy: { bidAmount: "desc" },
    select: { bidAmount: true },
  });

  return top?.bidAmount ?? 0;
}

export async function getRecentActivity(limit = 20): Promise<ActivityItem[]> {
  const events = await prisma.activityEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { creator: true },
  });

  if (events.length > 0) {
    return events.map((event) => ({
      id: event.id,
      channelName: event.creator?.channelName ?? "A creator",
      category: (event.category as CategoryId | null) ?? null,
      categoryLabel: event.category ? getCategoryLabel(event.category as CategoryId) : "TopCreator",
      bidAmount: event.bidAmount,
      timestamp: event.createdAt.toISOString(),
      message: event.message,
      slug: event.creator?.slug,
      type: event.type,
      fromRank: event.fromRank,
      toRank: event.toRank,
    }));
  }

  const entries = await prisma.creatorBid.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: { creator: true },
  });

  return entries.map((entry) => {
    const category = entry.category as CategoryId;
    const categoryLabel = getCategoryLabel(category);

    return {
      id: entry.id,
      channelName: entry.channelName,
      category,
      categoryLabel,
      bidAmount: entry.bidAmount,
      timestamp: entry.updatedAt.toISOString(),
      message: buildActivityMessage(entry.channelName, categoryLabel, entry.bidAmount),
      slug: entry.creator?.slug ?? entry.slug,
    };
  });
}

export async function upsertCreatorBid(data: {
  channelName: string;
  channelUrl: string;
  subscriberCount: number;
  category: CategoryId;
  bidAmount: number;
  avatarUrl: string;
}) {
  return prisma.creatorBid.upsert({
    where: {
      channelUrl_category: {
        channelUrl: data.channelUrl,
        category: data.category as Category,
      },
    },
    update: {
      channelName: data.channelName,
      subscriberCount: data.subscriberCount,
      bidAmount: data.bidAmount,
      avatarUrl: data.avatarUrl,
    },
    create: {
      ...data,
      category: data.category as Category,
    },
  });
}

export async function getTodayLeaderboard(
  category?: CategoryId,
  date = getIstDateString()
): Promise<LeaderboardEntry[]> {
  const snapshots = await prisma.rankingSnapshot.findMany({
    where: {
      date,
      ...(category ? { category: asCategory(category) } : {}),
    },
    include: { creator: { include: { bids: true } } },
    orderBy: [{ bidAmount: "desc" }, { rank: "asc" }],
  });

  if (snapshots.length > 0) {
    return snapshots.map((snapshot, index) => {
      const bid =
        snapshot.creator.bids.find((item) => item.category === snapshot.category) ??
        snapshot.creator.bids[0];

      return {
        id: snapshot.id,
        rank: category ? snapshot.rank : index + 1,
        channelName: snapshot.creator.channelName,
        channelUrl: snapshot.creator.channelUrl,
        avatarUrl: snapshot.creator.avatarUrl,
        subscriberCount: snapshot.creator.subscriberCount,
        category: snapshot.category as CategoryId,
        bidAmount: snapshot.bidAmount,
        createdAt: snapshot.createdAt.toISOString(),
        slug: snapshot.creator.slug,
        handle: snapshot.creator.handle,
        verified: snapshot.creator.verified,
        previousRank: bid?.previousRank ?? null,
        movement: bid?.previousRank != null ? bid.previousRank - snapshot.rank : 0,
      };
    });
  }

  return category ? getLeaderboard(category) : getGlobalLeaderboard();
}

export async function getWeekLeaderboard(category?: CategoryId): Promise<LeaderboardEntry[]> {
  const start = getIstWeekStart();
  const entries = await prisma.creatorBid.findMany({
    where: {
      updatedAt: { gte: start },
      ...(category ? { category: asCategory(category) } : {}),
    },
    include: { creator: true },
    orderBy: [{ bidAmount: "desc" }, { createdAt: "asc" }],
  });

  return rankBids(entries).map((entry) => toLeaderboardEntry(entry, entry.rank));
}

export async function getNewCreators(limit = 20): Promise<LeaderboardEntry[]> {
  const creators = await prisma.creator.findMany({
    where: { suspended: false },
    orderBy: { joinedAt: "desc" },
    take: limit,
    include: { bids: { orderBy: { bidAmount: "desc" }, take: 1 } },
  });

  return creators.map((creator, index) => {
    const bid = creator.bids[0];
    return {
      id: creator.id,
      rank: index + 1,
      channelName: creator.channelName,
      channelUrl: creator.channelUrl,
      avatarUrl: creator.avatarUrl,
      subscriberCount: creator.subscriberCount,
      category: (bid?.category ?? creator.category) as CategoryId,
      bidAmount: bid?.bidAmount ?? 0,
      createdAt: creator.joinedAt.toISOString(),
      slug: creator.slug,
      handle: creator.handle,
      verified: creator.verified,
      previousRank: bid?.previousRank ?? null,
      movement: 0,
    };
  });
}

export async function getBiggestMovers(limit = 12): Promise<LeaderboardEntry[]> {
  const entries = await prisma.creatorBid.findMany({
    where: { previousRank: { not: null } },
    include: { creator: true },
  });

  const ranked = rankBids(entries).map((entry) => toLeaderboardEntry(entry, entry.rank));

  return ranked
    .filter((entry) => entry.movement > 0)
    .sort((a, b) => b.movement - a.movement || b.bidAmount - a.bidAmount)
    .slice(0, limit);
}

export async function getTrendingCreators(limit = 12): Promise<LeaderboardEntry[]> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const bids = await prisma.creatorBid.findMany({
    include: {
      creator: true,
      bidHistory: { where: { createdAt: { gte: since } } },
    },
  });

  const ranked = rankBids(bids);
  const scored = ranked.map((bid) => {
    const entry = toLeaderboardEntry(bid, bid.rank);
    const hoursSinceJoin = bid.creator
      ? (Date.now() - bid.creator.joinedAt.getTime()) / 3_600_000
      : 999;
    const score = computeTrendingScore({
      bidsLast24h: bid.bidHistory.length,
      rankMovement: entry.movement,
      profileViews: bid.creator?.profileViews ?? 0,
      youtubeClicks: bid.creator?.youtubeClicks ?? 0,
      shares: bid.creator?.shareCount ?? 0,
      hoursSinceJoin,
    });
    return { entry, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item, index) => ({ ...item.entry, rank: index + 1 }));
}

export async function getLeaderboardByPeriod(
  period: LeaderboardPeriod,
  category?: CategoryId,
  date?: string
): Promise<LeaderboardEntry[]> {
  switch (period) {
    case "today":
      return getTodayLeaderboard(category, date ?? getIstDateString());
    case "week":
      return getWeekLeaderboard(category);
    case "trending":
      return getTrendingCreators(30).then((rows) =>
        category ? rows.filter((row) => row.category === category) : rows
      );
    case "new":
      return getNewCreators(40).then((rows) =>
        category ? rows.filter((row) => row.category === category) : rows
      );
    case "movers":
      return getBiggestMovers(30).then((rows) =>
        category ? rows.filter((row) => row.category === category) : rows
      );
    default:
      return category ? getLeaderboard(category) : getGlobalLeaderboard();
  }
}

type CreatorWithBid = Creator & { bids: CreatorBid[] };

async function hydrateCreatorRanks(creators: CreatorWithBid[]): Promise<LeaderboardEntry[]> {
  const categories = [
    ...new Set(creators.map((creator) => (creator.bids[0]?.category ?? creator.category) as CategoryId)),
  ];
  const boards = new Map<CategoryId, LeaderboardEntry[]>();

  await Promise.all(
    categories.map(async (category) => {
      boards.set(category, await getLeaderboard(category));
    })
  );

  return creators.map((creator) => {
    const category = (creator.bids[0]?.category ?? creator.category) as CategoryId;
    const match = boards.get(category)?.find((entry) => entry.slug === creator.slug);
    if (match) {
      return {
        ...match,
        subscriberCount: creator.subscriberCount,
        profileViews: creator.profileViews,
        youtubeClicks: creator.youtubeClicks,
        shareCount: creator.shareCount,
      };
    }

    return {
      id: creator.id,
      rank: 0,
      channelName: creator.channelName,
      channelUrl: creator.channelUrl,
      avatarUrl: creator.avatarUrl,
      subscriberCount: creator.subscriberCount,
      category,
      bidAmount: creator.bids[0]?.bidAmount ?? 0,
      createdAt: creator.joinedAt.toISOString(),
      slug: creator.slug,
      handle: creator.handle,
      verified: creator.verified,
      previousRank: creator.bids[0]?.previousRank ?? null,
      movement: 0,
      profileViews: creator.profileViews,
      youtubeClicks: creator.youtubeClicks,
      shareCount: creator.shareCount,
    };
  });
}

export async function searchCreators(query: string, limit = 12): Promise<LeaderboardEntry[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const needle = q.toLowerCase().replace(/^@/, "");
  const categoryIds = CATEGORIES.filter(
    (category) => category.label.toLowerCase().includes(needle) || category.slug.includes(needle)
  ).map((category) => category.id as Category);

  const creators = await prisma.creator.findMany({
    where: {
      suspended: false,
      OR: [
        { channelName: { contains: q, mode: "insensitive" } },
        { handle: { contains: needle, mode: "insensitive" } },
        ...(categoryIds.length > 0 ? [{ category: { in: categoryIds } }] : []),
      ],
    },
    take: limit,
    include: { bids: { orderBy: { bidAmount: "desc" }, take: 1 } },
  });

  return hydrateCreatorRanks(creators);
}

export async function getCreatorsBySlugs(slugs: string[]): Promise<LeaderboardEntry[]> {
  const unique = [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))].slice(0, 40);
  if (unique.length === 0) return [];

  const creators = await prisma.creator.findMany({
    where: { slug: { in: unique }, suspended: false },
    include: { bids: { orderBy: { bidAmount: "desc" }, take: 1 } },
  });
  const entries = await hydrateCreatorRanks(creators);
  const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));
  return unique.flatMap((slug) => {
    const entry = bySlug.get(slug);
    return entry ? [entry] : [];
  });
}

export async function getCreatorsByMetric(
  metric: "profileViews" | "youtubeClicks" | "shareCount",
  limit = 8
): Promise<LeaderboardEntry[]> {
  const creators = await prisma.creator.findMany({
    where: { suspended: false, [metric]: { gt: 0 } },
    orderBy: { [metric]: "desc" },
    take: limit,
    include: { bids: { orderBy: { bidAmount: "desc" }, take: 1 } },
  });

  return hydrateCreatorRanks(creators);
}

export async function getRisingCreators(
  limit = 24,
  band?: { min: number; max: number }
): Promise<LeaderboardEntry[]> {
  const creators = await prisma.creator.findMany({
    where: {
      suspended: false,
      ...(band
        ? {
            subscriberCount: {
              gte: band.min,
              ...(Number.isFinite(band.max) ? { lte: band.max } : {}),
            },
          }
        : {}),
    },
    orderBy: { joinedAt: "desc" },
    take: 80,
    include: { bids: { orderBy: { bidAmount: "desc" }, take: 1 } },
  });

  const ranked = await hydrateCreatorRanks(creators.filter((creator) => creator.bids.length > 0));
  return ranked
    .sort((a, b) => b.movement - a.movement || Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, limit);
}

export async function getHomeStats() {
  const [creators, liveBids, volume, youtubeClicks] = await Promise.all([
    prisma.creator.count({ where: { suspended: false } }),
    prisma.creatorBid.count(),
    prisma.creatorBid.aggregate({ _sum: { bidAmount: true } }),
    prisma.creator.aggregate({ _sum: { youtubeClicks: true } }),
  ]);

  return {
    creators,
    liveBids,
    volume: volume._sum.bidAmount ?? 0,
    youtubeClicks: youtubeClicks._sum.youtubeClicks ?? 0,
  };
}

export { getIstDayBounds };
