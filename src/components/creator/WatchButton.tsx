"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "tc_watchlist";
const WATCHLIST_CHANGE_EVENT = "tc_watchlist_change";

function readSlugs() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function subscribeToWatchlist(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(WATCHLIST_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(WATCHLIST_CHANGE_EVENT, callback);
  };
}

function saveSlugs(slugs: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs.slice(0, 40)));
  window.dispatchEvent(new Event(WATCHLIST_CHANGE_EVENT));
}

export function WatchButton({ slug }: { slug: string }) {
  const watching = useSyncExternalStore(
    subscribeToWatchlist,
    () => readSlugs().includes(slug),
    () => false
  );

  return (
    <Button
      variant="outline"
      onClick={() => {
        const next = readSlugs().filter((item) => item !== slug);
        if (!watching) next.unshift(slug);
        saveSlugs(next);
      }}
    >
      {watching ? "Watching" : "♡ Watch"}
    </Button>
  );
}

export {
  STORAGE_KEY as WATCHLIST_STORAGE_KEY,
  readSlugs as readWatchlist,
  subscribeToWatchlist,
};
