import { NextResponse } from "next/server";
import { getCreatorsBySlugs } from "@/lib/leaderboard";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slugs = (searchParams.get("slugs") ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean)
    .slice(0, 40);

  try {
    const creators = await getCreatorsBySlugs(slugs);
    return NextResponse.json({ creators });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load creators" }, { status: 500 });
  }
}
