import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { CATEGORIES } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950 pb-20 md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <p className="text-sm font-semibold text-white">{APP_NAME}</p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            India&apos;s creator leaderboard. Compete for visibility in the categories that matter.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Explore</p>
          <div className="mt-3 grid gap-2 text-sm">
            <Link href="/rankings" className="text-zinc-400 hover:text-white">Rankings</Link>
            <Link href="/trending" className="text-zinc-400 hover:text-white">Trending</Link>
            <Link href="/leaderboard/today" className="text-zinc-400 hover:text-white">Today</Link>
            <Link href="/how-it-works" className="text-zinc-400 hover:text-white">How it works</Link>
          </div>
        </div>
        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Categories</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.slice(0, 12).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:border-zinc-600 hover:text-white"
              >
                {category.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-zinc-600 sm:flex-row sm:justify-between sm:px-6">
          <p>Daily ranks refresh at midnight IST (Asia/Kolkata). Historical snapshots are kept.</p>
          <p>© {new Date().getFullYear()} {APP_NAME}</p>
        </div>
      </div>
    </footer>
  );
}
