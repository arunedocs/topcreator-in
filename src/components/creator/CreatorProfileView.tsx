"use client";

import { BadgeCheck, Share2 } from "lucide-react";
import { useState } from "react";
import { requestVerification } from "@/actions/verification";
import { submitReport } from "@/actions/social";
import { REPORT_REASONS } from "@/lib/constants";
import type { BidHistoryPoint, CreatorProfile } from "@/lib/types";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";
import { useBid } from "@/components/bid/BidProvider";
import { ResetCountdown } from "@/components/leaderboard/ResetCountdown";
import { RankHistory } from "@/components/creator/RankHistory";
import { WatchButton } from "@/components/creator/WatchButton";
import { ShareFlexModal } from "@/components/share/ShareFlexModal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { LeaderboardEntry } from "@/lib/types";

export function CreatorProfileView({
  profile,
  history,
  owned,
}: {
  profile: CreatorProfile;
  history: BidHistoryPoint[];
  owned: boolean;
}) {
  const { openBid } = useBid();
  const toast = useToast();
  const [shareOpen, setShareOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("share") === "1";
  });
  const [reportOpen, setReportOpen] = useState(false);
  const [code, setCode] = useState(profile.verificationCode);

  const shareEntry: LeaderboardEntry = {
    id: profile.id,
    rank: profile.currentRank ?? 0,
    channelName: profile.channelName,
    channelUrl: profile.channelUrl,
    avatarUrl: profile.avatarUrl,
    subscriberCount: profile.subscriberCount,
    category: profile.category,
    bidAmount: profile.currentBid,
    createdAt: profile.joinedAt,
    slug: profile.slug,
    handle: profile.handle,
    verified: profile.verified,
    previousRank: profile.previousRank,
    movement: profile.movement,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 max-w-sm">
        <ResetCountdown />
      </div>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40">
        <div className="h-28 bg-[radial-gradient(circle_at_20%_0%,rgba(245,158,11,0.25),transparent_50%)]" />
        <div className="px-6 pb-6 sm:px-8">
          <img
            src={profile.avatarUrl}
            alt=""
            className="-mt-10 h-20 w-20 rounded-full border-4 border-zinc-950 bg-zinc-800"
          />
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold text-white">{profile.channelName}</h1>
                {profile.verified ? <BadgeCheck className="h-5 w-5 text-sky-400" /> : null}
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                @{profile.handle} · {getCategoryLabel(profile.category)}
                {profile.verified ? " · Verified creator" : ""}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <a href={`/go/youtube/${profile.slug}`}>
                <Button className="w-full sm:w-auto">Visit YouTube</Button>
              </a>
              <Button variant="secondary" onClick={() => setShareOpen(true)}>
                <Share2 className="h-4 w-4" />
                Share my rank
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  openBid({
                    category: profile.category,
                    channelName: profile.channelName,
                    channelUrl: profile.channelUrl,
                  })
                }
              >
                {owned ? "Increase bid" : profile.currentRank === 1 ? "Outbid & claim #1" : "Outbid"}
              </Button>
              <WatchButton slug={profile.slug} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Current rank" value={profile.currentRank ? `#${profile.currentRank}` : "—"} />
        <Metric label="Overall rank" value={profile.overallRank ? `#${profile.overallRank}` : "—"} />
        <Metric label="Current bid" value={formatCurrency(profile.currentBid)} />
        <Metric label="Highest bid" value={formatCurrency(profile.highestBid)} />
        <Metric label="Days at #1" value={String(profile.daysAtOne)} />
        <Metric label="Profile views" value={String(profile.profileViews)} />
        <Metric label="YouTube clicks" value={String(profile.youtubeClicks)} />
        <Metric label="Shares" value={String(profile.shareCount)} />
        <Metric label="Streak" value={profile.currentStreak ? `🔥 ${profile.currentStreak} days` : "—"} />
        <Metric
          label="Movement"
          value={
            profile.movement > 0
              ? `↑ ${profile.movement}`
              : profile.movement < 0
                ? `↓ ${Math.abs(profile.movement)}`
                : "—"
          }
        />
        <Metric label="Previous rank" value={profile.previousRank ? `#${profile.previousRank}` : "—"} />
        <Metric
          label="Joined"
          value={new Date(profile.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        />
      </div>

      {profile.badges.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-2">
          {profile.badges.map((badge) => (
            <span key={badge.type} className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-300">
              {badge.label}
            </span>
          ))}
        </div>
      ) : null}

      {!owned ? (
        <section className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h2 className="font-medium text-white">Is this your YouTube channel?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Claim this profile from this device to manage your information, track analytics, receive
            outbid alerts, and compete for the category. Claiming happens when your bid payment is
            verified — the browser cannot mark a profile as yours.
          </p>
          <Button
            className="mt-4"
            onClick={() =>
              openBid({
                category: profile.category,
                channelName: profile.channelName,
                channelUrl: profile.channelUrl,
              })
            }
          >
            Claim this profile
          </Button>
        </section>
      ) : null}

      <RankHistory history={history} />

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Bid history</h2>
        <div className="mt-4 grid gap-3">
          {history.length === 0 ? (
            <p className="text-sm text-zinc-500">No recorded bid history yet.</p>
          ) : (
            history.map((point, index) => (
              <div key={point.id} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-white">{formatCurrency(point.amount)}</div>
                <div className="text-xs text-zinc-500">
                  #{point.rankAfter}
                  {point.previousRank ? ` · from #${point.previousRank}` : ""}
                  {" · "}
                  {new Date(point.createdAt).toLocaleDateString("en-IN")}
                </div>
                {index < history.length - 1 ? <span className="text-zinc-700">↓</span> : null}
              </div>
            ))
          )}
        </div>
      </section>

      {owned && !profile.verified ? (
        <section className="mt-10 rounded-2xl border border-zinc-800 p-5">
          <h2 className="font-medium text-white">Verify ownership</h2>
          <ol className="mt-3 grid gap-2 text-sm text-zinc-400">
            <li>1. YouTube channel — {profile.channelUrl}</li>
            <li>2. Ownership — add the code below to the channel description.</li>
            <li>3. Category — {getCategoryLabel(profile.category)}</li>
            <li>4. Creator information — {profile.channelName} · @{profile.handle}</li>
            <li>5. Verified profile — only after the server confirms the code.</li>
          </ol>
          <p className="mt-3 font-mono text-amber-300">{code ?? "Submit to generate a code"}</p>
          <p className="mt-2 text-xs text-zinc-500">
            This device cannot mark you verified. Until the YouTube API is connected, a submitted code waits for review.
          </p>
          <Button
            className="mt-4"
            variant="secondary"
            onClick={async () => {
              const result = await requestVerification(profile.slug);
              if ("error" in result && result.error) {
                toast(result.error === "Creator not found." ? "Creator not found." : "Verification failed. Try again.");
                return;
              }
              setCode(result.code ?? profile.verificationCode);
              toast(result.verified ? "Creator verified." : "Verification submitted. It is not verified yet.");
            }}
          >
            Submit verification
          </Button>
        </section>
      ) : null}

      <button
        type="button"
        className="mt-10 text-xs text-zinc-600 hover:text-zinc-300"
        onClick={() => setReportOpen((value) => !value)}
      >
        Report creator
      </button>

      {reportOpen ? (
        <form
          className="mt-3 max-w-md space-y-3"
          action={async (formData) => {
            formData.set("slug", profile.slug);
            const result = await submitReport(formData);
            toast(result.error ?? "Report submitted.");
            setReportOpen(false);
          }}
        >
          <select name="reason" className="field-input" required>
            {REPORT_REASONS.map((reason) => (
              <option key={reason.id} value={reason.id}>
                {reason.label}
              </option>
            ))}
          </select>
          <textarea name="details" className="field-input min-h-24" placeholder="Optional details" />
          <Button type="submit" variant="secondary">
            Send report
          </Button>
        </form>
      ) : null}

      <ShareFlexModal open={shareOpen} onClose={() => setShareOpen(false)} entry={shareEntry} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}
