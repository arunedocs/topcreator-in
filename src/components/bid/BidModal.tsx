"use client";

import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { confirmBidPayment, validateBidForm } from "@/actions/bids";
import {
  BID_INCREMENT,
  CATEGORIES,
  type CategoryId,
} from "@/lib/constants";
import type { BidSuccessPayload, ExistingCreatorHint, PaymentUiState } from "@/lib/types";
import { formatCurrency, getCategoryLabel, getMinimumBid } from "@/lib/utils";
import { buildRazorpayCheckoutOptions } from "@/lib/razorpay-checkout";
import { validateYouTubeUrl } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: Record<string, unknown>) => void) => void;
    };
  }
}

interface BidModalProps {
  open: boolean;
  onClose: () => void;
  activeCategory: CategoryId;
  topBidsByCategory: Record<CategoryId, number>;
  onSuccess: (payload: BidSuccessPayload) => void;
  initialChannelName?: string;
  initialChannelUrl?: string;
}

export function BidModal({
  open,
  onClose,
  activeCategory,
  topBidsByCategory,
  onSuccess,
  initialChannelName,
  initialChannelUrl,
}: BidModalProps) {
  const toast = useToast();
  const [channelName, setChannelName] = useState(initialChannelName ?? "");
  const [channelUrl, setChannelUrl] = useState(initialChannelUrl ?? "");
  const [subscriberCount, setSubscriberCount] = useState("100000");
  const [category, setCategory] = useState<CategoryId>(activeCategory);
  const [bidAmount, setBidAmount] = useState(
    getMinimumBid(topBidsByCategory[activeCategory] ?? 0)
  );
  const [urlError, setUrlError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState<ExistingCreatorHint | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentUiState>("idle");
  const [confirmed, setConfirmed] = useState<{
    rank: number;
    slug: string;
    category: CategoryId;
    bidAmount: number;
  } | null>(null);
  const [liveTops, setLiveTops] = useState(topBidsByCategory);
  const [isPending, startTransition] = useTransition();

  const categoryTopBid = liveTops[category] ?? topBidsByCategory[category] ?? 0;
  const ownBid = existing?.category === category ? existing.bidAmount : 0;
  const isOwnerIncrease = Boolean(existing && existing.category === category && ownBid > 0);
  const minimumBid = isOwnerIncrease && ownBid >= categoryTopBid
    ? ownBid + BID_INCREMENT
    : getMinimumBid(categoryTopBid);
  const payableAmount = Math.max(bidAmount, minimumBid);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    fetch(`/api/leaderboard?category=${category}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { leaderboard?: Array<{ bidAmount: number }> } | null) => {
        if (cancelled || !data?.leaderboard) return;
        setLiveTops((current) => ({
          ...current,
          [category]: data.leaderboard?.[0]?.bidAmount ?? 0,
        }));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [open, category]);

  const paymentReady = useMemo(() => {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
    return Boolean(keyId && keyId.startsWith("rzp_"));
  }, []);

  const handleUrlBlur = async () => {
    if (!channelUrl.trim()) {
      setUrlError(null);
      setExisting(null);
      return;
    }

    const result = validateYouTubeUrl(channelUrl);
    setUrlError(result.valid ? null : result.error ?? "Invalid URL");
    if (!result.valid) return;

    const response = await fetch(`/api/creators/lookup?url=${encodeURIComponent(result.normalized)}`);
    if (!response.ok) return;
    const data = (await response.json()) as { existing: ExistingCreatorHint | null };
    setExisting(data.existing);
    if (data.existing) {
      setChannelName((current) => current || data.existing!.channelName);
      setCategory(data.existing.category);
    }
  };

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const completeBid = async (
    orderId: string,
    paymentId: string,
    signature: string,
    payload: BidSuccessPayload
  ) => {
    setPaymentState("verifying");
    const verifyResponse = await fetch("/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    });

    if (!verifyResponse.ok) {
      const verifyError = (await verifyResponse.json()) as { error?: string };
      setPaymentState("failed");
      setError(verifyError.error ?? "Payment verification failed.");
      return;
    }

    const confirmForm = new FormData();
    confirmForm.set("orderId", orderId);
    confirmForm.set("paymentId", paymentId);
    confirmForm.set("signature", signature);
    Object.entries(payload).forEach(([key, value]) => {
      confirmForm.set(key, String(value));
    });

    const confirmResult = await confirmBidPayment(confirmForm);

    if ("error" in confirmResult && confirmResult.error) {
      setPaymentState("failed");
      setError(confirmResult.error);
      return;
    }

    const rank = "rank" in confirmResult && typeof confirmResult.rank === "number" ? confirmResult.rank : 1;
    const slug = "slug" in confirmResult && confirmResult.slug ? confirmResult.slug : payload.slug ?? "";

    setPaymentState("confirmed");
    setConfirmed({
      rank,
      slug,
      category: payload.category,
      bidAmount: payload.bidAmount,
    });
    toast(`You're now #${rank}.`);
    onSuccess({ ...payload, slug, rank });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const urlValidation = validateYouTubeUrl(channelUrl);
    if (!urlValidation.valid) {
      setUrlError(urlValidation.error ?? "Invalid YouTube URL.");
      return;
    }

    startTransition(async () => {
      setPaymentState("preparing");
      const formData = new FormData();
      formData.set("channelName", channelName);
      formData.set("channelUrl", urlValidation.normalized);
      formData.set("category", category);
      formData.set("bidAmount", String(payableAmount));
      formData.set("subscriberCount", subscriberCount);

      const validation = await validateBidForm(formData);

      if ("error" in validation && validation.error) {
        setPaymentState("failed");
        setError(validation.error);
        return;
      }

      if (!validation.success || !validation.payload) {
        setPaymentState("failed");
        setError("Could not validate bid. Try again.");
        return;
      }

      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payableAmount * 100,
          currency: "INR",
          receipt: `bid_${Date.now()}`,
          channelName: validation.payload.channelName,
          channelUrl: validation.payload.channelUrl,
          category: validation.payload.category,
          bidAmount: validation.payload.bidAmount,
          subscriberCount: validation.payload.subscriberCount,
          avatarUrl: validation.payload.avatarUrl,
        }),
      });

      if (!orderResponse.ok) {
        const orderError = (await orderResponse.json()) as { error?: string };
        setPaymentState("failed");
        setError(orderError.error ?? "Could not create payment order.");
        return;
      }

      const order = (await orderResponse.json()) as {
        order_id: string;
        amount: number;
        currency: string;
        key_id: string;
        mock?: boolean;
      };

      if (order.mock || order.order_id.startsWith("order_mock_")) {
        if (process.env.NODE_ENV === "production") {
          setPaymentState("failed");
          setError("Payment is not configured. Contact support.");
          return;
        }
      }

      if (!order.key_id?.startsWith("rzp_")) {
        setPaymentState("failed");
        setError("Invalid payment configuration. Razorpay key is missing.");
        return;
      }

      const allowMockPayment =
        process.env.NODE_ENV === "development" &&
        (order.mock || order.order_id.startsWith("order_mock_"));

      const scriptLoaded = await loadRazorpayScript();

      if (allowMockPayment && (!scriptLoaded || !window.Razorpay)) {
        setPaymentState("processing");
        await completeBid(
          order.order_id,
          `pay_mock_${Date.now()}`,
          "mock_signature",
          validation.payload
        );
        return;
      }

      if (!scriptLoaded || !window.Razorpay) {
        setPaymentState("failed");
        setError("Payment checkout failed to load. Please refresh and try again.");
        return;
      }

      setPaymentState("opened");
      const checkoutOptions = buildRazorpayCheckoutOptions({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        orderId: order.order_id,
        channelName,
        category,
        onSuccess: async (response) => {
          setPaymentState("processing");
          await completeBid(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            validation.payload
          );
        },
        onDismiss: () => {
          setPaymentState("failed");
          setError("Payment cancelled.");
        },
      });

      const razorpay = new window.Razorpay(checkoutOptions);

      razorpay.on("payment.failed", (response) => {
        const description =
          (response.error as { description?: string } | undefined)?.description ??
          "Payment failed. Please try again.";
        setPaymentState("failed");
        setError(description);
      });

      razorpay.open();
    });
  };

  const stepIndex =
    paymentState === "idle" || paymentState === "failed"
      ? 0
      : paymentState === "confirmed"
        ? 2
        : 1;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={confirmed ? "You're officially ranked." : isOwnerIncrease ? "Increase your bid" : "Claim your rank"}
      description={
        confirmed
          ? "Payment verified. Your ranking is live."
          : "Secure checkout via Razorpay · UPI, cards & wallets"
      }
    >
      <div className="mb-5 grid grid-cols-3 gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-center text-xs">
        <Step label="1. Details" active={stepIndex === 0} />
        <Step label="2. Pay" active={stepIndex === 1} />
        <Step label="3. Ranked" active={stepIndex === 2} />
      </div>

      {confirmed ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
            <p className="mt-3 text-sm text-zinc-400">Your rank</p>
            <p className="text-4xl font-semibold text-white">#{confirmed.rank}</p>
            <p className="mt-2 text-sm text-zinc-400">
              {getCategoryLabel(confirmed.category)} · {formatCurrency(confirmed.bidAmount)}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/creator/${confirmed.slug}`} className="flex-1">
              <Button className="w-full">View my profile</Button>
            </Link>
            <Link href={`/creator/${confirmed.slug}?share=1`} className="flex-1">
              <Button variant="secondary" className="w-full">
                Share my rank
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Creator / channel name">
            <input
              required
              value={channelName}
              onChange={(event) => setChannelName(event.target.value)}
              placeholder="e.g. TechWala India"
              className="field-input"
            />
          </Field>

          <Field label="YouTube channel link">
            <input
              required
              type="url"
              value={channelUrl}
              onChange={(event) => {
                setChannelUrl(event.target.value);
                if (urlError) setUrlError(null);
              }}
              onBlur={() => void handleUrlBlur()}
              placeholder="https://youtube.com/@yourchannel"
              className="field-input"
              aria-invalid={Boolean(urlError)}
            />
            {urlError ? <p className="mt-2 text-xs text-rose-300">{urlError}</p> : null}
          </Field>

          {existing ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Creator already exists. Current rank #{existing.rank} · {formatCurrency(existing.bidAmount)}.
              Increase your bid to climb.
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <select
                value={category}
                onChange={(event) => {
                  const nextCategory = event.target.value as CategoryId;
                  setCategory(nextCategory);
                  setBidAmount(getMinimumBid(liveTops[nextCategory] ?? 0));
                }}
                className="field-input"
              >
                {CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.emoji} {item.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Subscriber count">
              <input
                type="number"
                min={0}
                value={subscriberCount}
                onChange={(event) => setSubscriberCount(event.target.value)}
                className="field-input"
              />
            </Field>
          </div>

          <div className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Current #1</p>
              <p className="mt-1 text-xl font-semibold text-white">
                {categoryTopBid > 0 ? formatCurrency(categoryTopBid) : "Unclaimed"}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                {isOwnerIncrease ? "Increase to" : "Minimum required"}
              </p>
              <p className="mt-1 text-xl font-semibold text-amber-300">{formatCurrency(minimumBid)}</p>
            </div>
          </div>

          <Field label={`Bid amount (min ₹${minimumBid})`}>
            <input
              required
              type="number"
              min={minimumBid}
              step={BID_INCREMENT}
              value={payableAmount}
              onChange={(event) => {
                const next = Number(event.target.value);
                setBidAmount(Number.isNaN(next) ? minimumBid : Math.max(minimumBid, next));
              }}
              className="field-input"
            />
            {isOwnerIncrease ? (
              <p className="mt-2 text-xs text-zinc-500">
                Your current bid: {formatCurrency(ownBid)}
              </p>
            ) : (
              <p className="mt-2 text-xs text-zinc-500">
                Beat the current #1 by ₹{BID_INCREMENT} minimum. Rank is calculated on the server.
              </p>
            )}
          </Field>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">You pay</span>
              <span className="font-semibold text-white">₹{payableAmount.toLocaleString("en-IN")}</span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
              <CreditCard className="h-3.5 w-3.5" />
              {paymentLabel(paymentState, paymentReady)}
            </p>
          </div>

          {error ? (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              type="submit"
              disabled={isPending || Boolean(urlError) || paymentState === "verifying"}
              className="flex-1"
            >
              {isPending || paymentState === "preparing" || paymentState === "verifying" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {paymentState === "verifying" ? "Verifying payment…" : "Opening checkout…"}
                </>
              ) : isOwnerIncrease ? (
                `Increase bid · ₹${payableAmount.toLocaleString("en-IN")}`
              ) : (
                `Claim #1 · ₹${payableAmount.toLocaleString("en-IN")}`
              )}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function paymentLabel(state: PaymentUiState, ready: boolean) {
  switch (state) {
    case "preparing":
      return "Preparing payment";
    case "opened":
      return "Payment opened";
    case "processing":
      return "Payment processing";
    case "verifying":
      return "Payment verification";
    case "confirmed":
      return "Bid confirmed";
    case "failed":
      return "Payment failed";
    default:
      return ready ? "Razorpay checkout — UPI, cards & wallets" : "Mock checkout in dev mode";
  }
}

function Step({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div
      className={
        active
          ? "rounded-lg bg-zinc-800/80 px-2 py-2 font-medium text-white"
          : "px-2 py-2 text-zinc-500"
      }
    >
      {label}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
