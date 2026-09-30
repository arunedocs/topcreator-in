import type { Metadata } from "next";
import Link from "next/link";
import { getOwnedClaimTokens } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Outbid and rank alerts for listings claimed on this device.",
};

export default async function NotificationsPage() {
  const tokens = await getOwnedClaimTokens();
  const notifications = tokens.length
    ? await prisma.notification.findMany({
        where: { creator: { claimToken: { in: tokens } } },
        orderBy: { createdAt: "desc" },
        take: 40,
        include: { creator: { select: { slug: true, channelName: true } } },
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Notifications</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Outbid, rank change, Top 10, Top 3, and #1 alerts are stored only when that event happens on a listing claimed on this device. Watchlist and trending alerts are not sent.
      </p>
      {tokens.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-800 px-6 py-12 text-center">
          <p className="text-zinc-400">No notifications yet. Claim a rank to receive outbid alerts here.</p>
          <Link href="/" className="mt-3 inline-block text-sm text-amber-300">
            Claim Your Rank
          </Link>
        </div>
      ) : notifications.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500">No alerts recorded for your listings.</p>
      ) : (
        <div className="mt-8 grid gap-3">
          {notifications.map((item) => (
            <article key={item.id} className="rounded-2xl border border-zinc-800 px-4 py-4">
              <p className="font-medium text-white">{item.title}</p>
              <p className="mt-1 text-sm text-zinc-400">{item.body}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                <span>{formatRelativeTime(item.createdAt.toISOString())}</span>
                <Link href={`/creator/${item.creator.slug}`} className="text-amber-300">
                  {item.type === "OUTBID" ? "Defend your rank" : item.creator.channelName}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
