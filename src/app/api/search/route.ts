import { NextResponse } from "next/server";
import { searchCreators } from "@/lib/leaderboard";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { track } from "@/lib/analytics";

export async function GET(request: Request) {
  const limited = rateLimit(`search:${getClientIp(request)}`, 40, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many searches." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  try {
    const results = await searchCreators(q);
    track({ name: "search", properties: { q, count: results.length } });
    return NextResponse.json({ results });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
