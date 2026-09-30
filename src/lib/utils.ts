import {
  APP_NAME,
  APP_URL,
  BID_INCREMENT,
  CATEGORIES,
  MIN_BID_AMOUNT,
  type CategoryId,
  type CategorySlug,
} from "./constants";
import type { BidSuccessPayload, LeaderboardEntry } from "./types";
import { parseYouTubeChannel } from "./youtube";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSubscribers(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M subs`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K subs`;
  }
  return `${count} subs`;
}

export function getMinimumBid(currentTopBid: number): number {
  if (currentTopBid <= 0) {
    return MIN_BID_AMOUNT;
  }
  return currentTopBid + BID_INCREMENT;
}

export function normalizeYouTubeUrl(url: string): string {
  const parsed = parseYouTubeChannel(url);
  if (parsed) return parsed.normalizedUrl;

  try {
    const value = new URL(url.trim());
    value.search = "";
    value.hash = "";
    return value.toString().replace(/\/$/, "");
  } catch {
    return url.trim();
  }
}

export function getAvatarUrl(name: string, seed?: string): string {
  const label = encodeURIComponent(name.slice(0, 2).toUpperCase());
  return `https://ui-avatars.com/api/?name=${label}&background=18181b&color=f4f4f5&size=128&bold=true&format=svg&seed=${seed ?? name}`;
}

export function getCategoryLabel(category: CategoryId): string {
  return CATEGORIES.find((item) => item.id === category)?.label ?? category;
}

export function getCategorySlug(category: CategoryId): CategorySlug | string {
  return CATEGORIES.find((item) => item.id === category)?.slug ?? category.toLowerCase();
}

export function getCategoryBySlug(slug: string): (typeof CATEGORIES)[number] | undefined {
  return CATEGORIES.find((item) => item.slug === slug || item.id === slug.toUpperCase());
}

export function getCategoryEmoji(category: CategoryId): string {
  return CATEGORIES.find((item) => item.id === category)?.emoji ?? "✨";
}

export function buildProfileUrl(slug: string): string {
  return `${APP_URL}/creator/${slug}`;
}

export function buildAchievementHeadline(entry: {
  channelName: string;
  category: CategoryId;
  rank?: number;
  movement?: number;
}): string {
  const label = getCategoryLabel(entry.category);
  const rank = entry.rank ?? 0;
  if (rank === 1) return `I reached #1 ${label} Creator on TopCreator.`;
  if (rank > 0 && rank <= 10) return `I entered the Top 10 in ${label} on TopCreator.`;
  if ((entry.movement ?? 0) >= 5) {
    return `I climbed ${entry.movement} positions in ${label} on TopCreator.`;
  }
  if (rank > 0) return `I'm #${rank} in ${label} on TopCreator.`;
  return `${entry.channelName} on TopCreator.`;
}

export function buildShareText(entry: {
  channelName: string;
  category: CategoryId;
  bidAmount: number;
  rank?: number;
  slug?: string;
  movement?: number;
}): string {
  const url = entry.slug ? buildProfileUrl(entry.slug) : APP_URL;

  return `${buildAchievementHeadline(entry)}\n\n${entry.channelName} · ${formatCurrency(entry.bidAmount)} bid\n\nThink you can outbid me?\n${url}`;
}

export function buildTwitterShareText(entry: {
  channelName: string;
  category: CategoryId;
  bidAmount: number;
  rank?: number;
  slug?: string;
  movement?: number;
}): string {
  const url = entry.slug ? buildProfileUrl(entry.slug) : APP_URL;
  return `${buildAchievementHeadline(entry)}\n\n${entry.channelName} · ${formatCurrency(entry.bidAmount)}\n\n${url}`;
}

export function buildInstagramCaption(entry: {
  channelName: string;
  category: CategoryId;
  bidAmount: number;
  rank?: number;
}): string {
  const label = getCategoryLabel(entry.category);
  const rank = entry.rank ?? 1;
  return `#${rank} in ${label} on ${APP_NAME} 🚀\n\n${entry.channelName} · ${formatCurrency(entry.bidAmount)}\n\n#TopCreator #YouTubeIndia #CreatorEconomy #${label}`;
}

export function buildWhatsAppShareText(entry: {
  channelName: string;
  category: CategoryId;
  bidAmount: number;
  rank?: number;
  slug?: string;
}): string {
  return buildShareText(entry);
}

export function buildActivityMessage(
  channelName: string,
  categoryLabel: string,
  bidAmount: number
): string {
  return `${channelName} grabbed #1 in ${categoryLabel} with ${formatCurrency(bidAmount)}! 🔥`;
}

export function applyOptimisticBid(
  entries: LeaderboardEntry[],
  payload: BidSuccessPayload
): LeaderboardEntry[] {
  const existingIndex = entries.findIndex(
    (entry) => entry.channelUrl === payload.channelUrl
  );

  const previous = existingIndex >= 0 ? entries[existingIndex] : null;
  const optimisticEntry: LeaderboardEntry = {
    id: previous?.id ?? `optimistic-${Date.now()}`,
    rank: 1,
    channelName: payload.channelName,
    channelUrl: payload.channelUrl,
    avatarUrl: payload.avatarUrl,
    subscriberCount: payload.subscriberCount,
    category: payload.category,
    bidAmount: payload.bidAmount,
    createdAt: new Date().toISOString(),
    slug: payload.slug ?? previous?.slug ?? "",
    handle: payload.handle ?? previous?.handle ?? "",
    verified: previous?.verified ?? false,
    previousRank: previous?.rank ?? null,
    movement: previous ? previous.rank - 1 : 0,
  };

  const nextEntries =
    existingIndex >= 0
      ? entries.map((entry, index) => (index === existingIndex ? optimisticEntry : entry))
      : [...entries, optimisticEntry];

  return nextEntries
    .sort((a, b) => b.bidAmount - a.bidAmount || a.createdAt.localeCompare(b.createdAt))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
