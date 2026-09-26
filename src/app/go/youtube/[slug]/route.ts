import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { track } from "@/lib/analytics";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const creator = await prisma.creator.findUnique({
    where: { slug },
    select: { id: true, channelUrl: true, suspended: true },
  });

  if (!creator || creator.suspended) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const ip = getClientIp(request);
  const limited = rateLimit(`yt:${ip}:${creator.id}`, 8, 60_000);
  const ipHash = createHash("sha256").update(`${ip}:${new Date().toDateString()}`).digest("hex");

  if (limited.ok) {
    const recent = await prisma.clickEvent.findFirst({
      where: {
        creatorId: creator.id,
        ipHash,
        createdAt: { gte: new Date(Date.now() - 20_000) },
      },
    });

    if (!recent) {
      await prisma.$transaction([
        prisma.clickEvent.create({
          data: {
            creatorId: creator.id,
            ipHash,
            userAgent: request.headers.get("user-agent")?.slice(0, 180),
          },
        }),
        prisma.creator.update({
          where: { id: creator.id },
          data: { youtubeClicks: { increment: 1 } },
        }),
      ]);
      track({ name: "youtube_click", properties: { slug } });
    }
  }

  return NextResponse.redirect(creator.channelUrl, 302);
}
