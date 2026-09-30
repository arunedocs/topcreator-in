import {
  getBiggestMovers,
  getGlobalLeaderboard,
  getHomeStats,
  getLeaderboard,
  getNewCreators,
  getRecentActivity,
  getRisingCreators,
  getTrendingCreators,
} from "./leaderboard";
import { ensureTodaySnapshot, getCreatorOfTheDay } from "./snapshots";

export async function getHomePageData() {
  await ensureTodaySnapshot().catch(() => undefined);

  const [allTime, trending, movers, newcomers, rising, activity, winner, stats] =
    await Promise.all([
      getGlobalLeaderboard(8),
      getTrendingCreators(6),
      getBiggestMovers(6),
      getNewCreators(6),
      getRisingCreators(6),
      getRecentActivity(16),
      getCreatorOfTheDay(),
      getHomeStats(),
    ]);

  const spotlightCategory = allTime[0]?.category ?? "TECH";
  const spotlight = (await getLeaderboard(spotlightCategory)).slice(0, 3);

  return {
    allTime,
    trending,
    movers,
    newcomers,
    rising,
    activity,
    winner,
    stats,
    spotlightCategory,
    spotlight,
  };
}

export type HomePageData = Awaited<ReturnType<typeof getHomePageData>>;
