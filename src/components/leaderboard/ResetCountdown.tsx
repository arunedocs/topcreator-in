"use client";

import { Clock3 } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";
import { cn } from "@/lib/utils";

interface ResetCountdownProps {
  className?: string;
  compact?: boolean;
}

export function ResetCountdown({ className, compact = false }: ResetCountdownProps) {
  const { label } = useCountdown();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-xs text-amber-200/90",
        compact && "px-2.5 py-1",
        className
      )}
    >
      <Clock3 className="h-3.5 w-3.5 shrink-0 text-amber-400" />
      <span className="font-medium">Resets in {label}</span>
    </div>
  );
}
