import { Dashboard } from "@/components/dashboard/Dashboard";
import { CATEGORIES, type CategoryId } from "@/lib/constants";
import { getLeaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const entries = await Promise.all(
    CATEGORIES.map(async (category) => ({
      category: category.id,
      leaderboard: await getLeaderboard(category.id),
    }))
  );

  const initialData = entries.reduce(
    (acc, item) => {
      acc[item.category] = item.leaderboard;
      return acc;
    },
    {} as Record<CategoryId, Awaited<ReturnType<typeof getLeaderboard>>>
  );

  return <Dashboard initialData={initialData} />;
}
