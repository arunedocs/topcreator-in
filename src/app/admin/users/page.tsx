import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const creators = await prisma.creator.findMany({
    orderBy: { joinedAt: "desc" },
    take: 80,
    select: {
      id: true,
      channelName: true,
      handle: true,
      verified: true,
      suspended: true,
      joinedAt: true,
      claimToken: true,
    },
  });

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold text-white">Users / owners</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Ownership is claim-token based until a full auth provider is added.
      </p>
      <div className="mt-6 grid gap-2">
        {creators.map((creator) => (
          <div key={creator.id} className="rounded-xl border border-zinc-800 px-4 py-3 text-sm">
            <p className="text-white">{creator.channelName}</p>
            <p className="text-xs text-zinc-500">
              @{creator.handle} · {creator.verified ? "verified" : "unverified"}
              {creator.suspended ? " · suspended" : ""}
            </p>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
