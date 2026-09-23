import { BID_INCREMENT, MIN_BID_AMOUNT, type CategoryId } from "./constants";

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
  try {
    const parsed = new URL(url.trim());
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.trim();
  }
}

export function getAvatarUrl(name: string, seed?: string): string {
  const label = encodeURIComponent(name.slice(0, 2).toUpperCase());
  return `https://ui-avatars.com/api/?name=${label}&background=18181b&color=f4f4f5&size=128&bold=true&format=svg&seed=${seed ?? name}`;
}

export function buildShareText(entry: {
  channelName: string;
  category: CategoryId;
  bidAmount: number;
}): string {
  return `I'm #1 on ${entry.category} at TopCreator.in 🏆\n\nPaid ${formatCurrency(entry.bidAmount)} to prove my channel hits different.\n\nThink you can outbid me? 👇\nhttps://topcreator.in`;
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
