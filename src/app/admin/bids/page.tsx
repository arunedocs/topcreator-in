import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminBidsPage() {
  const bids = await prisma.bidHistory.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: { creator: true },
  });

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold text-white">Bid history</h1>
      <div className="mt-6 grid gap-2">
        {bids.map((bid) => (
          <div key={bid.id} className="rounded-xl border border-zinc-800 px-4 py-3 text-sm">
            <p className="text-white">{bid.creator.channelName}</p>
            <p className="text-xs text-zinc-500">
              {formatCurrency(bid.amount)} · rank #{bid.rankAfter} · {bid.createdAt.toISOString()}
            </p>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
