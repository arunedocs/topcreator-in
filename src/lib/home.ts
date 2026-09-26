import {
  getBiggestMovers,
  getGlobalLeaderboard,
  getHomeStats,
  getNewCreators,
  getRecentActivity,
  getTodayLeaderboard,
  getTrendingCreators,
} from "./leaderboard";
import { ensureTodaySnapshot, getCreatorOfTheDay } from "./snapshots";

export async function getHomePageData() {
  await ensureTodaySnapshot().catch(() => undefined);

  const [allTime, today, trending, movers, newcomers, activity, winner, stats] =
    await Promise.all([
      getGlobalLeaderboard(8),
      getTodayLeaderboard(undefined),
      getTrendingCreators(6),
      getBiggestMovers(6),
      getNewCreators(6),
      getRecentActivity(16),
      getCreatorOfTheDay(),
      getHomeStats(),
    ]);

  return {
    allTime,
    today: today.slice(0, 6),
    trending,
    movers,
    newcomers,
    activity,
    winner,
    stats,
  };
}

export type HomePageData = Awaited<ReturnType<typeof getHomePageData>>;
