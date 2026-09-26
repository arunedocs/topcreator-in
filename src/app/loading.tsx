export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-8 sm:px-6">
        <div className="h-14 rounded-2xl bg-zinc-900" />
        <div className="mt-8 h-64 rounded-3xl bg-zinc-900/70" />
        <div className="mt-10 grid gap-4">
          <div className="h-28 rounded-2xl bg-zinc-900/70" />
          <div className="h-28 rounded-2xl bg-zinc-900/70" />
          <div className="h-28 rounded-2xl bg-zinc-900/70" />
        </div>
      </div>
    </div>
  );
}
