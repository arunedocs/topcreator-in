"use server";

import { revalidatePath } from "next/cache";
import { type CategoryId } from "@/lib/constants";
import { confirmVerifiedBid, getServerMinimumBid } from "@/lib/bid-engine";
import { getTopBid } from "@/lib/leaderboard";
import { appendOwnedClaimToken } from "@/lib/ownership";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { getAvatarUrl, normalizeYouTubeUrl } from "@/lib/utils";
import { isValidCategory, validateYouTubeUrl } from "@/lib/validation";
import { lookupCreatorByUrl } from "@/lib/creators";
import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";

export async function validateBidForm(formData: FormData) {
  const channelName = String(formData.get("channelName") ?? "").trim();
  const rawChannelUrl = String(formData.get("channelUrl") ?? "");
  const categoryRaw = String(formData.get("category") ?? "TECH");
  const bidAmount = Number(formData.get("bidAmount"));
  const subscriberCount = Number(formData.get("subscriberCount") ?? 0);

  if (!channelName) {
    return { error: "Channel name is required." };
  }

  if (channelName.length < 2) {
    return { error: "Channel name looks too short." };
  }

  const urlValidation = validateYouTubeUrl(rawChannelUrl);
  if (!urlValidation.valid) {
    return { error: urlValidation.error ?? "Invalid YouTube URL." };
  }

  if (!isValidCategory(categoryRaw)) {
    return { error: "Please select a valid category." };
  }

  const category = categoryRaw as CategoryId;

  if (Number.isNaN(bidAmount) || bidAmount <= 0) {
    return { error: "Enter a valid bid amount." };
  }

  const channelUrl = normalizeYouTubeUrl(urlValidation.normalized);

  const existingBid = await prisma.creatorBid.findUnique({
    where: {
      channelUrl_category: {
        channelUrl,
        category: category as Category,
      },
    },
  });

  const currentTop = await getTopBid(category);
  const minimumBid = getServerMinimumBid(currentTop, existingBid?.bidAmount ?? null);

  if (bidAmount < minimumBid) {
    return {
      error: `Minimum bid for this category is ₹${minimumBid}.`,
    };
  }

  const existing = await lookupCreatorByUrl(channelUrl);

  return {
    success: true,
    payload: {
      channelName,
      channelUrl,
      category,
      bidAmount,
      subscriberCount: subscriberCount > 0 ? subscriberCount : 10_000,
      avatarUrl: getAvatarUrl(channelName, channelUrl),
    },
    existing: existing ?? undefined,
  };
}

export async function confirmBidPayment(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  const paymentId = String(formData.get("paymentId") ?? "");
  const signature = String(formData.get("signature") ?? "");
  const channelName = String(formData.get("channelName") ?? "");
  const rawChannelUrl = String(formData.get("channelUrl") ?? "");
  const categoryRaw = String(formData.get("category") ?? "TECH");
  const bidAmount = Number(formData.get("bidAmount"));
  const subscriberCount = Number(formData.get("subscriberCount"));
  const avatarUrl = String(formData.get("avatarUrl") ?? "");

  if (!orderId || !paymentId || !signature) {
    return { error: "Missing payment verification fields." };
  }

  if (!isValidCategory(categoryRaw)) {
    return { error: "Invalid category." };
  }

  const urlValidation = validateYouTubeUrl(rawChannelUrl);
  if (!urlValidation.valid || !channelName || Number.isNaN(bidAmount) || bidAmount <= 0) {
    return { error: "Invalid bid payload." };
  }

  const isValid = verifyRazorpaySignature(orderId, paymentId, signature);

  if (!isValid) {
    return { error: "Payment verification failed." };
  }

  try {
    const result = await confirmVerifiedBid({
      orderId,
      paymentId,
      signature,
      channelName: channelName.trim(),
      channelUrl: normalizeYouTubeUrl(urlValidation.normalized),
      category: categoryRaw,
      bidAmount,
      subscriberCount: subscriberCount > 0 ? subscriberCount : 10_000,
      avatarUrl: avatarUrl || getAvatarUrl(channelName, rawChannelUrl),
    });

    if (result.claimToken) {
      await appendOwnedClaimToken(result.claimToken);
    }

    revalidatePath("/");
    revalidatePath("/rankings");
    revalidatePath("/trending");
    revalidatePath(`/creator/${result.slug}`);
    revalidatePath("/dashboard");

    return {
      success: true as const,
      rank: result.rank,
      slug: result.slug,
      category: result.category,
      bidAmount: result.bidAmount,
      previousRank: result.previousRank,
      outbidCreatorName: result.outbidCreatorName,
    };
  } catch (error) {
    console.error("confirmBidPayment failed:", error);
    return { error: publicBidError(error) };
  }
}

function publicBidError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.startsWith("Minimum bid")) return message;
  if (message.startsWith("New bid must")) return "Your bid has to be higher than your current bid.";
  if (message.includes("does not match")) return "That payment does not match this bid.";
  if (message.includes("different creator")) return "That payment is locked to another listing.";
  if (message.includes("Transaction already closed") || message.includes("expired transaction")) {
    return "The rank update timed out before it finished, so this payment was not applied. Please try the bid once more.";
  }
  return "We couldn't confirm this bid. If money left your account, the rank will not be applied twice.";
}
