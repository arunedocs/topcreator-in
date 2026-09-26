import { getRecentActivity } from "@/lib/leaderboard";
import { formatRelativeTime } from "@/lib/time";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live activity",
  description: "Latest bids, rank moves, and new creators on TopCreator.in",
};

export default async function ActivityPage() {
  const activity = await getRecentActivity(40);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Live activity</h1>
      <div className="mt-8 grid gap-2">
        {activity.length === 0 ? (
          <p className="text-zinc-500">Waiting for the first bid.</p>
        ) : (
          activity.map((item) => (
            <article key={item.id} className="rounded-2xl border border-zinc-800 px-4 py-3">
              <p className="text-sm text-zinc-200">{item.message}</p>
              <p className="mt-1 text-xs text-zinc-600">{formatRelativeTime(item.timestamp)}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
