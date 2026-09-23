import { Category } from "@prisma/client";
import type { CategoryId } from "./constants";
import { prisma } from "./prisma";
import type { LeaderboardEntry } from "./types";

export async function getLeaderboard(category: CategoryId): Promise<LeaderboardEntry[]> {
  const entries = await prisma.creatorBid.findMany({
    where: { category: category as Category },
    orderBy: [{ bidAmount: "desc" }, { createdAt: "asc" }],
  });

  return entries.map((entry, index) => ({
    id: entry.id,
    rank: index + 1,
    channelName: entry.channelName,
    channelUrl: entry.channelUrl,
    avatarUrl: entry.avatarUrl,
    subscriberCount: entry.subscriberCount,
    category: entry.category as CategoryId,
    bidAmount: entry.bidAmount,
    createdAt: entry.createdAt.toISOString(),
  }));
}

export async function getTopBid(category: CategoryId): Promise<number> {
  const top = await prisma.creatorBid.findFirst({
    where: { category: category as Category },
    orderBy: { bidAmount: "desc" },
    select: { bidAmount: true },
  });

  return top?.bidAmount ?? 0;
}

export async function upsertCreatorBid(data: {
  channelName: string;
  channelUrl: string;
  subscriberCount: number;
  category: CategoryId;
  bidAmount: number;
  avatarUrl: string;
}) {
  const existing = await prisma.creatorBid.findFirst({
    where: {
      channelUrl: data.channelUrl,
      category: data.category as Category,
    },
  });

  if (existing) {
    return prisma.creatorBid.update({
      where: { id: existing.id },
      data: {
        channelName: data.channelName,
        subscriberCount: data.subscriberCount,
        bidAmount: data.bidAmount,
        avatarUrl: data.avatarUrl,
      },
    });
  }

  return prisma.creatorBid.create({
    data: {
      ...data,
      category: data.category as Category,
    },
  });
}
