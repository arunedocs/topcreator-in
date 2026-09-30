import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How it works",
  description: "How TopCreator ranking, bidding, trending, daily reset, verification, and payments work.",
};

const STEPS = [
  { title: "Find your category", body: "Technology, gaming, finance, shorts — pick the lane your audience already watches." },
  { title: "Add your creator profile", body: "Paste your YouTube URL. We normalize the link and prevent duplicate channels." },
  { title: "Place your bid", body: "Pay the live minimum via Razorpay / UPI. The server calculates rank — never the browser." },
  { title: "Climb the leaderboard", body: "Outbids reshuffle the board instantly. Daily snapshots keep history at midnight IST." },
  { title: "Share your rank", body: "Send a card to WhatsApp or X and pull more clicks to your channel." },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">How it works</h1>
      <div className="mt-8 grid gap-4">
        {STEPS.map((step, index) => (
          <div key={step.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
            <p className="text-xs text-zinc-500">0{index + 1}</p>
            <h2 className="mt-2 text-lg font-medium text-white">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{step.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-4">
        <Explain
          title="How ranking works"
          body="Category rank is the highest verified bid, then the earliest bid if amounts tie. That order is paid placement. It is not an organic popularity rank."
        />
        <Explain
          title="How bidding works"
          body="The server sets the minimum. Checkout creates a Razorpay order for that exact amount. Rank changes only after payment verification on the server."
        />
        <Explain
          title="How trending works"
          body="Trending uses recent bids, rank movement, profile views, YouTube clicks, and shares. It is a separate list from the paid leaderboard."
        />
        <Explain
          title="How the daily reset works"
          body="A snapshot is stored at midnight India time (Asia/Kolkata). Bid history is kept. The countdown on the homepage uses that timezone."
        />
        <Explain
          title="How verification works"
          body="After you claim a listing, you can add a code to your YouTube description and submit it. A verified badge appears only after that check succeeds."
        />
        <Explain
          title="How payments work"
          body="UPI, cards, and wallets go through Razorpay. Failed or abandoned checkouts do not change the board."
        />
      </div>
    </div>
  );
}

function Explain({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-2xl border border-zinc-800 p-5">
      <h2 className="text-lg font-medium text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
    </section>
  );
}
