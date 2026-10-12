import type { Metadata } from "next";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import {
  getBiggestMovers,
  getCreatorsByMetric,
  getNewCreators,
  getTrendingCreators,
} from "@/lib/leaderboard";
import type { LeaderboardEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trending creators",
  description: "Creators getting attention on TopCreator right now.",
};

export default async function TrendingPage() {
  const [trending, rising, viewed, clicks, shares, newcomers] = await Promise.all([
    getTrendingCreators(12),
    getBiggestMovers(8),
    getCreatorsByMetric("profileViews", 8),
    getCreatorsByMetric("youtubeClicks", 8),
    getCreatorsByMetric("shareCount", 8),
    getNewCreators(8),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-sm font-medium text-amber-300">Discover creators</p>
      <h1 className="mt-1 text-3xl font-semibold text-white">Creators getting attention right now</h1>
      <p className="mt-2 max-w-2xl rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm leading-6 text-emerald-100">
        Trending shows creators receiving attention on TopCreator. It is separate from the paid
        leaderboard.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Explain title="What counts" body="Recent bids, rank movement, profile visits, YouTube clicks, and shares." />
        <Explain title="What it is for" body="Find creators that people are checking out and talking about." />
        <Explain title="What it is not" body="It is not a measure of channel quality or a paid rank." />
      </div>

      <Board
        title="Trending now"
        description="Creators with the strongest mix of activity and attention on TopCreator."
        entries={trending}
        empty="No creator activity yet. Check back soon."
      />

      <div className="grid gap-x-8 lg:grid-cols-2">
        <Board
          title="Moving up"
          description="Creators whose category rank has improved."
          entries={rising}
          empty="No rank increases recorded yet."
        />
        <Board
          title="Most visited"
          description="Creators whose TopCreator profiles have received the most visits."
          entries={viewed}
          empty="No profile visits recorded yet."
        />
        <Board
          title="Most clicked"
          description="Creators receiving the most clicks through to YouTube."
          entries={clicks}
          empty="No YouTube clicks recorded yet."
        />
        <Board
          title="Most shared"
          description="Creators whose profiles have been shared the most."
          entries={shares}
          empty="No shares recorded yet."
        />
      </div>

      <Board
        title="New on TopCreator"
        description="Creators who recently joined the platform."
        entries={newcomers}
        empty="No new creators yet."
      />
    </div>
  );
}

function Board({
  title,
  description,
  entries,
  empty,
}: {
  title: string;
  description: string;
  entries: LeaderboardEntry[];
  empty: string;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-zinc-400">{description}</p>
      <div className="mt-4 grid gap-3">
        {entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-800 px-4 py-8 text-sm text-zinc-500">
            {empty}
          </p>
        ) : (
          entries.map((entry) => <LeaderboardRow key={`${title}-${entry.id}`} entry={entry} showCategory />)
        )}
      </div>
    </section>
  );
}

function Explain({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
      <h2 className="font-medium text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
    </div>
  );
}
