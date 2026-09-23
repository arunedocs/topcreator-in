import type { CategoryId } from "./constants";

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
}

export interface BidFormData {
  channelName: string;
  channelUrl: string;
  category: CategoryId;
  bidAmount: number;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  mock?: boolean;
}
