"use client";

import { Check, Copy, Download, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { recordShare } from "@/actions/social";
import { RankShareCard } from "@/components/share/RankShareCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { APP_NAME } from "@/lib/constants";
import { renderShareCardBlob, shareCardFilename } from "@/lib/share-card";
import type { LeaderboardEntry } from "@/lib/types";
import { buildShareText, buildTwitterShareText, buildWhatsAppShareText } from "@/lib/utils";

interface ShareFlexModalProps {
  open: boolean;
  onClose: () => void;
  entry: LeaderboardEntry | null;
}

export function ShareFlexModal({ open, onClose, entry }: ShareFlexModalProps) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const shareText = useMemo(() => (entry ? buildShareText(entry) : ""), [entry]);
  const twitterText = useMemo(() => (entry ? buildTwitterShareText(entry) : ""), [entry]);
  const whatsappText = useMemo(() => (entry ? buildWhatsAppShareText(entry) : ""), [entry]);

  if (!entry) return null;

  const markShared = (channel: string) => {
    if (entry.slug) void recordShare(entry.slug, channel);
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast("Copied to clipboard.");
      markShared("copy");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the caption.");
    }
  };

  const downloadCard = async () => {
    setError(null);
    setBusy("download");
    try {
      const blob = await renderShareCardBlob(entry);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = shareCardFilename(entry);
      anchor.click();
      URL.revokeObjectURL(url);
      markShared("download");
      toast("Rank card downloaded.");
    } catch {
      setError("Could not export the card.");
    } finally {
      setBusy(null);
    }
  };

  const shareCard = async () => {
    setError(null);
    setBusy("share");
    try {
      const blob = await renderShareCardBlob(entry);
      const file = new File([blob], shareCardFilename(entry), { type: "image/png" });
      const payload = { title: APP_NAME, text: shareText, files: [file] };

      if (navigator.canShare?.(payload)) {
        await navigator.share(payload);
        markShared("native");
        return;
      }

      await navigator.share({ title: APP_NAME, text: shareText });
      markShared("native");
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") return;
      setError("Sharing isn't available here. Download the card instead.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share your rank"
      description="This card is what people see when you post your rank."
      className="max-w-md"
    >
      <div className="mx-auto w-full max-w-[280px]">
        <RankShareCard entry={entry} />
      </div>

      <div className="mt-5 grid gap-2">
        {typeof navigator !== "undefined" && "share" in navigator ? (
          <Button className="w-full" onClick={() => void shareCard()} disabled={busy !== null}>
            <Share2 className="h-4 w-4" />
            {busy === "share" ? "Preparing card…" : "Share card"}
          </Button>
        ) : null}
        <Button variant="secondary" className="w-full" onClick={() => void downloadCard()} disabled={busy !== null}>
          <Download className="h-4 w-4" />
          {busy === "download" ? "Exporting…" : "Download card"}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markShared("whatsapp")}
          >
            <Button variant="secondary" className="w-full">
              WhatsApp
            </Button>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markShared("x")}
          >
            <Button variant="secondary" className="w-full">
              Post on X
            </Button>
          </a>
        </div>
        <Button variant="outline" className="w-full" onClick={() => void copyText()}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Caption copied" : "Copy caption"}
        </Button>
      </div>

      {error ? <p className="mt-3 text-xs text-rose-300">{error}</p> : null}
    </Modal>
  );
}
