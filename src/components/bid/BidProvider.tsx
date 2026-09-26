"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { CategoryId } from "@/lib/constants";
import { CATEGORIES } from "@/lib/constants";
import type { BidSuccessPayload } from "@/lib/types";
import { BidModal } from "./BidModal";

interface BidIntent {
  category: CategoryId;
  channelName?: string;
  channelUrl?: string;
}

interface BidContextValue {
  openBid: (intent?: Partial<BidIntent>) => void;
}

const BidContext = createContext<BidContextValue>({
  openBid: () => undefined,
});

export function BidProvider({
  children,
  topBidsByCategory,
}: {
  children: React.ReactNode;
  topBidsByCategory: Record<CategoryId, number>;
}) {
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<BidIntent>({ category: "TECH" });
  const [tops, setTops] = useState(topBidsByCategory);

  const openBid = useCallback((next?: Partial<BidIntent>) => {
    setIntent({
      category: next?.category ?? "TECH",
      channelName: next?.channelName,
      channelUrl: next?.channelUrl,
    });
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openBid }), [openBid]);

  const handleSuccess = (payload: BidSuccessPayload) => {
    setTops((current) => ({
      ...current,
      [payload.category]: Math.max(current[payload.category] ?? 0, payload.bidAmount),
    }));
  };

  return (
    <BidContext.Provider value={value}>
      {children}
      <BidModal
        key={`${open}-${intent.category}-${intent.channelUrl ?? ""}`}
        open={open}
        onClose={() => setOpen(false)}
        activeCategory={intent.category}
        topBidsByCategory={
          Object.keys(tops).length > 0
            ? tops
            : CATEGORIES.reduce(
                (acc, category) => {
                  acc[category.id] = 0;
                  return acc;
                },
                {} as Record<CategoryId, number>
              )
        }
        initialChannelName={intent.channelName}
        initialChannelUrl={intent.channelUrl}
        onSuccess={handleSuccess}
      />
    </BidContext.Provider>
  );
}

export function useBid() {
  return useContext(BidContext);
}
