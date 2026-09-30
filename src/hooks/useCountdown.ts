"use client";

import { useEffect, useState } from "react";
import { formatClock, formatCountdown, getMillisecondsUntilReset } from "@/lib/reset";

export function useCountdown() {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    const tick = () => setRemainingMs(getMillisecondsUntilReset());
    tick();

    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  return {
    remainingMs,
    label: formatCountdown(remainingMs),
    clock: formatClock(remainingMs),
  };
}
