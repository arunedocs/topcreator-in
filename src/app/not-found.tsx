import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-white">Page not found</h1>
      <p className="mt-2 text-sm text-zinc-400">
        That creator, category, or page doesn&apos;t exist. Explore the live leaderboard instead.
      </p>
      <Link href="/rankings" className="mt-6">
        <Button>Explore creators</Button>
      </Link>
    </div>
  );
}
