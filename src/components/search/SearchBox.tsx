"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { LeaderboardEntry } from "@/lib/types";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";

export function SearchBox({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LeaderboardEntry[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const visibleResults = query.trim().length < 2 ? [] : results;

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }

    const handle = window.setTimeout(async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      if (!response.ok) return;
      const data = (await response.json()) as { results: LeaderboardEntry[] };
      setResults(data.results);
      setOpen(true);
    }, 180);

    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef} className={`relative ${compact ? "w-full" : "w-full max-w-md"}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => visibleResults.length > 0 && setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            setOpen(false);
          }
        }}
        placeholder="Search creators or @handles"
        aria-label="Search creators or YouTube handles"
        className="field-input search-input"
      />
      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
          {visibleResults.length === 0 ? (
            <p className="px-4 py-6 text-sm text-zinc-500">No creators match that search.</p>
          ) : (
            visibleResults.map((result) => (
              <button
                key={result.id}
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-zinc-900"
                onClick={() => {
                  router.push(`/creator/${result.slug}`);
                  setOpen(false);
                }}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-white">{result.channelName}</span>
                  <span className="text-xs text-zinc-500">
                    @{result.handle} · {getCategoryLabel(result.category)}
                  </span>
                </span>
                <span className="text-xs text-zinc-400">{formatCurrency(result.bidAmount)}</span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
