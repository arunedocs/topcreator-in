import { NextResponse } from "next/server";
import { LEADERBOARD_PERIODS, type CategoryId, type LeaderboardPeriod } from "@/lib/constants";
import { getLeaderboard, getLeaderboardByPeriod } from "@/lib/leaderboard";
import { isValidCategory } from "@/lib/validation";

const PERIODS = new Set(LEADERBOARD_PERIODS.map((item) => item.id));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("category");
  const period = (searchParams.get("period") ?? "all-time") as LeaderboardPeriod;
  const date = searchParams.get("date") ?? undefined;

  let category: CategoryId | undefined;
  if (categoryParam) {
    if (!isValidCategory(categoryParam)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    category = categoryParam;
  }

  if (!PERIODS.has(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  try {
    const leaderboard =
      category && period === "all-time"
        ? await getLeaderboard(category)
        : await getLeaderboardByPeriod(period, category, date);

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
