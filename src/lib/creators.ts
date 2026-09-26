import { createHash, randomBytes } from "crypto";
import { BadgeType, Category, Prisma } from "@prisma/client";
import { BADGE_META, type CategoryId } from "./constants";
import { prisma } from "./prisma";
import { slugify, uniqueSuffix } from "./slug";
import type { BidHistoryPoint, CreatorProfile, ExistingCreatorHint } from "./types";
import { getCategoryLabel } from "./utils";
import { extractHandleFromUrl, generateVerificationCode, parseYouTubeChannel } from "./youtube";

type Db = Prisma.TransactionClient | typeof prisma;

async function allocateSlug(base: string, db: Db = prisma): Promise<string> {
  const preferred = slugify(base);
  const existing = await db.creator.findUnique({ where: { slug: preferred } });
  if (!existing) return preferred;
  return `${preferred}-${uniqueSuffix()}`;
}

export async function findOrCreateCreator(
  input: {
    channelName: string;
    channelUrl: string;
    avatarUrl: string;
    subscriberCount: number;
    category: CategoryId;
  },
  db: Db = prisma
) {
  const parsed = parseYouTubeChannel(input.channelUrl);
  const handle = parsed?.handle || extractHandleFromUrl(input.channelUrl);
  const channelId = parsed?.channelId ?? null;

  const existing = await db.creator.findFirst({
    where: {
      OR: [
        { channelUrl: input.channelUrl },
        ...(channelId ? [{ channelId }] : []),
      ],
    },
  });

  if (existing) {
    return db.creator.update({
      where: { id: existing.id },
      data: {
        channelName: input.channelName,
        avatarUrl: input.avatarUrl,
        subscriberCount: input.subscriberCount || existing.subscriberCount,
        handle: existing.handle || handle,
        channelId: existing.channelId ?? channelId,
      },
    });
  }

  return db.creator.create({
    data: {
      slug: await allocateSlug(handle || input.channelName, db),
      channelName: input.channelName,
      channelUrl: input.channelUrl,
      channelId,
      handle,
      avatarUrl: input.avatarUrl,
      subscriberCount: input.subscriberCount,
      category: input.category as Category,
      claimToken: randomBytes(16).toString("hex"),
      verificationCode: generateVerificationCode(),
    },
  });
}

export async function lookupCreatorByUrl(rawUrl: string): Promise<ExistingCreatorHint | null> {
  const parsed = parseYouTubeChannel(rawUrl);
  if (!parsed) return null;

  const creator = await prisma.creator.findFirst({
    where: {
      OR: [
        { channelUrl: parsed.normalizedUrl },
        ...(parsed.channelId ? [{ channelId: parsed.channelId }] : []),
        { handle: parsed.handle },
      ],
    },
    include: {
      bids: { orderBy: { bidAmount: "desc" }, take: 1 },
    },
  });

  if (!creator) return null;

  const topBid = creator.bids[0];
  if (!topBid) {
    return {
      slug: creator.slug,
      channelName: creator.channelName,
      category: creator.category as CategoryId,
      rank: 0,
      bidAmount: 0,
      handle: creator.handle,
    };
  }

  const higher = await prisma.creatorBid.count({
    where: {
      category: topBid.category,
      OR: [
        { bidAmount: { gt: topBid.bidAmount } },
        { bidAmount: topBid.bidAmount, createdAt: { lt: topBid.createdAt } },
      ],
    },
  });

  return {
    slug: creator.slug,
    channelName: creator.channelName,
    category: topBid.category as CategoryId,
    rank: higher + 1,
    bidAmount: topBid.bidAmount,
    handle: creator.handle,
  };
}

export async function getCreatorBySlug(slug: string) {
  return prisma.creator.findUnique({
    where: { slug },
    include: {
      bids: { orderBy: { bidAmount: "desc" } },
      badges: true,
      bidHistory: { orderBy: { createdAt: "asc" }, take: 50 },
    },
  });
}

export async function getOverallRank(creatorId: string): Promise<number | null> {
  const topBid = await prisma.creatorBid.findFirst({
    where: { creatorId },
    orderBy: { bidAmount: "desc" },
  });
  if (!topBid) return null;

  const higher = await prisma.creatorBid.count({
    where: {
      OR: [
        { bidAmount: { gt: topBid.bidAmount } },
        { bidAmount: topBid.bidAmount, createdAt: { lt: topBid.createdAt } },
      ],
    },
  });

  return higher + 1;
}

export async function getCategoryRank(creatorId: string, category: CategoryId): Promise<number | null> {
  const bid = await prisma.creatorBid.findFirst({
    where: { creatorId, category: category as Category },
  });
  if (!bid) return null;

  const higher = await prisma.creatorBid.count({
    where: {
      category: category as Category,
      OR: [
        { bidAmount: { gt: bid.bidAmount } },
        { bidAmount: bid.bidAmount, createdAt: { lt: bid.createdAt } },
      ],
    },
  });

  return higher + 1;
}

export async function toCreatorProfile(
  slug: string
): Promise<CreatorProfile | null> {
  const creator = await getCreatorBySlug(slug);
  if (!creator || creator.suspended) return null;

  const topBid = creator.bids[0];
  const currentRank = topBid
    ? await getCategoryRank(creator.id, topBid.category as CategoryId)
    : null;
  const overallRank = await getOverallRank(creator.id);

  return {
    id: creator.id,
    slug: creator.slug,
    channelName: creator.channelName,
    channelUrl: creator.channelUrl,
    handle: creator.handle,
    avatarUrl: creator.avatarUrl,
    subscriberCount: creator.subscriberCount,
    videoCount: creator.videoCount,
    category: (topBid?.category ?? creator.category) as CategoryId,
    verified: creator.verified,
    verificationCode: creator.verificationCode,
    suspended: creator.suspended,
    profileViews: creator.profileViews,
    youtubeClicks: creator.youtubeClicks,
    shareCount: creator.shareCount,
    daysAtOne: creator.daysAtOne,
    currentStreak: creator.currentStreak,
    highestBid: Math.max(creator.highestBid, topBid?.bidAmount ?? 0),
    currentBid: topBid?.bidAmount ?? 0,
    currentRank,
    overallRank,
    previousRank: topBid?.previousRank ?? null,
    movement:
      topBid?.previousRank && currentRank
        ? topBid.previousRank - currentRank
        : 0,
    joinedAt: creator.joinedAt.toISOString(),
    badges: creator.badges.map((badge) => ({
      type: badge.type,
      label: BADGE_META[badge.type].label,
      awardedAt: badge.awardedAt.toISOString(),
    })),
  };
}

export async function getBidHistory(creatorId: string): Promise<BidHistoryPoint[]> {
  const rows = await prisma.bidHistory.findMany({
    where: { creatorId },
    orderBy: { createdAt: "asc" },
    take: 80,
  });

  return rows.map((row) => ({
    id: row.id,
    amount: row.amount,
    rankAfter: row.rankAfter,
    previousRank: row.previousRank,
    createdAt: row.createdAt.toISOString(),
    category: row.category as CategoryId,
  }));
}

export async function recordProfileView(creatorId: string, ip: string) {
  const ipHash = createHash("sha256").update(`${ip}:${new Date().toDateString()}`).digest("hex");
  const recent = await prisma.profileView.findFirst({
    where: {
      creatorId,
      ipHash,
      createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
    },
  });
  if (recent) return;

  await prisma.$transaction([
    prisma.profileView.create({ data: { creatorId, ipHash } }),
    prisma.creator.update({
      where: { id: creatorId },
      data: { profileViews: { increment: 1 } },
    }),
  ]);
}

export async function awardBadge(creatorId: string, type: BadgeType) {
  await prisma.creatorBadge.upsert({
    where: { creatorId_type: { creatorId, type } },
    update: {},
    create: { creatorId, type },
  });
}

export function categoryWinsLabel(category: CategoryId, daysAtOne: number): string {
  if (daysAtOne <= 0) return `Competing in ${getCategoryLabel(category)}`;
  return `${daysAtOne} day${daysAtOne === 1 ? "" : "s"} at #1 in ${getCategoryLabel(category)}`;
}
