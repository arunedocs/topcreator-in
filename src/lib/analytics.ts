export type AnalyticsEventName =
  | "creator_view"
  | "creator_submit"
  | "creator_verified"
  | "bid_started"
  | "payment_started"
  | "payment_success"
  | "bid_created"
  | "bid_increased"
  | "rank_changed"
  | "creator_outbid"
  | "youtube_click"
  | "profile_shared"
  | "share_clicked"
  | "category_view"
  | "search"
  | "notification_clicked";

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  properties?: Record<string, string | number | boolean | null | undefined>;
}

/**
 * Analytics facade. Swap the sink without touching bid/payment logic.
 */
export function track(event: AnalyticsEvent): void {
  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", event.name, event.properties ?? {});
  }
}
