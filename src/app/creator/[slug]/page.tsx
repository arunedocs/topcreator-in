import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreatorProfileView } from "@/components/creator/CreatorProfileView";
import { getBidHistory, recordProfileView, toCreatorProfile } from "@/lib/creators";
import { getOwnedClaimTokens } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { getCategoryLabel } from "@/lib/utils";
import { headers } from "next/headers";
import { track } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await toCreatorProfile(slug);
  if (!profile) return { title: "Creator" };

  const rank = profile.currentRank ? `#${profile.currentRank}` : "Ranked";
  const title = `${profile.channelName} — ${rank} ${getCategoryLabel(profile.category)} Creator`;
  return {
    title,
    description: `${profile.channelName} (@${profile.handle}) is ${rank} in ${getCategoryLabel(profile.category)} on ${APP_NAME}.`,
    alternates: { canonical: `/creator/${slug}` },
    openGraph: {
      title,
      description: `Current bid ${profile.currentBid}. Visit ${APP_NAME} to compete.`,
    },
  };
}

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await toCreatorProfile(slug);
  if (!profile) notFound();

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  await recordProfileView(profile.id, ip);
  track({ name: "creator_view", properties: { slug } });

  const [history, tokens] = await Promise.all([
    getBidHistory(profile.id),
    getOwnedClaimTokens(),
  ]);
  const creator = await prisma.creator.findUnique({
    where: { id: profile.id },
    select: { claimToken: true },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.channelName,
    url: `/creator/${profile.slug}`,
    sameAs: profile.channelUrl,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CreatorProfileView
        profile={profile}
        history={history}
        owned={Boolean(creator && tokens.includes(creator.claimToken))}
      />
    </>
  );
}
