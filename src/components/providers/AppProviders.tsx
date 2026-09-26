"use client";

import { BidProvider } from "@/components/bid/BidProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { CATEGORIES, type CategoryId } from "@/lib/constants";

const emptyTops = CATEGORIES.reduce(
  (acc, category) => {
    acc[category.id] = 0;
    return acc;
  },
  {} as Record<CategoryId, number>
);

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <BidProvider topBidsByCategory={emptyTops}>{children}</BidProvider>
    </ToastProvider>
  );
}
