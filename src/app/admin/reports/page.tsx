import { adminResolveReport } from "@/actions/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: { creator: true },
  });

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold text-white">Reports</h1>
      <div className="mt-6 grid gap-3">
        {reports.map((report) => (
          <div key={report.id} className="rounded-2xl border border-zinc-800 p-4">
            <p className="text-white">{report.creator.channelName}</p>
            <p className="text-xs text-zinc-500">
              {report.reason} · {report.status} · {report.details}
            </p>
            <div className="mt-3 flex gap-3 text-xs">
              <form action={adminResolveReport.bind(null, report.id, "REVIEWING")}>
                <button type="submit" className="text-zinc-300">Review</button>
              </form>
              <form action={adminResolveReport.bind(null, report.id, "RESOLVED")}>
                <button type="submit" className="text-emerald-300">Resolve</button>
              </form>
              <form action={adminResolveReport.bind(null, report.id, "REJECTED")}>
                <button type="submit" className="text-rose-300">Reject</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
