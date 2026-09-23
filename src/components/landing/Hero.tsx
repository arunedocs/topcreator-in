import { ArrowUpRight, IndianRupee, Trophy } from "lucide-react";
import { APP_TAGLINE, BID_INCREMENT } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

interface HeroProps {
  topBidAmount: number;
  categoryLabel: string;
  onBidClick: () => void;
}

export function Hero({ topBidAmount, categoryLabel, onBidClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-zinc-800/80">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.12),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(244,63,94,0.08),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-300">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            India&apos;s pay-to-rank creator board
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.05]">
            Flex your channel.
            <span className="block bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">
              Own the #1 spot.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            {APP_TAGLINE} No algorithm. No judges. Just UPI-powered bids that put
            Indian YouTubers on a live leaderboard — category by category.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button onClick={onBidClick} className="h-12 px-6 text-base">
              <IndianRupee className="h-4 w-4" />
              Outbid {categoryLabel} #1
            </Button>
            <Button variant="secondary" onClick={onBidClick} className="h-12 px-6">
              See live ranks
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <Stat label="Current #1 bid" value={`₹${topBidAmount.toLocaleString("en-IN")}`} />
            <Stat label="Minimum increment" value={`₹${BID_INCREMENT}`} />
            <Stat label="Payment" value="UPI / Razorpay" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-100">{value}</p>
    </div>
  );
}
