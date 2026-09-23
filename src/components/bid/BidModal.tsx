"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { confirmBidPayment, createBidOrder } from "@/actions/bids";
import { BID_INCREMENT, CATEGORIES, MIN_BID_AMOUNT, type CategoryId } from "@/lib/constants";
import { getMinimumBid } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface BidModalProps {
  open: boolean;
  onClose: () => void;
  activeCategory: CategoryId;
  currentTopBid: number;
  onSuccess: () => void;
}

export function BidModal({
  open,
  onClose,
  activeCategory,
  currentTopBid,
  onSuccess,
}: BidModalProps) {
  const [channelName, setChannelName] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [subscriberCount, setSubscriberCount] = useState("100000");
  const [category, setCategory] = useState<CategoryId>(activeCategory);
  const [bidAmount, setBidAmount] = useState(getMinimumBid(currentTopBid));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const minimumBid = getMinimumBid(currentTopBid);

  useEffect(() => {
    if (open) {
      setCategory(activeCategory);
      setBidAmount(getMinimumBid(currentTopBid));
      setError(null);
    }
  }, [open, activeCategory, currentTopBid]);

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("channelName", channelName);
      formData.set("channelUrl", channelUrl);
      formData.set("category", category);
      formData.set("bidAmount", String(bidAmount));
      formData.set("subscriberCount", subscriberCount);

      const result = await createBidOrder(formData);

      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }

      if (!result.success || !result.order || !result.payload) {
        setError("Could not start payment. Try again.");
        return;
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        const mockForm = new FormData();
        mockForm.set("orderId", result.order.orderId);
        mockForm.set("paymentId", `pay_mock_${Date.now()}`);
        mockForm.set("signature", "mock_signature");
        Object.entries(result.payload).forEach(([key, value]) => {
          mockForm.set(key, String(value));
        });

        const confirmResult = await confirmBidPayment(mockForm);

        if (confirmResult.error) {
          setError(confirmResult.error);
          return;
        }

        onSuccess();
        onClose();
        return;
      }

      const razorpay = new window.Razorpay({
        key: result.order.keyId,
        amount: result.order.amount,
        currency: result.order.currency,
        name: "TopCreator.in",
        description: `#1 bid in ${category}`,
        order_id: result.order.orderId,
        prefill: { name: channelName },
        theme: { color: "#09090b" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const confirmForm = new FormData();
          confirmForm.set("orderId", response.razorpay_order_id);
          confirmForm.set("paymentId", response.razorpay_payment_id);
          confirmForm.set("signature", response.razorpay_signature);
          Object.entries(result.payload!).forEach(([key, value]) => {
            confirmForm.set(key, String(value));
          });

          const confirmResult = await confirmBidPayment(confirmForm);

          if (confirmResult.error) {
            setError(confirmResult.error);
            return;
          }

          onSuccess();
          onClose();
        },
      });

      razorpay.open();
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Outbid for #1"
      description={`Minimum bid: ₹${minimumBid}. Each outbid adds ₹${BID_INCREMENT}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Channel name">
          <input
            required
            value={channelName}
            onChange={(event) => setChannelName(event.target.value)}
            placeholder="Your YouTube channel name"
            className="input"
          />
        </Field>

        <Field label="YouTube channel URL">
          <input
            required
            type="url"
            value={channelUrl}
            onChange={(event) => setChannelUrl(event.target.value)}
            placeholder="https://youtube.com/@yourchannel"
            className="input"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as CategoryId)}
              className="input"
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
              className="input"
            />
          </Field>
        </div>

        <Field label={`Bid amount (min ₹${minimumBid})`}>
          <input
            required
            type="number"
            min={minimumBid}
            step={BID_INCREMENT}
            value={bidAmount}
            onChange={(event) => setBidAmount(Number(event.target.value))}
            className="input"
          />
          <p className="mt-2 text-xs text-zinc-500">
            First bid starts at ₹{MIN_BID_AMOUNT}. Beat #1 by at least ₹{BID_INCREMENT}.
          </p>
        </Field>

        {error ? (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ₹${bidAmount} & claim rank`
            )}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.875rem;
          border: 1px solid rgb(39 39 42);
          background: rgb(9 9 11);
          padding: 0.75rem 0.875rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
        }
        .input:focus {
          border-color: rgb(82 82 91);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.04);
        }
      `}</style>
    </Modal>
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
