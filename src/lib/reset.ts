import { RANKING_TIMEZONE } from "./constants";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Daily ranking window closes at midnight Asia/Kolkata. Historical snapshots are kept. */
export const DAILY_RESET_TIMEZONE = RANKING_TIMEZONE;

/** Next leaderboard reset = midnight IST (daily FOMO cycle). */
export function getNextResetDate(): Date {
  const istNow = new Date(Date.now() + IST_OFFSET_MS);
  const nextMidnightUtc = Date.UTC(
    istNow.getUTCFullYear(),
    istNow.getUTCMonth(),
    istNow.getUTCDate() + 1,
    0,
    0,
    0,
    0
  );

  return new Date(nextMidnightUtc - IST_OFFSET_MS);
}

export function getMillisecondsUntilReset(now = Date.now()): number {
  return Math.max(0, getNextResetDate().getTime() - now);
}

export function formatClock(ms: number): { hours: string; minutes: string; seconds: string } {
  const safe = Math.max(0, ms);
  const hours = Math.floor(safe / 3_600_000);
  const minutes = Math.floor((safe % 3_600_000) / 60_000);
  const seconds = Math.floor((safe % 60_000) / 1_000);
  const pad = (value: number) => String(value).padStart(2, "0");
  return { hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) };
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) {
    return "Resetting soon…";
  }

  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}
