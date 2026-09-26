import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How it works",
  description: "Find a category, add your creator, bid, climb, and share your TopCreator rank.",
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
    </div>
  );
}
