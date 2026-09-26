import Link from "next/link";
import { getOwnedClaimTokens } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { getCategoryRank, getOverallRank } from "@/lib/creators";
import { formatCurrency } from "@/lib/utils";
import { BID_INCREMENT } from "@/lib/constants";
import type { CategoryId } from "@/lib/constants";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Creator dashboard",
  description: "Track your rank, bids, clicks, and outbid alerts.",
};

export default async function DashboardPage() {
  const tokens = await getOwnedClaimTokens();
  const creators = tokens.length
    ? await prisma.creator.findMany({
        where: { claimToken: { in: tokens } },
        include: {
          bids: { orderBy: { bidAmount: "desc" }, take: 1 },
          notifications: { orderBy: { createdAt: "desc" }, take: 8 },
          bidHistory: { orderBy: { createdAt: "asc" } },
        },
      })
    : [];

  if (creators.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-3xl font-semibold text-white">Your dashboard</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Place a bid to claim a creator dashboard. After payment, this device can manage that listing.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm text-amber-300">
          Claim your rank →
        </Link>
      </div>
    );
  }

  const cards = await Promise.all(
    creators.map(async (creator) => {
      const bid = creator.bids[0];
      const categoryRank = bid
        ? await getCategoryRank(creator.id, bid.category as CategoryId)
        : null;
      const overallRank = await getOverallRank(creator.id);
      const outbid = creator.notifications.find((item) => item.type === "OUTBID" && !item.read);
      return { creator, bid, categoryRank, overallRank, outbid };
    })
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-400">Analytics for listings claimed on this device.</p>

      <div className="mt-8 grid gap-6">
        {cards.map(({ creator, bid, categoryRank, overallRank, outbid }) => (
          <section key={creator.id} className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">{creator.channelName}</h2>
                <p className="text-sm text-zinc-500">@{creator.handle}</p>
              </div>
              <Link href={`/creator/${creator.slug}`} className="text-sm text-amber-300">
                Open profile
              </Link>
            </div>

            {outbid ? (
              <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                <p className="font-medium">{outbid.title}</p>
                <p className="mt-1 text-rose-100/80">{outbid.body}</p>
                <Link href={`/creator/${creator.slug}`} className="mt-2 inline-block text-white">
                  Reclaim #1
                </Link>
              </div>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Dash label="Current rank" value={categoryRank ? `#${categoryRank}` : "—"} />
              <Dash label="Previous rank" value={bid?.previousRank ? `#${bid.previousRank}` : "—"} />
              <Dash label="Current bid" value={formatCurrency(bid?.bidAmount ?? 0)} />
              <Dash label="Overall rank" value={overallRank ? `#${overallRank}` : "—"} />
              <Dash label="Profile views" value={String(creator.profileViews)} />
              <Dash label="YouTube clicks" value={String(creator.youtubeClicks)} />
              <Dash label="Shares" value={String(creator.shareCount)} />
              <Dash label="Days at #1" value={String(creator.daysAtOne)} />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <MiniChart
                title="Bid over time"
                points={creator.bidHistory.map((item) => item.amount)}
              />
              <MiniChart
                title="Rank over time"
                points={creator.bidHistory.map((item) => item.rankAfter)}
                invert
              />
              <div className="rounded-2xl border border-zinc-800 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Reclaim guide</p>
                <p className="mt-2 text-sm text-zinc-300">
                  If someone passed you, bid at least ₹{(bid?.bidAmount ?? 0) + BID_INCREMENT}.
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Dash({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function MiniChart({
  title,
  points,
  invert = false,
}: {
  title: string;
  points: number[];
  invert?: boolean;
}) {
  if (points.length < 2) {
    return (
      <div className="rounded-2xl border border-zinc-800 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{title}</p>
        <p className="mt-3 text-sm text-zinc-500">More bids will draw this chart.</p>
      </div>
    );
  }

  const max = Math.max(...points);
  const min = Math.min(...points);
  const width = 260;
  const height = 80;
  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const norm = max === min ? 0.5 : (point - min) / (max - min);
      const y = invert ? norm * height : height - norm * height;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-2xl border border-zinc-800 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{title}</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-20 w-full text-amber-300">
        <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
}
