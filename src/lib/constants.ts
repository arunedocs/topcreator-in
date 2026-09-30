export const CATEGORIES = [
  { id: "TECH", slug: "technology", label: "Technology", emoji: "💻" },
  { id: "GAMING", slug: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "FINANCE", slug: "finance", label: "Finance", emoji: "💰" },
  { id: "EDUCATION", slug: "education", label: "Education", emoji: "📚" },
  { id: "CODING", slug: "coding", label: "Coding", emoji: "⌨️" },
  { id: "AI", slug: "ai", label: "AI", emoji: "🤖" },
  { id: "BUSINESS", slug: "business", label: "Business", emoji: "📈" },
  { id: "COMEDY", slug: "comedy", label: "Comedy", emoji: "😂" },
  { id: "VLOGS", slug: "vlogs", label: "Vlogs", emoji: "📹" },
  { id: "ENTERTAINMENT", slug: "entertainment", label: "Entertainment", emoji: "🎬" },
  { id: "MUSIC", slug: "music", label: "Music", emoji: "🎵" },
  { id: "FITNESS", slug: "fitness", label: "Fitness", emoji: "💪" },
  { id: "FOOD", slug: "food", label: "Food", emoji: "🍽️" },
  { id: "TRAVEL", slug: "travel", label: "Travel", emoji: "✈️" },
  { id: "BEAUTY", slug: "beauty", label: "Beauty", emoji: "✨" },
  { id: "AUTOMOTIVE", slug: "automotive", label: "Automotive", emoji: "🚗" },
  { id: "SPORTS", slug: "sports", label: "Sports", emoji: "🏆" },
  { id: "SHORTS", slug: "shorts", label: "Shorts", emoji: "📱" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const MIN_BID_AMOUNT = 49;
export const BID_INCREMENT = 20;

export const APP_NAME = "TopCreator.in";
export const APP_TAGLINE = "India's creator leaderboard";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://topcreator.in";

export const LEADERBOARD_POLL_MS = 30_000;
export const ACTIVITY_POLL_MS = 15_000;

/** Daily ranking window timezone. Snapshots reset conceptually at midnight IST. */
export const RANKING_TIMEZONE = "Asia/Kolkata";

export const LEADERBOARD_PERIODS = [
  { id: "all-time", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "trending", label: "Trending" },
  { id: "new", label: "New" },
  { id: "movers", label: "Biggest Movers" },
] as const;

export type LeaderboardPeriod = (typeof LEADERBOARD_PERIODS)[number]["id"];

export const REPORT_REASONS = [
  { id: "FAKE_CREATOR", label: "Fake creator" },
  { id: "IMPERSONATION", label: "Impersonation" },
  { id: "SPAM", label: "Spam" },
  { id: "INCORRECT_CATEGORY", label: "Incorrect category" },
  { id: "OFFENSIVE", label: "Offensive content" },
  { id: "OTHER", label: "Other" },
] as const;

export const BADGE_META = {
  CHAMPION: { label: "#1 Champion", description: "Held #1 in a category" },
  STREAK_7: { label: "7 Day Streak", description: "Held #1 for 7 consecutive IST days" },
  STREAK_30: { label: "30 Day Streak", description: "Held #1 for 30 consecutive IST days" },
  FASTEST_RISER: { label: "Fastest Riser", description: "Climbed 5+ ranks in a single bid" },
  BIGGEST_MOVER: { label: "Biggest Mover", description: "Largest rank gain in a day" },
  RISING_CREATOR: { label: "Rising Creator", description: "Joined in the last 7 days and ranked top 10" },
  CATEGORY_CHAMPION: { label: "Category Champion", description: "Current #1 in a category" },
  VERIFIED: { label: "Verified Creator", description: "Completed channel verification" },
} as const;

export const ADMIN_COOKIE = "tc_admin";
export const OWNER_COOKIE = "tc_owned";

/** Subscriber count saved with a bid. Not a live YouTube subscriber total. */
export const SUBSCRIBER_BANDS = [
  { id: "all", label: "All", min: 0, max: Number.POSITIVE_INFINITY },
  { id: "under-10k", label: "Under 10K", min: 0, max: 9_999 },
  { id: "10k-100k", label: "10K–100K", min: 10_000, max: 99_999 },
  { id: "100k-1m", label: "100K–1M", min: 100_000, max: 999_999 },
  { id: "1m-plus", label: "1M+", min: 1_000_000, max: Number.POSITIVE_INFINITY },
] as const;

export type SubscriberBandId = (typeof SUBSCRIBER_BANDS)[number]["id"];
