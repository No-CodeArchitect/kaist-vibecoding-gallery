import Link from "next/link";
import { notFound } from "next/navigation";
import ScoreWidget from "@/components/ScoreWidget";
import CommentList from "@/components/CommentList";
import CommentForm from "@/components/CommentForm";
import { COHORT_NAME } from "@/lib/dummy-data";
import { getProjectById } from "@/lib/projects-data";
import { getSession } from "@/lib/session";
import { getScore } from "@/lib/scores-store";
import { listComments } from "@/lib/comments-store";
import { getSettings } from "@/lib/settings-store";
import { rankProjects } from "@/lib/ranking";
import { getProjects } from "@/lib/projects-data";

function Stars({ value }: { value: number }) {
  return (
    <span className="text-gold">
      {"★".repeat(value)}
      <span className="text-white/20">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function Hero({ title, failed }: { title: string; failed: boolean }) {
  const initial = title.trim().charAt(0);
  return (
    <div className="flex aspect-[16/8] w-full items-center justify-center rounded-2xl bg-white/[0.05] ring-1 ring-white/10">
      <span className="text-6xl font-black text-white/25">{initial}</span>
      {failed && (
        <span className="sr-only">스크린샷 캡처 실패 · 플레이스홀더</span>
      )}
    </div>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const student = await getSession(); // 비로그인 열람 허용
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) notFound();

  const isMine = student ? project.authorId === student.id : false;
  const existing = student ? await getScore(project.id, student.id) : null;
  const comments = await listComments(project.id);
  const settings = await getSettings();
  const failed =
    project.status === "capture_failed" || !project.signatureImageUrl;

  // 순위 공개 시: 이 프로젝트의 순위/평점 (한 번의 순위 계산에서 추출)
  let rank: number | null = null;
  let agg: { avg: number | null; count: number } = { avg: null, count: 0 };
  if (settings.rankRevealed) {
    const entry = (await rankProjects(getProjects())).find(
      (p) => p.id === project.id
    );
    rank = entry?.rank ?? null;
    agg = { avg: entry?.avgScore ?? null, count: entry?.raterCount ?? 0 };
  }

  return (
    <main className="min-h-screen bg-night text-white">
      {/* 상단 바 */}
      <div className="border-b border-white/10 bg-night-soft">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/portfolio"
            className="text-sm font-semibold text-white/50 hover:text-gold"
          >
            ← 갤러리로
          </Link>
          <span className="rounded-md bg-gold/15 px-2 py-0.5 text-xs font-bold text-gold">
            {COHORT_NAME}
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px]">
        {/* 본문 */}
        <div className="flex flex-col gap-6">
          <Hero title={project.title} failed={failed} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {settings.rankRevealed && rank !== null && (
                <span className="inline-flex items-center rounded-full bg-gold/20 px-2.5 py-0.5 text-sm font-bold text-gold">
                  {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : ""}{" "}
                  {rank}위
                </span>
              )}
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                {project.title}
              </h1>
              {isMine && (
                <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/70">
                  내 작품
                </span>
              )}
            </div>
            {settings.rankRevealed && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gold/15 px-3 py-1.5 text-sm">
                <span className="font-bold text-gold">
                  교육생 평점 {agg.avg !== null ? agg.avg.toFixed(2) : "-"} / 5
                </span>
                <span className="text-white/50">· {agg.count}명 채점</span>
              </div>
            )}
            <p className="mt-1 text-base text-white/50">{project.tagline}</p>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <span className="font-semibold text-white">
                {project.authorName}
              </span>
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gold hover:text-gold-soft"
              >
                사이트 열기 ↗
              </a>
            </div>
          </div>

          {/* AI 요약 */}
          <section className="rounded-2xl bg-coal p-5 ring-1 ring-white/10">
            <h2 className="text-sm font-bold text-white">AI 요약</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              {project.aiSummary}
            </p>
            <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-white/40">
              주요 특징
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {project.features.map((f) => (
                <li
                  key={f}
                  className="rounded-full bg-gold/15 px-3 py-1 text-sm font-medium text-gold"
                >
                  {f}
                </li>
              ))}
            </ul>
          </section>

          {/* AI 심사평 (순위 미반영) */}
          <section className="rounded-2xl bg-coal p-5 ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">AI 심사평</h2>
              <span className="text-xs text-white/40">순위 미반영 · 참고용</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-white/50">완성도</span>
                <Stars value={project.aiReview.scoreCompleteness} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/50">창의성</span>
                <Stars value={project.aiReview.scoreCreativity} />
              </div>
            </div>
            <p className="mt-3 rounded-lg bg-white/5 px-3 py-3 text-sm leading-relaxed text-white/60">
              {project.aiReview.rationale}
            </p>
          </section>

          {/* 댓글 */}
          <section className="rounded-2xl bg-coal p-5 ring-1 ring-white/10">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">댓글</h2>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/60">
                {comments.length}
              </span>
            </div>
            <div className="mb-5">
              {student ? (
                <CommentForm projectId={project.id} isAuthor={isMine} />
              ) : (
                <Link
                  href="/login"
                  className="block rounded-xl border border-white/15 bg-coal-soft px-4 py-3 text-center text-sm font-semibold text-gold transition hover:bg-white/5"
                >
                  로그인 후 댓글을 남길 수 있어요
                </Link>
              )}
            </div>
            <CommentList comments={comments} />
          </section>
        </div>

        {/* 사이드: 채점 위젯 (sticky) */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <ScoreWidget
            projectId={project.id}
            isLoggedIn={!!student}
            isMine={isMine}
            isScoringOpen={settings.scoringOpen}
            existing={
              existing
                ? {
                    completeness: existing.completeness,
                    creativity: existing.creativity,
                  }
                : null
            }
          />
        </aside>
      </div>
    </main>
  );
}
