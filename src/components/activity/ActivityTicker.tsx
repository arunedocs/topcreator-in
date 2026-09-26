"use client";

import { Zap } from "lucide-react";
import type { ActivityItem } from "@/lib/types";

interface ActivityTickerProps {
  activity: ActivityItem[];
}

export function ActivityTicker({ activity }: ActivityTickerProps) {
  if (activity.length === 0) {
    return (
      <div className="border-t border-zinc-800/80 bg-zinc-950/90">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 text-xs text-zinc-500 sm:px-6">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          Waiting for the first outbid war…
        </div>
      </div>
    );
  }

  const loopItems = [...activity, ...activity];

  return (
    <div className="relative overflow-hidden border-t border-zinc-800/80 bg-zinc-950/90">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-zinc-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-zinc-950 to-transparent" />

      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Live
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="ticker-track flex w-max gap-10">
            {loopItems.map((item, index) => (
              <p key={`${item.id}-${index}`} className="whitespace-nowrap text-sm text-zinc-300">
                {item.message}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
