import type { Metadata } from "next";
import Link from "next/link";
import { PRICING } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "TopCreator pricing. Paid bids set rank. Other plans are listed only when checkout is available.",
};

const PLANS = [PRICING.free, PRICING.bids, PRICING.pro, PRICING.featured, PRICING.sponsorship];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Pricing</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
        Rank on the leaderboard is paid. Trending, views, and clicks are engagement counts and are not
        sold as organic rank. Plans marked unavailable cannot be purchased.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PLANS.map((plan) => (
          <section key={plan.name} className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
              <span className="rounded-full border border-zinc-700 px-2 py-1 text-[11px] text-zinc-400">
                {plan.available ? "Available" : "Not for sale"}
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">{plan.priceLabel}</p>
            <ul className="mt-4 grid gap-2 text-sm text-zinc-400">
              {plan.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            {plan.available && plan.name !== "Free" ? (
              <Link href="/" className="mt-5 inline-block text-sm text-amber-300">
                Place a bid →
              </Link>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
