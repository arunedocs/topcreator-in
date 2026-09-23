"use client";

import { Camera, Check, Copy, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { LeaderboardEntry } from "@/lib/types";
import { buildShareText, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface ShareFlexModalProps {
  open: boolean;
  onClose: () => void;
  entry: LeaderboardEntry | null;
}

export function ShareFlexModal({ open, onClose, entry }: ShareFlexModalProps) {
  const [copied, setCopied] = useState(false);

  const shareText = useMemo(() => {
    if (!entry) return "";
    return buildShareText(entry);
  }, [entry]);

  if (!entry) return null;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const encodedText = encodeURIComponent(shareText);

  const copyText = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Flex your #1 rank"
      description="Share proof that you paid to reign supreme."
    >
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-amber-300/80">
          TopCreator.in · {entry.category}
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-white">{entry.channelName}</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Paid {formatCurrency(entry.bidAmount)} to hold #{entry.rank}
        </p>
        <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm leading-6 text-zinc-300 whitespace-pre-line">
          {shareText}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" className="w-full">
            <Share2 className="h-4 w-4" />
            Post on X
          </Button>
        </a>
        <Button variant="secondary" className="w-full" onClick={copyText}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy caption"}
        </Button>
        <a
          href={`https://www.instagram.com/?url=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="secondary" className="w-full">
            <Camera className="h-4 w-4" />
            Share on IG
          </Button>
        </a>
      </div>
    </Modal>
  );
}
