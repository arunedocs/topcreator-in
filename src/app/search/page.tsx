import { SearchBox } from "@/components/search/SearchBox";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import { searchCreators } from "@/lib/leaderboard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search creators",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q.trim().length >= 2 ? await searchCreators(q) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Search</h1>
      <div className="mt-5">
        <SearchBox compact />
      </div>
      <div className="mt-8 grid gap-3">
        {q.trim().length < 2 ? (
          <p className="text-sm text-zinc-500">Type a creator name, handle, or start exploring categories.</p>
        ) : results.length === 0 ? (
          <p className="text-sm text-zinc-500">No creators match “{q}”.</p>
        ) : (
          results.map((entry) => <LeaderboardRow key={entry.id} entry={entry} showCategory />)
        )}
      </div>
    </div>
  );
}
