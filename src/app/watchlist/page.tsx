import type { Metadata } from "next";
import { WatchlistView } from "@/components/watchlist/WatchlistView";

export const metadata: Metadata = {
  title: "Watchlist",
  description: "Creators you saved on this device, with their live rank and bid.",
};

export default function WatchlistPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">My watchlist</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Saved on this device only. It does not sync across phones or browsers. Rank, bid, and movement
        below are loaded live. Watching a creator does not send alerts.
      </p>
      <WatchlistView />
    </div>
  );
}
