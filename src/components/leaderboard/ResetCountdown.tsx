"use client";

import { Clock3 } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";
import { formatClock } from "@/lib/reset";
import { cn } from "@/lib/utils";

interface ResetCountdownProps {
  className?: string;
  variant?: "clock" | "pill";
}

export function ResetCountdown({ className, variant = "clock" }: ResetCountdownProps) {
  const { remainingMs, label } = useCountdown();
  const clock = formatClock(remainingMs);
  const ready = remainingMs > 0;

  if (variant === "pill") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-xs text-amber-200/90",
          className
        )}
      >
        <Clock3 className="h-3.5 w-3.5 shrink-0 text-amber-400" />
        <span className="font-medium">{ready ? `Resets in ${label}` : "Daily reset"}</span>
      </div>
    );
  }

  return (
    <section
      className={cn("rounded-3xl border border-white/10 bg-zinc-900/50 px-5 py-4", className)}
      aria-label="Daily ranking reset countdown"
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Daily ranking reset</p>
      <p className="mt-2 font-mono text-3xl font-semibold tracking-wide text-white tabular-nums">
        {ready ? `${clock.hours} : ${clock.minutes} : ${clock.seconds}` : "-- : -- : --"}
      </p>
      <p className="mt-2 text-xs text-zinc-500">Rankings reset every day at 00:00 IST.</p>
    </section>
  );
}
