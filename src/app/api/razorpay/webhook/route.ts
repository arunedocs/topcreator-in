import { NextResponse } from "next/server";
import { confirmVerifiedBid } from "@/lib/bid-engine";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import type { CategoryId } from "@/lib/constants";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string; status?: string } };
      refund?: { entity?: { payment_id?: string } };
    };
  };

  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const name = event.event ?? "";
  const paymentEntity = event.payload?.payment?.entity;
  const orderId = paymentEntity?.order_id;
  const paymentId = paymentEntity?.id;

  if (name === "payment.failed" && orderId) {
    await prisma.payment.updateMany({
      where: { razorpayOrderId: orderId, status: { in: ["CREATED", "PENDING"] } },
      data: { status: "FAILED", razorpayPaymentId: paymentId },
    });
    return NextResponse.json({ ok: true });
  }

  if ((name === "refund.processed" || name === "refund.created") && paymentId) {
    const payment = await prisma.payment.findUnique({ where: { razorpayPaymentId: paymentId } });
    if (payment && payment.status !== "REFUNDED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED" },
      });
      await prisma.adminAudit.create({
        data: {
          action: "refund_recorded",
          target: payment.razorpayOrderId,
          details: "Refund recorded. Rank was not changed automatically.",
        },
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (name === "payment.captured" && orderId && paymentId) {
    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
    if (!payment || payment.status === "VERIFIED" || payment.status === "REFUNDED") {
      return NextResponse.json({ ok: true });
    }

    if (payment.channelUrl.startsWith("pending:")) {
      return NextResponse.json({ ok: true });
    }

    try {
      await confirmVerifiedBid({
        orderId,
        paymentId,
        signature,
        channelName: payment.channelName,
        channelUrl: payment.channelUrl,
        category: payment.category as CategoryId,
        bidAmount: payment.bidAmount,
        subscriberCount: payment.subscriberCount,
        avatarUrl: payment.avatarUrl,
      });
    } catch (error) {
      console.error("Webhook confirm failed:", error);
      await prisma.adminAudit.create({
        data: {
          action: "webhook_confirm_failed",
          target: orderId,
          details: "Captured payment could not update the rank.",
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
