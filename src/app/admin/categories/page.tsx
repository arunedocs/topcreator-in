import { AdminShell } from "@/components/admin/AdminShell";
import { CATEGORIES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const counts = await prisma.creatorBid.groupBy({
    by: ["category"],
    _count: { id: true },
    _max: { bidAmount: true },
  });

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold text-white">Categories</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {CATEGORIES.map((category) => {
          const row = counts.find((item) => item.category === (category.id as Category));
          return (
            <div key={category.id} className="rounded-2xl border border-zinc-800 p-4">
              <p className="text-white">
                {category.emoji} {category.label}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {row?._count.id ?? 0} bids · top ₹{row?._max.bidAmount ?? 0}
              </p>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
