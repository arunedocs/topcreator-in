import { Category } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerMinimumBid } from "@/lib/bid-engine";
import { MIN_BID_AMOUNT, type CategoryId } from "@/lib/constants";
import { createRazorpayOrder, getRazorpayErrorStatus } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isValidCategory } from "@/lib/validation";

export async function POST(request: Request) {
  const limited = rateLimit(`create-order:${getClientIp(request)}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many payment attempts. Try again shortly." }, { status: 429 });
  }

  try {
    const body = (await request.json()) as {
      amount?: number;
      currency?: string;
      receipt?: string;
      channelName?: string;
      channelUrl?: string;
      category?: string;
      bidAmount?: number;
      subscriberCount?: number;
      avatarUrl?: string;
    };

    const amount = body.amount ?? 0;
    const currency = body.currency ?? "INR";
    const receipt = body.receipt ?? `receipt_${Date.now()}`;

    if (!Number.isInteger(amount) || amount < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise" },
        { status: 400 }
      );
    }

    if (body.bidAmount != null && body.bidAmount * 100 !== amount) {
      return NextResponse.json(
        { error: "Order amount does not match the bid." },
        { status: 400 }
      );
    }

    const bidAmount = body.bidAmount ?? Math.round(amount / 100);
    if (!Number.isInteger(bidAmount) || bidAmount < MIN_BID_AMOUNT) {
      return NextResponse.json({ error: `Minimum bid is ₹${MIN_BID_AMOUNT}.` }, { status: 400 });
    }

    const category = body.category && isValidCategory(body.category) ? (body.category as CategoryId) : "TECH";
    const channelUrl = body.channelUrl?.trim();
    if (channelUrl) {
      const recentFails = await prisma.payment.count({
        where: {
          channelUrl,
          status: "FAILED",
          createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
        },
      });
      if (recentFails >= 5) {
        await prisma.adminAudit.create({
          data: {
            action: "suspicious_failed_payments",
            target: channelUrl,
            details: `${recentFails} failed payments in 15 minutes`,
          },
        });
        return NextResponse.json(
          { error: "Too many failed payments for this channel. Try again shortly." },
          { status: 429 }
        );
      }

      const [top, own] = await Promise.all([
        prisma.creatorBid.findFirst({
          where: { category: category as Category },
          orderBy: [{ bidAmount: "desc" }, { createdAt: "asc" }],
        }),
        prisma.creatorBid.findUnique({
          where: { channelUrl_category: { channelUrl, category: category as Category } },
        }),
      ]);
      const minimum = getServerMinimumBid(top?.bidAmount ?? 0, own?.bidAmount ?? null);
      if (bidAmount < minimum) {
        return NextResponse.json({ error: `Bid too low. Minimum bid is ₹${minimum}.` }, { status: 400 });
      }
    }

    const order = await createRazorpayOrder(amount, receipt, currency);

    await prisma.payment.create({
      data: {
        razorpayOrderId: order.order_id,
        amountPaise: order.amount,
        currency: order.currency,
        status: "CREATED",
        channelName: body.channelName?.trim() || "Pending",
        channelUrl: body.channelUrl?.trim() || `pending:${order.order_id}`,
        category: category as Category,
        bidAmount: body.bidAmount ?? Math.round(amount / 100),
        subscriberCount: body.subscriberCount ?? 0,
        avatarUrl: body.avatarUrl ?? "",
        mock: order.mock ?? false,
      },
    });

    return NextResponse.json({
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      key_id: order.key_id,
      mock: order.mock ?? false,
    });
  } catch (error) {
    console.error("Create order failed:", error);
    const status = getRazorpayErrorStatus(error);

    return NextResponse.json(
      {
        error:
          status === 401
            ? "Razorpay authentication failed"
            : "Failed to create order",
      },
      { status }
    );
  }
}
