import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/AdminLoginForm";
import { COHORT_NAME } from "@/lib/dummy-data";
import { isAdmin } from "@/lib/admin-session";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-night px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="inline-block rounded-md bg-gold/15 px-2 py-0.5 text-xs font-bold text-gold">
            {COHORT_NAME} · 관리자
          </span>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-white">
            관리자 콘솔
          </h1>
          <p className="mt-1 text-sm text-white/50">
            기수 운영·순위 공개·모더레이션
          </p>
        </div>
        <div className="rounded-2xl bg-coal p-6 ring-1 ring-white/10">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
