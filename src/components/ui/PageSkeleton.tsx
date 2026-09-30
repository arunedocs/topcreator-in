export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-10 sm:px-6">
      <div className="h-8 w-48 rounded-full bg-zinc-900" />
      <div className="mt-4 h-4 w-72 max-w-full rounded-full bg-zinc-900/80" />
      <div className="mt-8 grid gap-3">
        <div className="h-24 rounded-2xl bg-zinc-900/70" />
        <div className="h-24 rounded-2xl bg-zinc-900/70" />
        <div className="h-24 rounded-2xl bg-zinc-900/70" />
      </div>
    </div>
  );
}
