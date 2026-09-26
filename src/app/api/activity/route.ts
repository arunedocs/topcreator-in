import { NextResponse } from "next/server";
import { getRecentActivity } from "@/lib/leaderboard";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, Number(searchParams.get("limit") ?? 20) || 20);

  try {
    const activity = await getRecentActivity(limit);
    return NextResponse.json({ activity });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
