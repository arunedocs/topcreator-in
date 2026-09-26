import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RankingsBoard } from "@/components/leaderboard/RankingsBoard";
import { ActivityTicker } from "@/components/activity/ActivityTicker";
import { getBiggestMovers, getLeaderboard, getRecentActivity, getTodayLeaderboard, getTrendingCreators } from "@/lib/leaderboard";
import { getCategoryBySlug, getCategoryLabel } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import { track } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Category" };
  return {
    title: `${category.label} creators`,
    description: `Top ${category.label} creators on ${APP_NAME}. Bid, rank, and get discovered.`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  track({ name: "category_view", properties: { slug } });

  const [allTime, today, trending, movers, activity] = await Promise.all([
    getLeaderboard(category.id),
    getTodayLeaderboard(category.id),
    getTrendingCreators(8),
    getBiggestMovers(8),
    getRecentActivity(12),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: category.label },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 sm:p-8">
        <p className="text-3xl">{category.emoji}</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">{category.label}</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Compete for the top {getCategoryLabel(category.id)} spot. Today&apos;s board sits alongside the all-time ranking.
        </p>
      </div>

      <div className="mt-6">
        <ActivityTicker activity={activity.filter((item) => item.category === category.id)} />
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-white">All-time ranking</h2>
        <RankingsBoard
          initialEntries={allTime}
          initialCategory={category.id}
          showCategoryFilter={false}
        />
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">Today</h2>
          <div className="grid gap-3">
            {today.slice(0, 5).map((entry) => (
              <LeaderboardRow key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">Trending & movers</h2>
          <div className="grid gap-3">
            {[...trending, ...movers]
              .filter((entry) => entry.category === category.id)
              .slice(0, 5)
              .map((entry) => (
                <LeaderboardRow key={`${entry.id}-t`} entry={entry} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

