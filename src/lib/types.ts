import type { CategoryId, LeaderboardPeriod } from "./constants";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  channelName: string;
  channelUrl: string;
  avatarUrl: string;
  subscriberCount: number;
  category: CategoryId;
  bidAmount: number;
  createdAt: string;
  slug: string;
  handle: string;
  verified: boolean;
  previousRank: number | null;
  movement: number;
  youtubeClicks?: number;
  profileViews?: number;
}

export interface BidFormData {
  channelName: string;
  channelUrl: string;
  category: CategoryId;
  bidAmount: number;
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  mock?: boolean;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface ActivityItem {
  id: string;
  channelName: string;
  category: CategoryId | null;
  categoryLabel: string;
  bidAmount: number | null;
  timestamp: string;
  message: string;
  slug?: string | null;
  type?: string;
  fromRank?: number | null;
  toRank?: number | null;
}

export interface BidSuccessPayload {
  channelName: string;
  channelUrl: string;
  category: CategoryId;
  bidAmount: number;
  subscriberCount: number;
  avatarUrl: string;
  slug?: string;
  rank?: number;
  handle?: string;
}

export interface ConfirmBidResult {
  success: true;
  rank: number;
  slug: string;
  category: CategoryId;
  bidAmount: number;
  previousRank: number | null;
  outbidCreatorName: string | null;
}

export interface ExistingCreatorHint {
  slug: string;
  channelName: string;
  category: CategoryId;
  rank: number;
  bidAmount: number;
  handle: string;
}

export interface CreatorProfile {
  id: string;
  slug: string;
  channelName: string;
  channelUrl: string;
  handle: string;
  avatarUrl: string;
  subscriberCount: number;
  videoCount: number;
  category: CategoryId;
  verified: boolean;
  verificationCode: string | null;
  suspended: boolean;
  profileViews: number;
  youtubeClicks: number;
  shareCount: number;
  daysAtOne: number;
  currentStreak: number;
  highestBid: number;
  currentBid: number;
  currentRank: number | null;
  overallRank: number | null;
  previousRank: number | null;
  movement: number;
  joinedAt: string;
  badges: Array<{ type: string; label: string; awardedAt: string }>;
}

export interface BidHistoryPoint {
  id: string;
  amount: number;
  rankAfter: number;
  previousRank: number | null;
  createdAt: string;
  category: CategoryId;
}

export interface HomeStats {
  creators: number;
  liveBids: number;
  volume: number;
  youtubeClicks: number;
}

export interface PeriodQuery {
  period: LeaderboardPeriod;
  category?: CategoryId;
  date?: string;
}

export type PaymentUiState =
  | "idle"
  | "preparing"
  | "opened"
  | "processing"
  | "verifying"
  | "confirmed"
  | "failed";
