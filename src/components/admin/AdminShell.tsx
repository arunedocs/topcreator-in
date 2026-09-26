import Link from "next/link";
import { redirect } from "next/navigation";
import { adminLogout } from "@/actions/admin";
import { isAdminSession } from "@/lib/admin";

const LINKS = [
  ["/admin", "Overview"],
  ["/admin/creators", "Creators"],
  ["/admin/bids", "Bids"],
  ["/admin/payments", "Payments"],
  ["/admin/categories", "Categories"],
  ["/admin/reports", "Reports"],
  ["/admin/activity", "Activity"],
  ["/admin/users", "Users"],
] as const;

export async function AdminShell({ children }: { children: React.ReactNode }) {
  if (!(await isAdminSession())) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </div>
        <form action={adminLogout}>
          <button type="submit" className="text-xs text-zinc-500">
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
