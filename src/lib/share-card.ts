import { APP_NAME } from "./constants";
import type { LeaderboardEntry } from "./types";
import { formatCurrency, getCategoryLabel } from "./utils";

export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1350;

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  weight: number,
  size: number,
  minSize: number
) {
  let next = size;
  ctx.font = `${weight} ${next}px system-ui, sans-serif`;
  while (ctx.measureText(text).width > maxWidth && next > minSize) {
    next -= 2;
    ctx.font = `${weight} ${next}px system-ui, sans-serif`;
  }
  return next;
}

export function drawShareCard(
  ctx: CanvasRenderingContext2D,
  entry: LeaderboardEntry
) {
  const width = SHARE_CARD_WIDTH;
  const height = SHARE_CARD_HEIGHT;
  const category = getCategoryLabel(entry.category).toUpperCase();
  const rank = entry.rank > 0 ? `#${entry.rank}` : "—";
  const handle = entry.handle ? `@${entry.handle}` : "";
  const bid = formatCurrency(entry.bidAmount);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#09090b";
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(width / 2, 280, 40, width / 2, 280, 520);
  glow.addColorStop(0, "rgba(245, 158, 11, 0.28)");
  glow.addColorStop(1, "rgba(245, 158, 11, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(36, 36, width - 72, height - 72, 48);
  ctx.stroke();

  ctx.fillStyle = "#fbbf24";
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.letterSpacing = "6px";
  ctx.fillText(APP_NAME.toUpperCase(), 96, 140);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = "#a1a1aa";
  ctx.font = "500 26px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("INDIA", width - 96, 140);
  ctx.textAlign = "left";

  ctx.fillStyle = entry.rank === 1 ? "#fbbf24" : "#fafafa";
  const rankSize = fitText(ctx, rank, width - 180, 600, 210, 120);
  ctx.font = `600 ${rankSize}px system-ui, sans-serif`;
  ctx.fillText(rank, 96, 390);

  ctx.fillStyle = "#71717a";
  ctx.font = "600 26px system-ui, sans-serif";
  ctx.letterSpacing = "8px";
  ctx.fillText(category, 96, 450);
  ctx.letterSpacing = "0px";

  const initials = entry.channelName.slice(0, 2).toUpperCase();
  ctx.beginPath();
  ctx.arc(156, 620, 58, 0, Math.PI * 2);
  ctx.fillStyle = "#18181b";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.stroke();
  ctx.fillStyle = "#fafafa";
  ctx.font = "600 36px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(initials, 156, 632);
  ctx.textAlign = "left";

  ctx.fillStyle = "#fafafa";
  const nameSize = fitText(ctx, entry.channelName, width - 320, 600, 54, 34);
  ctx.font = `600 ${nameSize}px system-ui, sans-serif`;
  ctx.fillText(entry.channelName, 240, 610);

  ctx.fillStyle = "#a1a1aa";
  ctx.font = "400 30px system-ui, sans-serif";
  ctx.fillText(handle || "Creator", 240, 656);

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.moveTo(96, 780);
  ctx.lineTo(width - 96, 780);
  ctx.stroke();

  ctx.fillStyle = "#71717a";
  ctx.font = "600 22px system-ui, sans-serif";
  ctx.letterSpacing = "6px";
  ctx.fillText("CURRENT BID", 96, 870);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = "#fafafa";
  ctx.font = "600 84px system-ui, sans-serif";
  ctx.fillText(bid, 96, 970);

  if (entry.verified) {
    ctx.fillStyle = "#38bdf8";
    ctx.font = "600 26px system-ui, sans-serif";
    ctx.fillText("VERIFIED CREATOR", 96, 1040);
  }

  ctx.fillStyle = "#52525b";
  ctx.font = "500 26px system-ui, sans-serif";
  const footer = entry.slug ? `topcreator.in/creator/${entry.slug}` : "topcreator.in";
  ctx.fillText(footer, 96, height - 110);
}

export async function renderShareCardBlob(entry: LeaderboardEntry): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = SHARE_CARD_WIDTH;
  canvas.height = SHARE_CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  drawShareCard(ctx, entry);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Export failed");
  return blob;
}

export function shareCardFilename(entry: LeaderboardEntry) {
  const slug = entry.slug || entry.channelName.replace(/\s+/g, "-").toLowerCase();
  return `topcreator-${slug}.png`;
}
