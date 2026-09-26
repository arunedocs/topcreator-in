"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10">
          <AlertTriangle className="h-6 w-6 text-rose-400" />
        </div>
        <h1 className="text-xl font-semibold text-white">Something went wrong</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          The leaderboard couldn&apos;t load. Check your database connection and try again.
        </p>
        <Button onClick={reset} className="mt-6">
          Retry
        </Button>
      </div>
    </div>
  );
}
