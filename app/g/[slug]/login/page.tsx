import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getStudentsPublic } from "@/lib/students-store";
import { getSession } from "@/lib/session";
import { getCohortBySlug } from "@/lib/cohorts-store";

export const dynamic = "force-dynamic";

export default async function SectionLoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cohort = await getCohortBySlug(slug);
  if (!cohort) notFound();

  // 이미 이 섹션에 로그인돼 있으면 갤러리로.
  const session = await getSession();
  if (session && session.cohortId === cohort.id) redirect(`/g/${slug}`);

  const students = await getStudentsPublic(cohort.id);

  return (
    <main className="flex min-h-screen items-center justify-center bg-night px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link
            href={`/g/${slug}`}
            className="text-xs font-semibold text-white/40 hover:text-gold"
          >
            ← {cohort.name} 갤러리
          </Link>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-white">
            {cohort.name}
          </h1>
          <p className="mt-1 text-sm text-white/50">
            명단에서 이름을 고르고 배부받은 개인 코드로 입장하세요.
          </p>
        </div>

        <div className="rounded-2xl bg-coal p-6 ring-1 ring-white/10">
          {students.length === 0 ? (
            <p className="text-center text-sm text-white/50">
              아직 등록된 명단이 없습니다. 관리자에게 문의하세요.
            </p>
          ) : (
            <LoginForm students={students} cohortId={cohort.id} slug={slug} />
          )}
        </div>

        <p className="mt-4 text-center text-xs text-white/40">
          코드는 강사가 발급합니다. 회원가입은 없습니다.
        </p>
      </div>
    </main>
  );
}
