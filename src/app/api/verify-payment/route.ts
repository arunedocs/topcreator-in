import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    const orderId = body.razorpay_order_id?.trim();
    const paymentId = body.razorpay_payment_id?.trim();
    const signature = body.razorpay_signature?.trim();

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpaySignature(orderId, paymentId, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment signature verification failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify payment failed:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
