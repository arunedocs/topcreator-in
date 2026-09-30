"use client";

import { useMemo, useState } from "react";
import type { BidHistoryPoint } from "@/lib/types";

const WINDOWS = [
  { id: "24h", label: "24 Hours", ms: 24 * 60 * 60 * 1000 },
  { id: "7d", label: "7 Days", ms: 7 * 24 * 60 * 60 * 1000 },
  { id: "30d", label: "30 Days", ms: 30 * 24 * 60 * 60 * 1000 },
  { id: "all", label: "All Time", ms: Number.POSITIVE_INFINITY },
] as const;

export function RankHistory({ history }: { history: BidHistoryPoint[] }) {
  const [windowId, setWindowId] = useState<(typeof WINDOWS)[number]["id"]>("all");

  const points = useMemo(() => {
    const window = WINDOWS.find((item) => item.id === windowId) ?? WINDOWS[3];
    const cutoff = Number.isFinite(window.ms) ? Date.now() - window.ms : 0;
    return history
      .filter((point) => Date.parse(point.createdAt) >= cutoff)
      .slice()
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  }, [history, windowId]);

  const stats = useMemo(() => {
    if (points.length === 0) return null;
    const ranks = points.map((point) => point.rankAfter);
    const topTenDays = new Set(
      points.filter((point) => point.rankAfter <= 10).map((point) => point.createdAt.slice(0, 10))
    );
    return {
      highest: Math.min(...ranks),
      lowest: Math.max(...ranks),
      average: Math.round(ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length),
      topTenDays: topTenDays.size,
    };
  }, [points]);

  const path = useMemo(() => {
    if (points.length < 2) return "";
    const width = 320;
    const height = 120;
    const ranks = points.map((point) => point.rankAfter);
    const max = Math.max(...ranks);
    const min = Math.min(...ranks);
    return points
      .map((point, index) => {
        const x = (index / (points.length - 1)) * width;
        const norm = max === min ? 0.5 : (point.rankAfter - min) / (max - min);
        const y = 12 + norm * (height - 24);
        return `${index === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }, [points]);

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Rank history</h2>
          <p className="mt-1 text-sm text-zinc-500">Each point is a recorded bid, not an estimated rank.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {WINDOWS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setWindowId(item.id)}
              className={`rounded-full px-3 py-1 text-xs ${
                windowId === item.id ? "bg-white text-zinc-950" : "border border-zinc-800 text-zinc-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {points.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-zinc-800 px-4 py-8 text-sm text-zinc-500">
          Not enough historical data yet.
        </p>
      ) : (
        <>
          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
            {points.length < 2 ? (
              <p className="text-sm text-zinc-400">
                One bid so far: #{points[0]?.rankAfter}. Another bid will draw the line.
              </p>
            ) : (
              <svg viewBox="0 0 320 120" className="h-32 w-full text-amber-300" role="img" aria-label="Rank history chart">
                <path d={path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          {stats ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              <Stat label="Highest rank" value={`#${stats.highest}`} />
              <Stat label="Lowest rank" value={`#${stats.lowest}`} />
              <Stat label="Average rank" value={`#${stats.average}`} />
              <Stat label="Days in Top 10" value={String(stats.topTenDays)} />
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}
