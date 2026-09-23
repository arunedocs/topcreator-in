import { NextResponse } from "next/server";
import type { CategoryId } from "@/lib/constants";
import { getLeaderboard } from "@/lib/leaderboard";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = (searchParams.get("category") ?? "TECH") as CategoryId;

  try {
    const leaderboard = await getLeaderboard(category);
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
