import crypto from "crypto";
import type { CreateOrderResponse } from "./types";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ?? "rzp_test_placeholder";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "placeholder_secret";

export function isRazorpayConfigured(): boolean {
  return (
    RAZORPAY_KEY_ID !== "rzp_test_placeholder" &&
    RAZORPAY_KEY_SECRET !== "placeholder_secret"
  );
}

export async function createRazorpayOrder(
  amountInRupees: number,
  receipt: string
): Promise<CreateOrderResponse> {
  if (!isRazorpayConfigured()) {
    return {
      orderId: `order_mock_${Date.now()}`,
      amount: amountInRupees * 100,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "rzp_test_placeholder",
      mock: true,
    };
  }

  const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString(
    "base64"
  );

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountInRupees * 100,
      currency: "INR",
      receipt,
      notes: { product: "TopCreator.in bid" },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create Razorpay order");
  }

  const order = (await response.json()) as { id: string; amount: number; currency: string };

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? RAZORPAY_KEY_ID,
  };
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!isRazorpayConfigured()) {
    return Boolean(orderId.startsWith("order_mock_") && paymentId && signature);
  }

  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expected === signature;
}
