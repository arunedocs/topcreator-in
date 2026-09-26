"use client";

import { ArrowUpRight, Flame, IndianRupee, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { HomePageData } from "@/lib/home";
import { CATEGORIES, LEADERBOARD_POLL_MS } from "@/lib/constants";
import type { ActivityItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/time";
import { useBid } from "@/components/bid/BidProvider";
import { ActivityTicker } from "@/components/activity/ActivityTicker";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import { ResetCountdown } from "@/components/leaderboard/ResetCountdown";
import { TrustBand } from "@/components/home/TrustBand";
import { ShareFlexModal } from "@/components/share/ShareFlexModal";
import { Button } from "@/components/ui/Button";
import type { LeaderboardEntry } from "@/lib/types";

export function HomeExperience({ data }: { data: HomePageData }) {
  const { openBid } = useBid();
  const [activity, setActivity] = useState<ActivityItem[]>(data.activity);
  const [shareEntry, setShareEntry] = useState<LeaderboardEntry | null>(null);
  const top = data.allTime[0];

  useEffect(() => {
    const id = window.setInterval(async () => {
      const response = await fetch("/api/activity");
      if (!response.ok) return;
      const json = (await response.json()) as { activity: ActivityItem[] };
      setActivity(json.activity);
    }, LEADERBOARD_POLL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(245,158,11,0.14),transparent_36%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.04),transparent_28%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
              India&apos;s Creator Leaderboard
            </span>
            <ResetCountdown compact />
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.05]">
            Pay. Rank. Get Discovered.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            Compete for the top spot in India&apos;s creator categories. Bid via UPI, climb the board,
            and send more people to your YouTube.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => openBid({ category: top?.category ?? "TECH" })} className="h-12 px-6 text-base">
              <IndianRupee className="h-4 w-4" />
              Claim your rank
            </Button>
            <Link href="/rankings">
              <Button variant="secondary" className="h-12 px-6">
                Explore creators
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-4">
            <Stat label="Creators" value={String(data.stats.creators)} />
            <Stat label="Live bids" value={String(data.stats.liveBids)} />
            <Stat label="Bid volume" value={formatCurrency(data.stats.volume)} />
            <Stat label="YouTube clicks" value={String(data.stats.youtubeClicks)} />
          </div>
        </div>
      </section>

      <TrustBand />

      <ActivityTicker activity={activity} />

      <Section title="Live ranking preview" href="/rankings" icon={<Trophy className="h-4 w-4 text-amber-400" />}>
        {data.allTime.length === 0 ? (
          <Empty text="No bids yet. Be the first to claim a rank." onClick={() => openBid()} />
        ) : (
          <div className="grid gap-3">
            {data.allTime.slice(0, 5).map((entry) => (
              <LeaderboardRow key={entry.id} entry={entry} showCategory onShare={setShareEntry} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Today's top creators" href="/leaderboard/today">
        <div className="grid gap-3">
          {data.today.slice(0, 5).map((entry) => (
            <LeaderboardRow key={entry.id} entry={entry} showCategory />
          ))}
        </div>
      </Section>

      <Section title="Trending now" href="/trending" icon={<Flame className="h-4 w-4 text-orange-400" />}>
        <div className="grid gap-3 md:grid-cols-2">
          {data.trending.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">
                #{entry.rank} · {entry.category}
              </p>
              <p className="mt-1 font-medium text-white">{entry.channelName}</p>
              <p className="text-sm text-emerald-400">
                {entry.movement > 0 ? `+${entry.movement} positions` : "Holding rank"}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-white">Category explorer</h2>
          <Link href="/categories" className="text-sm text-zinc-400 hover:text-white">
            All categories
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 transition hover:border-zinc-600"
            >
              <p className="text-lg">
                {category.emoji} {category.label}
              </p>
              <p className="mt-1 text-xs text-zinc-500">Open live rankings</p>
            </Link>
          ))}
        </div>
      </section>

      <Section title="Biggest movers" href="/rankings?period=movers">
        <div className="grid gap-3">
          {data.movers.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-zinc-800 px-4 py-3">
              <div>
                <p className="font-medium text-white">{entry.channelName}</p>
                <p className="text-xs text-zinc-500">
                  #{entry.previousRank ?? "—"} → #{entry.rank}
                </p>
              </div>
              <p className="text-sm text-emerald-400">+{entry.movement} positions</p>
            </div>
          ))}
        </div>
      </Section>

      {data.winner?.creator ? (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-300">Creator of the Day</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{data.winner.creator.channelName}</h2>
            <p className="mt-2 text-sm text-zinc-400">
              #{data.winner.rank} · {formatCurrency(data.winner.bidAmount)} · {data.winner.date}
            </p>
            <div className="mt-5 flex gap-3">
              <Link href={`/creator/${data.winner.creator.slug}`}>
                <Button>View profile</Button>
              </Link>
              <Button variant="secondary" onClick={() => openBid()}>
                Outbid
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-semibold text-white">Live activity</h2>
        <div className="mt-5 grid gap-2">
          {activity.slice(0, 8).map((item) => (
            <p key={item.id} className="rounded-xl border border-zinc-800/80 px-4 py-3 text-sm text-zinc-300">
              {item.message}
              <span className="ml-2 text-xs text-zinc-600">{formatRelativeTime(item.timestamp)}</span>
            </p>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-semibold text-white">How it works</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {[
            "Find your category",
            "Add your creator profile",
            "Place your bid",
            "Climb the leaderboard",
            "Share your rank",
          ].map((step, index) => (
            <div key={step} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs text-zinc-500">0{index + 1}</p>
              <p className="mt-2 text-sm font-medium text-white">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-amber-300" />
          <h2 className="mt-4 text-3xl font-semibold text-white">Ready to be discovered?</h2>
          <p className="mt-2 text-zinc-400">Claim your rank before midnight IST resets the daily board.</p>
          <Button onClick={() => openBid()} className="mt-6">
            Claim your rank
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <h3 className="mb-3 text-sm text-zinc-500">New on TopCreator</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {data.newcomers.map((entry) => (
            <Link
              key={entry.id}
              href={`/creator/${entry.slug}`}
              className="min-w-[180px] rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
            >
              <p className="truncate font-medium text-white">{entry.channelName}</p>
              <p className="text-xs text-zinc-500">@{entry.handle}</p>
            </Link>
          ))}
        </div>
      </section>

      <ShareFlexModal open={Boolean(shareEntry)} onClose={() => setShareEntry(null)} entry={shareEntry} />
    </>
  );
}

function Section({
  title,
  href,
  icon,
  children,
}: {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
          {icon}
          {title}
        </h2>
        {href ? (
          <Link href={href} className="text-sm text-zinc-400 hover:text-white">
            View all
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-900/40 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function Empty({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 px-6 py-12 text-center">
      <p className="text-zinc-400">{text}</p>
      <Button onClick={onClick} className="mt-4">
        Claim #1 now
      </Button>
    </div>
  );
}
