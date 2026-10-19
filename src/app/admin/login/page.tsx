import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { LoginForm } from "./LoginForm";
import { SetupForm } from "./SetupForm";
import { setupAvailable } from "@/lib/admin/setup";

export const metadata = { title: "Sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getSessionUser()) redirect("/admin");
  const [{ next }, settings, userCount] = await Promise.all([
    searchParams,
    db.siteSettings.findUnique({ where: { id: "singleton" }, select: { brandName: true } }),
    db.user.count(),
  ]);
  return (
    <main className="admin flex min-h-screen items-center justify-center bg-zinc-100 p-4">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center text-sm font-medium text-zinc-500">{settings?.brandName ?? "Website"} · Admin</p>
        <div className="rounded-xl border border-zinc-200 bg-white p-7 shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900">Sign in</h1>
          <p className="mt-1 text-sm text-zinc-500">Content management for your website.</p>
          {userCount === 0 && (await setupAvailable()) ? (
            <SetupForm />
          ) : userCount === 0 ? (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              No administrator exists yet. Create the first Super Admin from a terminal in the project folder:
              <code className="mt-2 block rounded bg-white px-2 py-1 font-mono text-xs">npm run create-admin:prod</code>
              <span className="mt-2 block text-xs">Or set a SETUP_TOKEN environment variable to enable one-time setup in the browser (see README).</span>
            </div>
          ) : (
            <LoginForm next={next} />
          )}
        </div>
      </div>
    </main>
  );
}
