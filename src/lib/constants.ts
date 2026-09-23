export const CATEGORIES = [
  { id: "TECH", label: "Tech", emoji: "💻" },
  { id: "GAMING", label: "Gaming", emoji: "🎮" },
  { id: "VLOGS", label: "Vlogs", emoji: "📹" },
  { id: "COMEDY", label: "Comedy", emoji: "😂" },
  { id: "FINANCE", label: "Finance", emoji: "💰" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const MIN_BID_AMOUNT = 49;
export const BID_INCREMENT = 20;

export const APP_NAME = "TopCreator.in";
export const APP_TAGLINE = "India's creator leaderboard — money decides the rank.";
