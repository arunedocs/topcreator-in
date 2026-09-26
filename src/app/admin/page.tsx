import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import { getIstDayBounds } from "@/lib/time";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const { start } = getIstDayBounds();

  const [
    creators,
    bids,
    revenue,
    todayBids,
    todayRevenue,
    verified,
    clicks,
    views,
    active,
  ] = await Promise.all([
    prisma.creator.count(),
    prisma.creatorBid.count(),
    prisma.payment.aggregate({ where: { status: "VERIFIED" }, _sum: { bidAmount: true } }),
    prisma.creatorBid.count({ where: { updatedAt: { gte: start } } }),
    prisma.payment.aggregate({
      where: { status: "VERIFIED", verifiedAt: { gte: start } },
      _sum: { bidAmount: true },
    }),
    prisma.creator.count({ where: { verified: true } }),
    prisma.creator.aggregate({ _sum: { youtubeClicks: true } }),
    prisma.creator.aggregate({ _sum: { profileViews: true } }),
    prisma.creator.count({ where: { suspended: false } }),
  ]);

  const stats = [
    ["Total creators", String(creators)],
    ["Total bids", String(bids)],
    ["Total revenue", formatCurrency(revenue._sum.bidAmount ?? 0)],
    ["Today's bids", String(todayBids)],
    ["Today's revenue", formatCurrency(todayRevenue._sum.bidAmount ?? 0)],
    ["Active creators", String(active)],
    ["Verified creators", String(verified)],
    ["YouTube clicks", String(clicks._sum.youtubeClicks ?? 0)],
    ["Profile views", String(views._sum.profileViews ?? 0)],
  ];

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold text-white">Admin overview</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-zinc-800 p-4">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="mt-1 text-lg text-white">{value}</p>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
