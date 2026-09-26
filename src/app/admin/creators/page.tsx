import { adminDeleteCreator, adminSetSuspended, adminSetVerified } from "@/actions/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCreatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const creators = await prisma.creator.findMany({
    where: q
      ? {
          OR: [
            { channelName: { contains: q, mode: "insensitive" } },
            { handle: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { joinedAt: "desc" },
    take: 80,
    include: { bids: { orderBy: { bidAmount: "desc" }, take: 1 } },
  });

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold text-white">Creators</h1>
      <form className="mt-4">
        <input name="q" defaultValue={q} placeholder="Search creators" className="field-input max-w-sm" />
      </form>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs text-zinc-500">
            <tr>
              <th className="py-2 pr-4">Creator</th>
              <th className="py-2 pr-4">Bid</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {creators.map((creator) => (
              <tr key={creator.id} className="border-t border-zinc-800">
                <td className="py-3 pr-4">
                  <p className="text-white">{creator.channelName}</p>
                  <p className="text-xs text-zinc-500">@{creator.handle}</p>
                </td>
                <td className="py-3 pr-4">{formatCurrency(creator.bids[0]?.bidAmount ?? 0)}</td>
                <td className="py-3 pr-4 text-xs text-zinc-400">
                  {creator.verified ? "Verified" : "Unverified"}
                  {creator.suspended ? " · Suspended" : ""}
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    <form action={adminSetVerified.bind(null, creator.id, !creator.verified)}>
                      <button type="submit" className="text-xs text-zinc-300">
                        {creator.verified ? "Unverify" : "Verify"}
                      </button>
                    </form>
                    <form action={adminSetSuspended.bind(null, creator.id, !creator.suspended)}>
                      <button type="submit" className="text-xs text-zinc-300">
                        {creator.suspended ? "Restore" : "Suspend"}
                      </button>
                    </form>
                    <form action={adminDeleteCreator.bind(null, creator.id)}>
                      <button type="submit" className="text-xs text-rose-300">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
