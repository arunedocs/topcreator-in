"use client";

import { Camera, Check, Copy, Download, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { recordShare } from "@/actions/social";
import type { LeaderboardEntry } from "@/lib/types";
import {
  buildInstagramCaption,
  buildShareText,
  buildTwitterShareText,
  buildWhatsAppShareText,
  formatCurrency,
  getCategoryLabel,
} from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface ShareFlexModalProps {
  open: boolean;
  onClose: () => void;
  entry: LeaderboardEntry | null;
}

export function ShareFlexModal({ open, onClose, entry }: ShareFlexModalProps) {
  const [copied, setCopied] = useState<"x" | "ig" | "all" | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const toast = useToast();
  const shareText = useMemo(() => (entry ? buildShareText(entry) : ""), [entry]);
  const twitterText = useMemo(() => (entry ? buildTwitterShareText(entry) : ""), [entry]);
  const instagramCaption = useMemo(
    () => (entry ? buildInstagramCaption(entry) : ""),
    [entry]
  );
  const whatsappText = useMemo(() => (entry ? buildWhatsAppShareText(entry) : ""), [entry]);

  if (!entry) return null;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;

  const copyText = async (text: string, kind: "x" | "ig" | "all") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      toast("Copied to clipboard.");
      if (entry?.slug) void recordShare(entry.slug, kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setDownloadError("Could not copy — try selecting the text manually.");
    }
  };

  const downloadCard = async () => {
    setDownloadError(null);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Canvas unavailable");
      }

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#18181b");
      gradient.addColorStop(0.5, "#09090b");
      gradient.addColorStop(1, "#27272a");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(245, 158, 11, 0.12)";
      ctx.beginPath();
      ctx.arc(980, 120, 180, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fbbf24";
      ctx.font = "600 28px system-ui, sans-serif";
      ctx.fillText(`${APP_NAME} · #1 ${getCategoryLabel(entry.category)}`, 72, 96);

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 64px system-ui, sans-serif";
      ctx.fillText(entry.channelName, 72, 190);

      ctx.fillStyle = "#a1a1aa";
      ctx.font = "400 32px system-ui, sans-serif";
      ctx.fillText(`Paid ${formatCurrency(entry.bidAmount)} to reign supreme`, 72, 250);

      ctx.fillStyle = "#71717a";
      ctx.font = "500 24px system-ui, sans-serif";
      ctx.fillText("Think you can outbid me?", 72, 540);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) {
        throw new Error("Export failed");
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `topcreator-${entry.channelName.replace(/\s+/g, "-").toLowerCase()}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Download failed. Use copy caption instead.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Flex your #1 rank"
      description="One-click share cards built for X, Instagram, and your story."
      className="max-w-xl"
    >
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-amber-300/80">
          {APP_NAME} · {getCategoryLabel(entry.category)}
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-white">{entry.channelName}</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Paid {formatCurrency(entry.bidAmount)} to hold #{entry.rank}
        </p>
        <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm leading-6 text-zinc-300 whitespace-pre-line">
          {shareText}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => entry.slug && void recordShare(entry.slug, "whatsapp")}
        >
          <Button variant="secondary" className="w-full">
            WhatsApp
          </Button>
        </a>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => entry.slug && void recordShare(entry.slug, "x")}
        >
          <Button variant="secondary" className="w-full">
            <Share2 className="h-4 w-4" />
            Post on X
          </Button>
        </a>
        <Button variant="secondary" className="w-full" onClick={() => copyText(twitterText, "x")}>
          {copied === "x" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied === "x" ? "X caption copied" : "Copy X caption"}
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => copyText(instagramCaption, "ig")}
        >
          {copied === "ig" ? <Check className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
          {copied === "ig" ? "IG caption copied" : "Copy IG caption"}
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => copyText(shareText, "all")}>
          {copied === "all" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied === "all" ? "Copied" : "Copy full flex"}
        </Button>
      </div>

      {typeof navigator !== "undefined" && "share" in navigator ? (
        <Button
          variant="outline"
          className="mt-3 w-full"
          onClick={() => {
            void navigator.share({ title: APP_NAME, text: shareText });
            if (entry.slug) void recordShare(entry.slug, "native");
          }}
        >
          Share
        </Button>
      ) : null}

      <Button variant="outline" className="mt-3 w-full" onClick={downloadCard}>
        <Download className="h-4 w-4" />
        Download share card (PNG)
      </Button>

      {downloadError ? (
        <p className="mt-3 text-xs text-rose-300">{downloadError}</p>
      ) : (
        <p className="mt-3 text-xs text-zinc-500">
          Instagram has no direct web share — copy the IG caption and paste it in your story or
          post.
        </p>
      )}
    </Modal>
  );
}
