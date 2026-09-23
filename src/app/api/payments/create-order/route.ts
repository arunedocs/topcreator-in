import { NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { amount?: number; receipt?: string };
    const amount = body.amount ?? 0;
    const receipt = body.receipt ?? `bid_${Date.now()}`;

    if (amount < 49) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const order = await createRazorpayOrder(amount, receipt);
    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
