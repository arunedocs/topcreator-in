import type { Metadata } from "next";
import Link from "next/link";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import { SUBSCRIBER_BANDS, type SubscriberBandId } from "@/lib/constants";
import { getRisingCreators } from "@/lib/leaderboard";
import { formatSubscribers } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rising creators",
  description: "Emerging TopCreator listings, ordered by rank movement. Subscriber bands use the count saved with the bid.",
};

export default async function RisingPage({
  searchParams,
}: {
  searchParams: Promise<{ band?: string }>;
}) {
  const { band: bandId = "all" } = await searchParams;
  const band = SUBSCRIBER_BANDS.find((item) => item.id === bandId) ?? SUBSCRIBER_BANDS[0];
  const entries = await getRisingCreators(40, band.id === "all" ? undefined : { min: band.min, max: band.max });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Rising creators</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
        Ordered by positive rank movement, then newest listings. Subscriber bands use the count saved
        when the creator bid. They are not a live YouTube subscriber total.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {SUBSCRIBER_BANDS.map((item) => (
          <Link
            key={item.id}
            href={item.id === "all" ? "/rising" : `/rising?band=${item.id as SubscriberBandId}`}
            className={`rounded-full px-3 py-1 text-xs ${
              band.id === item.id ? "bg-white text-zinc-950" : "border border-zinc-800 text-zinc-400"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-3">
        {entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-800 px-6 py-12 text-center text-sm text-zinc-500">
            No creators in this band yet.
          </p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="grid gap-2">
              <LeaderboardRow entry={entry} showCategory />
              <p className="-mt-1 px-2 text-xs text-zinc-500">
                Subscribers saved with the bid: {formatSubscribers(entry.subscriberCount)} · views{" "}
                {entry.profileViews ?? 0}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
