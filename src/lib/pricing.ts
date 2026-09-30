import { BID_INCREMENT, MIN_BID_AMOUNT } from "./constants";

/**
 * Paid products that are not `available` must not open checkout.
 * Bid pricing is the live product. Change these values to retune the page.
 */
export const PRICING = {
  free: {
    name: "Free",
    priceLabel: "₹0",
    available: true,
    points: [
      "Public creator profile after a bid",
      "Category ranking",
      "Profile views, clicks, and shares",
      "Search and discovery",
    ],
  },
  bids: {
    name: "Promotional bids",
    priceLabel: `From ₹${MIN_BID_AMOUNT}`,
    available: true,
    points: [
      `First bid in an empty category starts at ₹${MIN_BID_AMOUNT}`,
      `Each outbid must beat the current bid by ₹${BID_INCREMENT}`,
      "Paid via Razorpay. Rank updates only after server verification",
      "Sponsored placement is the bid itself — labelled as a paid rank",
    ],
  },
  pro: {
    name: "Creator Pro",
    priceLabel: "₹299/month",
    available: false,
    points: [
      "Advanced analytics",
      "Rank history export",
      "Profile customization",
      "Watchlist alerts",
    ],
  },
  featured: {
    name: "Featured creator",
    priceLabel: "Daily placement",
    available: false,
    points: ["Homepage feature separate from the paid rank", "Always labelled as featured"],
  },
  sponsorship: {
    name: "Category sponsorship",
    priceLabel: "Custom",
    available: false,
    points: ["Premium category visibility", "Always labelled as sponsored"],
  },
} as const;
