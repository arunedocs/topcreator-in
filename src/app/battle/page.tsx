import type { Metadata } from "next";
import { CategoryBattle } from "@/components/battle/CategoryBattle";
import { CATEGORIES, type CategoryId } from "@/lib/constants";
import { getLeaderboard, getRecentActivity } from "@/lib/leaderboard";
import { getCategoryLabel } from "@/lib/utils";
import { isValidCategory } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bid battle",
  description: "Current top three verified bids and recent bid activity. No invented events.",
};

export default async function BattlePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: raw } = await searchParams;
  const category: CategoryId = raw && isValidCategory(raw) ? raw : "TECH";
  const [board, activity] = await Promise.all([
    getLeaderboard(category),
    getRecentActivity(24),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">{getCategoryLabel(category)} bid battle</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        #1, #2, and #3 are the current verified bids. Activity is recorded events only.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map((item) => (
          <a
            key={item.id}
            href={`/battle?category=${item.id}`}
            className={`rounded-full px-3 py-1 text-xs ${
              item.id === category ? "bg-white text-zinc-950" : "border border-zinc-800 text-zinc-400"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>
      <div className="mt-8">
        <CategoryBattle
          category={category}
          initial={board.slice(0, 3)}
          activity={activity.filter((item) => item.category === category)}
        />
      </div>
    </div>
  );
}
