import { ActivityType, BadgeType, Category, PaymentStatus } from "@prisma/client";
import { BID_INCREMENT, MIN_BID_AMOUNT, type CategoryId } from "./constants";
import { awardBadge, findOrCreateCreator } from "./creators";
import { prisma } from "./prisma";
import { rankBids } from "./ranking";
import { snapshotCategoryRanks } from "./snapshots";
import { track } from "./analytics";
import { getCategoryLabel } from "./utils";
import { getIstDateString } from "./time";

function minimumRequired(currentTop: number, existingOwnBid: number | null): number {
  if (existingOwnBid != null && existingOwnBid === currentTop) {
    return existingOwnBid + BID_INCREMENT;
  }
  return currentTop > 0 ? currentTop + BID_INCREMENT : MIN_BID_AMOUNT;
}

export function getServerMinimumBid(currentTop: number, existingOwnBid: number | null = null) {
  return minimumRequired(currentTop, existingOwnBid);
}

export async function confirmVerifiedBid(input: {
  orderId: string;
  paymentId: string;
  signature: string;
  channelName: string;
  channelUrl: string;
  category: CategoryId;
  bidAmount: number;
  subscriberCount: number;
  avatarUrl: string;
}) {
  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: input.orderId },
  });

  if (payment?.status === PaymentStatus.VERIFIED && payment.creatorId) {
    const bid = await prisma.creatorBid.findUnique({
      where: {
        channelUrl_category: {
          channelUrl: payment.channelUrl,
          category: payment.category,
        },
      },
      include: { creator: true },
    });

    return {
      rank: bid?.rankAtUpdate ?? 1,
      slug: bid?.creator?.slug ?? bid?.slug ?? "",
      category: input.category,
      bidAmount: payment.bidAmount,
      previousRank: bid?.previousRank ?? null,
      outbidCreatorName: null as string | null,
      claimToken: bid?.creator?.claimToken,
    };
  }

  if (payment && payment.amountPaise !== input.bidAmount * 100) {
    throw new Error("Payment amount does not match the submitted bid.");
  }

  if (payment && payment.channelUrl && payment.channelUrl !== input.channelUrl) {
    throw new Error("Payment is locked to a different creator listing.");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${input.category}))`;

    const currentBoard = await tx.creatorBid.findMany({
      where: { category: input.category as Category },
      orderBy: [{ bidAmount: "desc" }, { createdAt: "asc" }],
    });

    const existing = currentBoard.find((row) => row.channelUrl === input.channelUrl);
    const currentTop = currentBoard[0]?.bidAmount ?? 0;
    const minimumBid = minimumRequired(currentTop, existing?.bidAmount ?? null);

    if (input.bidAmount < minimumBid) {
      throw new Error(`Minimum bid is ₹${minimumBid}.`);
    }

    if (existing && input.bidAmount <= existing.bidAmount) {
      throw new Error("New bid must be higher than your current bid.");
    }

    const beforeRanks = new Map(currentBoard.map((row, index) => [row.channelUrl, index + 1]));
    const previousLeader = currentBoard[0];

    const creator = await findOrCreateCreator(
      {
        channelName: input.channelName,
        channelUrl: input.channelUrl,
        avatarUrl: input.avatarUrl,
        subscriberCount: input.subscriberCount,
        category: input.category,
      },
      tx
    );

    const isNewListing = !existing;

    const upserted = await tx.creatorBid.upsert({
      where: {
        channelUrl_category: {
          channelUrl: input.channelUrl,
          category: input.category as Category,
        },
      },
      update: {
        channelName: input.channelName,
        subscriberCount: input.subscriberCount,
        bidAmount: input.bidAmount,
        avatarUrl: input.avatarUrl,
        creatorId: creator.id,
        slug: creator.slug,
        handle: creator.handle,
        previousBid: existing?.bidAmount ?? null,
      },
      create: {
        channelName: input.channelName,
        channelUrl: input.channelUrl,
        subscriberCount: input.subscriberCount,
        bidAmount: input.bidAmount,
        avatarUrl: input.avatarUrl,
        category: input.category as Category,
        creatorId: creator.id,
        slug: creator.slug,
        handle: creator.handle,
      },
    });

    const nextBoard = await tx.creatorBid.findMany({
      where: { category: input.category as Category },
      include: { creator: true },
      orderBy: [{ bidAmount: "desc" }, { createdAt: "asc" }],
    });

    const ranked = rankBids(nextBoard);
    const self = ranked.find((row) => row.id === upserted.id);
    const rank = self?.rank ?? 1;
    const previousRank = beforeRanks.get(input.channelUrl) ?? null;

    await Promise.all(
      ranked.map((row) =>
        tx.creatorBid.update({
          where: { id: row.id },
          data: {
            previousRank: beforeRanks.get(row.channelUrl) ?? row.previousRank,
            rankAtUpdate: row.rank,
          },
        })
      )
    );

    await tx.bidHistory.create({
      data: {
        creatorId: creator.id,
        creatorBidId: upserted.id,
        category: input.category as Category,
        amount: input.bidAmount,
        rankAfter: rank,
        previousRank,
      },
    });

    await tx.creator.update({
      where: { id: creator.id },
      data: {
        category: input.category as Category,
        highestBid: Math.max(creator.highestBid, input.bidAmount),
      },
    });

    const categoryLabel = getCategoryLabel(input.category);
    const activityType = isNewListing
      ? ActivityType.JOINED
      : rank === 1
        ? ActivityType.CLAIMED_FIRST
        : ActivityType.BID_INCREASED;

    const message = isNewListing
      ? `🎉 @${creator.handle} joined TopCreator in ${categoryLabel}`
      : rank === 1
        ? `🔥 @${creator.handle} claimed #1 ${categoryLabel} for ₹${input.bidAmount.toLocaleString("en-IN")}`
        : previousRank && previousRank > rank
          ? `🚀 @${creator.handle} moved from #${previousRank} → #${rank}`
          : `💰 @${creator.handle} increased their bid to ₹${input.bidAmount.toLocaleString("en-IN")}`;

    await tx.activityEvent.create({
      data: {
        type: activityType,
        message,
        creatorId: creator.id,
        category: input.category as Category,
        bidAmount: input.bidAmount,
        fromRank: previousRank,
        toRank: rank,
      },
    });

    if (
      previousLeader &&
      previousLeader.channelUrl !== input.channelUrl &&
      previousLeader.creatorId &&
      rank === 1
    ) {
      await tx.notification.create({
        data: {
          creatorId: previousLeader.creatorId,
          type: "OUTBID",
          title: "🔥 You were outbid!",
          body: `You moved from #1 → #2 in ${categoryLabel}. Current #1 bid: ₹${input.bidAmount.toLocaleString("en-IN")}. Minimum to reclaim #1: ₹${input.bidAmount + BID_INCREMENT}.`,
          meta: {
            category: input.category,
            currentTop: input.bidAmount,
            minimumBid: input.bidAmount + BID_INCREMENT,
          },
        },
      });
    }

    if (payment) {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.VERIFIED,
          razorpayPaymentId: input.paymentId,
          razorpaySignature: input.signature,
          creatorId: creator.id,
          creatorBidId: upserted.id,
          verifiedAt: new Date(),
        },
      });
    } else {
      await tx.payment.create({
        data: {
          razorpayOrderId: input.orderId,
          razorpayPaymentId: input.paymentId,
          razorpaySignature: input.signature,
          amountPaise: input.bidAmount * 100,
          status: PaymentStatus.VERIFIED,
          channelName: input.channelName,
          channelUrl: input.channelUrl,
          category: input.category as Category,
          bidAmount: input.bidAmount,
          subscriberCount: input.subscriberCount,
          avatarUrl: input.avatarUrl,
          creatorId: creator.id,
          creatorBidId: upserted.id,
          verifiedAt: new Date(),
        },
      });
    }

    return {
      rank,
      slug: creator.slug,
      category: input.category,
      bidAmount: input.bidAmount,
      previousRank,
      outbidCreatorName:
        previousLeader && previousLeader.channelUrl !== input.channelUrl && rank === 1
          ? previousLeader.channelName
          : null,
      claimToken: creator.claimToken,
      creatorId: creator.id,
      isNewListing,
      movement: previousRank != null ? previousRank - rank : 0,
    };
  });

  await snapshotCategoryRanks(input.category, getIstDateString());

  if (result.rank === 1) {
    await awardBadge(result.creatorId, BadgeType.CHAMPION);
    await awardBadge(result.creatorId, BadgeType.CATEGORY_CHAMPION);
  }
  if (result.movement >= 5) {
    await awardBadge(result.creatorId, BadgeType.FASTEST_RISER);
  }
  if (result.isNewListing && result.rank <= 10) {
    await awardBadge(result.creatorId, BadgeType.RISING_CREATOR);
  }

  track({
    name: result.isNewListing ? "bid_created" : "bid_increased",
    properties: {
      category: input.category,
      rank: result.rank,
      amount: input.bidAmount,
    },
  });

  if (result.outbidCreatorName) {
    track({ name: "creator_outbid", properties: { category: input.category } });
  }

  return result;
}
