import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getStudentsPublic } from "@/lib/students";
import { getSession } from "@/lib/session";
import { COHORT_NAME } from "@/lib/dummy-data";

export default async function LoginPage() {
  // 이미 로그인 상태면 포트폴리오로.
  const session = await getSession();
  if (session) redirect("/portfolio");

  const students = getStudentsPublic();

  return (
    <main className="flex min-h-screen items-center justify-center bg-night px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-white/40 hover:text-gold"
          >
            ← 홈으로
          </Link>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-white">
            {COHORT_NAME}
          </h1>
          <p className="mt-1 text-sm text-white/50">
            명단에서 이름을 고르고 배부받은 개인 코드로 입장하세요.
          </p>
        </div>

        <div className="rounded-2xl bg-coal p-6 ring-1 ring-white/10">
          <LoginForm students={students} />
        </div>

        <p className="mt-4 text-center text-xs text-white/40">
          코드는 강사가 발급합니다. 회원가입은 없습니다.
        </p>
      </div>
    </main>
  );
}
