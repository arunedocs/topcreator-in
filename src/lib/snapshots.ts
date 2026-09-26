import { Category } from "@prisma/client";
import type { CategoryId } from "./constants";
import { prisma } from "./prisma";
import { getIstDateString, getIstWeekStart, shiftIstDate } from "./time";
import { awardBadge } from "./creators";
import { BadgeType } from "@prisma/client";

export async function snapshotCategoryRanks(category: CategoryId, date = getIstDateString()) {
  const bids = await prisma.creatorBid.findMany({
    where: { category: category as Category },
    orderBy: [{ bidAmount: "desc" }, { createdAt: "asc" }],
    select: { creatorId: true, bidAmount: true },
  });

  const operations = bids
    .filter((bid) => bid.creatorId)
    .map((bid, index) =>
      prisma.rankingSnapshot.upsert({
        where: {
          date_category_creatorId: {
            date,
            category: category as Category,
            creatorId: bid.creatorId as string,
          },
        },
        update: { rank: index + 1, bidAmount: bid.bidAmount },
        create: {
          date,
          category: category as Category,
          creatorId: bid.creatorId as string,
          rank: index + 1,
          bidAmount: bid.bidAmount,
        },
      })
    );

  if (operations.length > 0) {
    await prisma.$transaction(operations);
  }
}

export async function refreshStreaks(date = getIstDateString()) {
  const firsts = await prisma.rankingSnapshot.findMany({
    where: { date, rank: 1 },
    select: { creatorId: true, category: true },
  });

  for (const row of firsts) {
    let streak = 0;
    let cursor = date;

    for (let i = 0; i < 400; i += 1) {
      const hit = await prisma.rankingSnapshot.findFirst({
        where: {
          date: cursor,
          creatorId: row.creatorId,
          category: row.category,
          rank: 1,
        },
        select: { id: true },
      });
      if (!hit) break;
      streak += 1;
      cursor = shiftIstDate(cursor, -1);
    }

    const daysAtOne = await prisma.rankingSnapshot.count({
      where: { creatorId: row.creatorId, category: row.category, rank: 1 },
    });

    await prisma.creator.update({
      where: { id: row.creatorId },
      data: { currentStreak: streak, daysAtOne },
    });

    await awardBadge(row.creatorId, BadgeType.CHAMPION);
    await awardBadge(row.creatorId, BadgeType.CATEGORY_CHAMPION);
    if (streak >= 7) await awardBadge(row.creatorId, BadgeType.STREAK_7);
    if (streak >= 30) await awardBadge(row.creatorId, BadgeType.STREAK_30);
  }
}

export async function ensureTodaySnapshot() {
  const date = getIstDateString();
  const categories = await prisma.creatorBid.findMany({
    distinct: ["category"],
    select: { category: true },
  });

  for (const row of categories) {
    await snapshotCategoryRanks(row.category as CategoryId, date);
  }

  await refreshStreaks(date);
}

export async function getCreatorOfTheDay(date = getIstDateString()) {
  const winner = await prisma.rankingSnapshot.findFirst({
    where: { date, rank: 1 },
    orderBy: { bidAmount: "desc" },
    include: { creator: true },
  });

  if (winner) return winner;

  const live = await prisma.creatorBid.findFirst({
    orderBy: [{ bidAmount: "desc" }, { createdAt: "asc" }],
    include: { creator: true },
  });

  if (!live?.creator) return null;

  return {
    date,
    category: live.category,
    rank: 1,
    bidAmount: live.bidAmount,
    creator: live.creator,
  };
}

export function weekWindowStart() {
  return getIstWeekStart();
}
