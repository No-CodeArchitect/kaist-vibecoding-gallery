import Link from "next/link";
import { redirect } from "next/navigation";
import { COHORT_NAME } from "@/lib/dummy-data";
import { isAdmin } from "@/lib/admin-session";
import {
  adminLogout,
  toggleScoringOpen,
  toggleRankRevealed,
  moderateComment,
} from "@/lib/admin-actions";
import { getSettings } from "@/lib/settings-store";
import { getProjects, getProjectsMeta } from "@/lib/projects-data";
import { rankProjects } from "@/lib/ranking";
import { distinctRaterCount } from "@/lib/scores-store";
import { listAllComments } from "@/lib/comments-store";
import { students } from "@/lib/students";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-coal p-5 ring-1 ring-white/10">
      <h2 className="mb-4 text-sm font-bold text-white">{title}</h2>
      {children}
    </section>
  );
}

export default async function AdminDashboard() {
  if (!(await isAdmin())) redirect("/admin/login");

  const settings = await getSettings();
  const meta = getProjectsMeta();
  const ranked = (await rankProjects(getProjects())).sort(
    (a, b) => (a.rank ?? 99) - (b.rank ?? 99)
  );
  const titleById = new Map(getProjects().map((p) => [p.id, p.title]));
  const comments = await listAllComments();

  const totalStudents = students.length;
  const raters = await distinctRaterCount();

  return (
    <main className="min-h-screen bg-night text-white">
      <header className="border-b border-white/10 bg-night-soft">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-gold/15 px-2 py-0.5 text-xs font-bold text-gold">
              {COHORT_NAME} · 관리자
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/portfolio"
              className="text-sm font-semibold text-white/50 hover:text-gold"
            >
              갤러리
            </Link>
            <form action={adminLogout}>
              <button className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10">
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
        {/* 기수 운영 토글 */}
        <Section title="기수 운영">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 items-center justify-between rounded-xl border border-white/10 px-4 py-3">
              <div>
                <div className="text-sm font-bold text-white">채점</div>
                <div className="text-xs text-white/50">
                  {settings.scoringOpen ? "진행 중" : "마감됨"}
                </div>
              </div>
              <form action={toggleScoringOpen}>
                <input
                  type="hidden"
                  name="value"
                  value={(!settings.scoringOpen).toString()}
                />
                <button
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    settings.scoringOpen
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-gold text-night hover:bg-gold-soft"
                  }`}
                >
                  {settings.scoringOpen ? "채점 마감하기" : "채점 다시 열기"}
                </button>
              </form>
            </div>

            <div className="flex flex-1 items-center justify-between rounded-xl border border-white/10 px-4 py-3">
              <div>
                <div className="text-sm font-bold text-white">순위</div>
                <div className="text-xs text-white/50">
                  {settings.rankRevealed ? "공개됨" : "비공개"}
                </div>
              </div>
              <form action={toggleRankRevealed}>
                <input
                  type="hidden"
                  name="value"
                  value={(!settings.rankRevealed).toString()}
                />
                <button
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    settings.rankRevealed
                      ? "bg-white/15 text-white hover:bg-white/25"
                      : "bg-gold text-night hover:bg-gold-soft"
                  }`}
                >
                  {settings.rankRevealed ? "순위 숨기기" : "🏆 순위 공개하기"}
                </button>
              </form>
            </div>
          </div>
        </Section>

        {/* 현황 */}
        <Section title="현황">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="프로젝트" value={`${meta.count}개`} />
            <Stat label="교육생" value={`${totalStudents}명`} />
            <Stat label="채점 참여" value={`${raters}/${totalStudents}명`} />
            <Stat
              label="데이터 소스"
              value={meta.fromPipeline ? "파이프라인" : "더미"}
            />
          </div>
          <p className="mt-3 text-xs text-white/40">
            마지막 sync:{" "}
            {meta.lastGeneratedAt
              ? new Date(meta.lastGeneratedAt).toLocaleString("ko-KR")
              : "없음 (npm run sync 실행 전)"}
          </p>
        </Section>

        {/* 프로젝트별 채점 현황 + 순위 미리보기 */}
        <Section title="프로젝트별 채점 현황 (관리자 순위 미리보기)">
          <ul className="divide-y divide-white/10">
            {ranked.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="w-8 text-center font-black text-gold">
                  {p.rank ?? "-"}
                </span>
                <span className="flex-1 font-medium text-white">
                  {p.title}
                  <span className="ml-2 text-xs text-white/40">
                    {p.authorName}
                  </span>
                </span>
                <span className="text-white/60">
                  평점 {p.avgScore !== null ? p.avgScore.toFixed(2) : "-"}
                </span>
                <span className="w-16 text-right text-xs text-white/40">
                  {p.raterCount}명
                </span>
              </li>
            ))}
          </ul>
        </Section>

        {/* 댓글 모더레이션 */}
        <Section title={`댓글 모더레이션 (${comments.length})`}>
          {comments.length === 0 ? (
            <p className="text-sm text-white/40">아직 댓글이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className={`rounded-xl border px-4 py-3 ${
                    c.isHidden
                      ? "border-red-500/30 bg-red-500/10"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-white/40">
                      <span className="font-semibold text-white/70">
                        {c.aiNickname}
                      </span>{" "}
                      · 실명 {c.authorName} · {titleById.get(c.projectId) ?? c.projectId}
                      {c.isAuthorReply && " · 제작자"}
                      {c.isHidden && " · (숨김)"}
                    </div>
                    <form action={moderateComment}>
                      <input type="hidden" name="id" value={c.id} />
                      <input
                        type="hidden"
                        name="hidden"
                        value={(!c.isHidden).toString()}
                      />
                      <button
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${
                          c.isHidden
                            ? "bg-gold text-night hover:bg-gold-soft"
                            : "bg-white/10 text-white/70 hover:bg-white/20"
                        }`}
                      >
                        {c.isHidden ? "복구" : "숨기기"}
                      </button>
                    </form>
                  </div>
                  <p className="mt-1.5 text-sm text-white/80">{c.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-coal-soft px-4 py-2 ring-1 ring-white/10">
      <div className="text-xs text-white/50">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  );
}
