import type { MetadataRoute } from "next";
import { CATEGORIES, APP_URL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getIstDateString } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let creators: Array<{ slug: string; updatedAt: Date }> = [];
  try {
    creators = await prisma.creator.findMany({
      where: { suspended: false },
      select: { slug: true, updatedAt: true },
      take: 500,
    });
  } catch {
    creators = [];
  }

  const staticRoutes = [
    "",
    "/rankings",
    "/trending",
    "/categories",
    "/how-it-works",
    "/leaderboard/today",
    `/leaderboard/${getIstDateString()}`,
    "/search",
    "/activity",
    "/battle",
  ].map((path) => ({
    url: `${APP_URL}${path}`,
    lastModified: new Date(),
  }));

  return [
    ...staticRoutes,
    ...CATEGORIES.map((category) => ({
      url: `${APP_URL}/category/${category.slug}`,
      lastModified: new Date(),
    })),
    ...creators.map((creator) => ({
      url: `${APP_URL}/creator/${creator.slug}`,
      lastModified: creator.updatedAt,
    })),
  ];
}
