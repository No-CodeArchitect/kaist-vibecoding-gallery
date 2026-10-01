import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectCard from "@/components/ProjectCard";
import { getProjects } from "@/lib/projects-data";
import { getSession } from "@/lib/session";
import { logout } from "@/lib/auth-actions";
import { scoredProjectIds } from "@/lib/scores-store";
import { getCohortBySlug } from "@/lib/cohorts-store";
import { rankProjects } from "@/lib/ranking";

export const dynamic = "force-dynamic";

export default async function SectionGalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cohort = await getCohortBySlug(slug);
  if (!cohort) notFound();

  const session = await getSession();
  // 이 섹션 소속 학생만 "로그인 상태"로 인정 (섹션 간 분리)
  const student = session && session.cohortId === cohort.id ? session : null;

  const scoredIds = student
    ? await scoredProjectIds(student.id)
    : new Set<string>();

  const base = cohort.rankRevealed
    ? await rankProjects(getProjects(cohort.id))
    : getProjects(cohort.id);

  const viewProjects = base.map((p) => {
    const isMine = student ? p.authorId === student.id : false;
    const hasScored = !!student && !isMine && scoredIds.has(p.id);
    return {
      ...p,
      isMine,
      isNew: isMine || hasScored ? false : p.isNew,
      hasScored,
    };
  });

  const projects = viewProjects.sort((a, b) => {
    if (cohort.rankRevealed) {
      const ar = a.rank ?? Infinity;
      const br = b.rank ?? Infinity;
      if (ar !== br) return ar - br;
    }
    return (
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  });

  const newCount = projects.filter((p) => p.isNew).length;
  const scoredCount = projects.filter((p) => p.hasScored).length;
  const total = projects.length;

  return (
    <main className="min-h-screen bg-night text-white">
      <header className="border-b border-white/10 bg-night-soft">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Link
            href="/"
            className="text-xs font-semibold text-white/40 hover:text-gold"
          >
            ← 홈으로
          </Link>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-gold/15 px-2 py-0.5 text-xs font-bold text-gold">
                  {cohort.name}
                </span>
                {cohort.rankRevealed ? (
                  <span className="text-xs font-bold text-gold">🏆 순위 공개</span>
                ) : (
                  <span className="text-xs font-medium text-white/40">
                    {cohort.scoringOpen
                      ? "채점 진행 중 · 순위 비공개"
                      : "채점 마감 · 순위 집계 중"}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                포트폴리오 갤러리
              </h1>
              <p className="text-sm text-white/50">
                교육생들이 만든 프로젝트를 둘러보고, 완성도와 창의성을 채점하고,
                댓글을 남겨보세요.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {cohort.rankRevealed && (
                <Link
                  href={`/g/${slug}/present`}
                  className="rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-night transition hover:bg-gold-soft"
                >
                  발표 화면
                </Link>
              )}
              {student ? (
                <>
                  <span className="hidden text-sm text-white/60 sm:inline">
                    <span className="font-semibold text-white">
                      {student.name}
                    </span>
                    <span className="text-white/40"> 님</span>
                  </span>
                  <form action={logout}>
                    <button className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/10">
                      로그아웃
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href={`/g/${slug}/login`}
                  className="rounded-full border border-gold/60 px-4 py-1.5 text-xs font-bold text-gold transition hover:bg-gold hover:text-night"
                >
                  로그인하고 채점하기
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap gap-3 text-sm">
          <Stat label="전체 프로젝트" value={`${total}개`} />
          <Stat label="NEW" value={`${newCount}개`} accent />
          {student && (
            <Stat label="내가 채점함" value={`${scoredCount} / ${total}`} />
          )}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {projects.length === 0 ? (
          <p className="rounded-2xl bg-coal px-6 py-16 text-center text-sm text-white/40 ring-1 ring-white/10">
            아직 등록된 프로젝트가 없습니다. (sync로 결과물이 생성되면 여기에
            표시됩니다)
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-4 py-2 ring-1 ${
        accent ? "bg-gold/10 ring-gold/30" : "bg-coal ring-white/10"
      }`}
    >
      <div className="text-xs text-white/50">{label}</div>
      <div className={`text-lg font-bold ${accent ? "text-gold" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}
