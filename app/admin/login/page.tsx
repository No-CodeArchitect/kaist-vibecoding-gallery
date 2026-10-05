import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/AdminLoginForm";
import { isAdmin } from "@/lib/admin-session";
import { ssoEnabled } from "@/lib/google-oauth";

export const dynamic = "force-dynamic";

function errorText(code: string | undefined, email: string | undefined): string | null {
  switch (code) {
    case "denied":
      return `관리자로 등록되지 않은 계정입니다${email ? ` (${email})` : ""}. 등록된 구글 계정으로 다시 로그인하세요.`;
    case "state":
      return "로그인 요청이 만료되었거나 올바르지 않습니다. 다시 시도해 주세요.";
    case "google":
      return "구글 로그인에 실패했습니다. 다시 시도해 주세요.";
    case "sso_off":
      return "구글 로그인이 설정되지 않았습니다.";
    default:
      return null;
  }
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");

  const sp = await searchParams;
  const sso = ssoEnabled();
  const error = errorText(sp.error, sp.email);

  return (
    <main className="flex min-h-screen items-center justify-center bg-night px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black tracking-tight text-white">
            관리자 콘솔
          </h1>
          <p className="mt-1 text-sm text-white/50">
            기수 운영·순위 공개·미디어·모더레이션
          </p>
        </div>

        <div className="rounded-2xl bg-coal p-6 ring-1 ring-white/10">
          {error && (
            <p
              data-testid="login-error"
              className="mb-4 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          {sso ? (
            <>
              <a
                href="/api/admin/google/start"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-night transition hover:bg-white/90"
              >
                <span className="text-base font-black text-[#4285F4]">G</span>
                Google 계정으로 로그인
              </a>
              <p className="mt-3 text-center text-xs text-white/40">
                관리자로 등록된 구글 계정만 입장할 수 있습니다.
              </p>
            </>
          ) : (
            <>
              <AdminLoginForm />
              <p className="mt-4 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/50">
                구글 로그인이 아직 설정되지 않아 임시로 비밀번호 로그인을 쓰고
                있습니다. 설정 후에는 구글 로그인으로 자동 전환됩니다.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
