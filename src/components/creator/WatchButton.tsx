"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "tc_watchlist";

function readSlugs() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function WatchButton({ slug }: { slug: string }) {
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    setWatching(readSlugs().includes(slug));
  }, [slug]);

  return (
    <Button
      variant="outline"
      onClick={() => {
        const next = readSlugs().filter((item) => item !== slug);
        if (!watching) next.unshift(slug);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 40)));
        setWatching(!watching);
      }}
    >
      {watching ? "Watching" : "♡ Watch"}
    </Button>
  );
}

export { STORAGE_KEY as WATCHLIST_STORAGE_KEY, readSlugs as readWatchlist };
