import crypto from "crypto";
import Razorpay from "razorpay";
import type { CreateOrderResponse } from "./types";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";

export function isRazorpayConfigured(): boolean {
  return Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
}

function getRazorpayClient(): Razorpay {
  if (!isRazorpayConfigured()) {
    throw new Error("Razorpay credentials are not configured");
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

export async function createRazorpayOrder(
  amountPaise: number,
  receipt: string,
  currency = "INR"
): Promise<CreateOrderResponse> {
  if (amountPaise < 100) {
    throw new Error("Amount must be at least 100 paise");
  }

  if (!isRazorpayConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Razorpay credentials are not configured on the server");
    }

    return {
      order_id: `order_mock_${Date.now()}`,
      amount: amountPaise,
      currency,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "rzp_test_placeholder",
      mock: true,
    };
  }

  const razorpay = getRazorpayClient();

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency,
    receipt,
    notes: { product: "TopCreator.in bid" },
  });

  return {
    order_id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? RAZORPAY_KEY_ID,
  };
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  if (!isRazorpayConfigured()) {
    return Boolean(orderId.startsWith("order_mock_") && paymentId && signature);
  }

  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expected === signature;
}

export function getRazorpayErrorStatus(error: unknown): number {
  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    if (error.statusCode === 401) {
      return 401;
    }
  }

  return 500;
}
