import Razorpay from "razorpay";
import { confirmVerifiedBid } from "../src/lib/bid-engine";
import { prisma } from "../src/lib/prisma";
import type { CategoryId } from "../src/lib/constants";

async function main() {
const rows = await prisma.payment.findMany({
  orderBy: { createdAt: "desc" },
  take: 8,
  select: {
    status: true,
    bidAmount: true,
    amountPaise: true,
    razorpayOrderId: true,
    razorpayPaymentId: true,
    channelName: true,
    category: true,
    createdAt: true,
    mock: true,
  },
});

console.log(JSON.stringify(rows, null, 2));
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ?? "",
  key_secret: process.env.RAZORPAY_KEY_SECRET ?? "",
});
for (const row of rows) {
  const payments = await razorpay.orders.fetchPayments(row.razorpayOrderId);
  const summary = (payments.items ?? []).map((item) => ({
    id: item.id,
    status: item.status,
    amount: item.amount,
  }));
  console.log(row.razorpayOrderId, JSON.stringify(summary));
}

const apply = await prisma.payment.findUnique({ where: { razorpayOrderId: "order_Tggz690vHgJine" } });
if (!apply) throw new Error("missing order");
const applied = await confirmVerifiedBid({
  orderId: apply.razorpayOrderId,
  paymentId: "pay_Tgh0N90zxGiCC5",
  signature: "timeout-recovery",
  channelName: apply.channelName,
  channelUrl: apply.channelUrl,
  category: apply.category as CategoryId,
  bidAmount: apply.bidAmount,
  subscriberCount: apply.subscriberCount,
  avatarUrl: apply.avatarUrl,
});
console.log("applied", applied.rank, applied.slug, applied.bidAmount);

const refund = await razorpay.payments.refund("pay_TggxXT0zzech0F", { amount: 6900 });
await prisma.payment.update({
  where: { razorpayOrderId: "order_TggvUYwzQnZuB7" },
  data: { status: "REFUNDED", razorpayPaymentId: "pay_TggxXT0zzech0F" },
});
console.log("refund", refund.status, refund.amount);
await prisma.$disconnect();
}

void main();
