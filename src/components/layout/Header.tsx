import { Crown, Zap } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  onBidClick?: () => void;
}

export function Header({ onBidClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500">
            <Crown className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">{APP_NAME}</p>
            <p className="text-xs text-zinc-500">Pay. Rank. Flex.</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1 rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400 sm:inline-flex">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Live leaderboard
          </span>
          {onBidClick ? (
            <Button onClick={onBidClick} className="hidden sm:inline-flex">
              Outbid #1
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
