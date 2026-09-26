import { NextResponse } from "next/server";
import { lookupCreatorByUrl } from "@/lib/creators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url") ?? "";

  try {
    const existing = await lookupCreatorByUrl(url);
    return NextResponse.json({ existing });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
