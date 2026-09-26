"use client";

import { Crown, ExternalLink, Share2, TrendingUp } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/types";
import { cn, formatCurrency, formatSubscribers, getMinimumBid } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  onShare?: (entry: LeaderboardEntry) => void;
}

export function LeaderboardCard({ entry, onShare }: LeaderboardCardProps) {
  const isTop = entry.rank === 1;
  const isPodium = entry.rank <= 3;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-4 transition-all sm:p-5",
        isTop
          ? "border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 shadow-[0_0_40px_rgba(245,158,11,0.12)]"
          : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70"
      )}
    >
      {isTop ? (
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-400/20 blur-2xl" />
      ) : null}

      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold",
            isTop
              ? "bg-amber-400 text-zinc-950"
              : isPodium
                ? "bg-zinc-800 text-zinc-100"
                : "bg-zinc-950 text-zinc-500"
          )}
        >
          {isTop ? <Crown className="h-5 w-5" /> : `#${entry.rank}`}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <img
                src={entry.avatarUrl}
                alt={entry.channelName}
                className="h-12 w-12 rounded-full border border-zinc-700 bg-zinc-800"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-base font-semibold text-white">
                    {entry.channelName}
                  </h3>
                  {isTop ? (
                    <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                      Reigning #1
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {formatSubscribers(entry.subscriberCount)}
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Active bid
              </p>
              <p
                className={cn(
                  "mt-1 text-2xl font-semibold tracking-tight",
                  isTop ? "text-amber-300" : "text-white"
                )}
              >
                {formatCurrency(entry.bidAmount)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a
              href={entry.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
            >
              Visit Channel
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            {isTop && onShare ? (
              <Button
                variant="secondary"
                className="h-8 rounded-full px-3 py-1 text-xs"
                onClick={() => onShare(entry)}
              >
                <Share2 className="h-3.5 w-3.5" />
                Flex on X / IG
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                <TrendingUp className="h-3.5 w-3.5" />
                Bid ₹{getMinimumBid(entry.bidAmount)}+ to outrank
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
