"use server";

import { revalidatePath } from "next/cache";
import { BID_INCREMENT, MIN_BID_AMOUNT, type CategoryId } from "@/lib/constants";
import { getTopBid, upsertCreatorBid } from "@/lib/leaderboard";
import { createRazorpayOrder, verifyRazorpaySignature } from "@/lib/razorpay";
import { getAvatarUrl, normalizeYouTubeUrl } from "@/lib/utils";

export async function createBidOrder(formData: FormData) {
  const channelName = String(formData.get("channelName") ?? "").trim();
  const channelUrl = normalizeYouTubeUrl(String(formData.get("channelUrl") ?? ""));
  const category = String(formData.get("category") ?? "TECH") as CategoryId;
  const bidAmount = Number(formData.get("bidAmount"));
  const subscriberCount = Number(formData.get("subscriberCount") ?? 0);

  if (!channelName || !channelUrl || !category || Number.isNaN(bidAmount)) {
    return { error: "Please fill in all required fields." };
  }

  if (!channelUrl.includes("youtube.com") && !channelUrl.includes("youtu.be")) {
    return { error: "Please enter a valid YouTube channel URL." };
  }

  const currentTop = await getTopBid(category);
  const minimumBid = currentTop > 0 ? currentTop + BID_INCREMENT : MIN_BID_AMOUNT;

  if (bidAmount < minimumBid) {
    return {
      error: `Minimum bid for #1 is ₹${minimumBid}.`,
    };
  }

  const order = await createRazorpayOrder(bidAmount, `bid_${Date.now()}`);

  return {
    success: true,
    order,
    payload: {
      channelName,
      channelUrl,
      category,
      bidAmount,
      subscriberCount: subscriberCount || 10_000,
      avatarUrl: getAvatarUrl(channelName, channelUrl),
    },
  };
}

export async function confirmBidPayment(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  const paymentId = String(formData.get("paymentId") ?? "");
  const signature = String(formData.get("signature") ?? "");
  const channelName = String(formData.get("channelName") ?? "");
  const channelUrl = String(formData.get("channelUrl") ?? "");
  const category = String(formData.get("category") ?? "TECH") as CategoryId;
  const bidAmount = Number(formData.get("bidAmount"));
  const subscriberCount = Number(formData.get("subscriberCount"));
  const avatarUrl = String(formData.get("avatarUrl") ?? "");

  const isValid = verifyRazorpaySignature(orderId, paymentId, signature);

  if (!isValid) {
    return { error: "Payment verification failed." };
  }

  await upsertCreatorBid({
    channelName,
    channelUrl,
    category,
    bidAmount,
    subscriberCount,
    avatarUrl,
  });

  revalidatePath("/");

  return { success: true };
}
