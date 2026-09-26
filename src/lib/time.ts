import { RANKING_TIMEZONE } from "./constants";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export { RANKING_TIMEZONE };

/** Calendar date in Asia/Kolkata as YYYY-MM-DD. */
export function getIstDateString(now = new Date()): string {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  const year = ist.getUTCFullYear();
  const month = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const day = String(ist.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getIstDayBounds(date = getIstDateString()): { start: Date; end: Date } {
  const [year, month, day] = date.split("-").map(Number);
  const startUtc = Date.UTC(year, month - 1, day, 0, 0, 0, 0) - IST_OFFSET_MS;
  return {
    start: new Date(startUtc),
    end: new Date(startUtc + 24 * 60 * 60 * 1000),
  };
}

export function getIstWeekStart(now = new Date()): Date {
  const today = getIstDateString(now);
  const { start } = getIstDayBounds(today);
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  const weekday = ist.getUTCDay();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  return new Date(start.getTime() - daysFromMonday * 24 * 60 * 60 * 1000);
}

export function shiftIstDate(date: string, days: number): string {
  const { start } = getIstDayBounds(date);
  return getIstDateString(new Date(start.getTime() + days * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000));
}

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  const delta = Math.max(0, now - then);
  const minutes = Math.floor(delta / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
