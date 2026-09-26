import { AdminShell } from "@/components/admin/AdminShell";
import { getRecentActivity } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const activity = await getRecentActivity(50);

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold text-white">Activity</h1>
      <div className="mt-6 grid gap-2">
        {activity.map((item) => (
          <p key={item.id} className="rounded-xl border border-zinc-800 px-4 py-3 text-sm text-zinc-300">
            {item.message}
          </p>
        ))}
      </div>
    </AdminShell>
  );
}
