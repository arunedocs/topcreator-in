import { adminLogin } from "@/actions/admin";
import { Button } from "@/components/ui/Button";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4">
      <form action={adminLogin} className="w-full space-y-4 rounded-3xl border border-zinc-800 p-6">
        <h1 className="text-2xl font-semibold text-white">Admin</h1>
        <p className="text-sm text-zinc-400">
          Sign in with ADMIN_PASSWORD. In local development the fallback is <code>admin</code>.
        </p>
        {error ? (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            Invalid admin password.
          </p>
        ) : null}
        <input name="password" type="password" required className="field-input" placeholder="Password" />
        <Button type="submit" className="w-full">
          Enter
        </Button>
      </form>
    </div>
  );
}
