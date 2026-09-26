"use client";

import { Crown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { SearchBox } from "@/components/search/SearchBox";
import { useBid } from "@/components/bid/BidProvider";

const NAV = [
  { href: "/rankings", label: "Rankings" },
  { href: "/categories", label: "Categories" },
  { href: "/trending", label: "Trending" },
  { href: "/how-it-works", label: "How It Works" },
];

export function SiteHeader() {
  const { openBid } = useBid();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600">
            <Crown className="h-4 w-4 text-zinc-950" />
          </div>
          <div className="hidden min-[400px]:block">
            <p className="text-sm font-semibold tracking-tight text-white">{APP_NAME}</p>
            <p className="text-[11px] text-zinc-500">Pay. Rank. Get discovered.</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden flex-1 md:block">
          <SearchBox />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 text-zinc-300 md:hidden"
            aria-label="Search"
          >
            <span className="sr-only">Search</span>
            ⌕
          </Link>
          <Link href="/dashboard" className="hidden text-sm text-zinc-400 hover:text-white sm:inline">
            Dashboard
          </Link>
          <Button onClick={() => openBid()} className="hidden h-10 px-4 sm:inline-flex">
            Submit Creator
          </Button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 lg:hidden"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-zinc-800 px-4 py-4 lg:hidden">
          <div className="mb-4 md:hidden">
            <SearchBox compact />
          </div>
          <div className="grid gap-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/dashboard" className="rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900">
              Dashboard
            </Link>
            <Button onClick={() => { setMenuOpen(false); openBid(); }} className="mt-2">
              Submit Creator
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
