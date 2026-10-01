import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-session";
import {
  adminLogout,
  createCohortAction,
  toggleScoringOpen,
  toggleRankRevealed,
  addStudentsAction,
  removeStudentAction,
  moderateComment,
} from "@/lib/admin-actions";
import { listCohorts } from "@/lib/cohorts-store";
import { listStudents } from "@/lib/students-store";
import { getProjects } from "@/lib/projects-data";
import { rankProjects } from "@/lib/ranking";
import { distinctRaterCountFor } from "@/lib/scores-store";
import { listAllComments } from "@/lib/comments-store";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!(await isAdmin())) redirect("/admin/login");

  const h = await headers();
  const host = h.get("host") ?? "";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const origin = host ? `${proto}://${host}` : "";

  const cohorts = await listCohorts();
  const sections = await Promise.all(
    cohorts.map(async (c) => {
      const students = await listStudents(c.id);
      const projects = getProjects(c.id);
      const pids = new Set(projects.map((p) => p.id));
      const ranked = (await rankProjects(projects)).sort(
        (a, b) => (a.rank ?? 99) - (b.rank ?? 99)
      );
      const raters = await distinctRaterCountFor(pids);
      const comments = await listAllComments(pids);
      return { c, students, projects, ranked, raters, comments };
    })
  );

  return (
    <main className="min-h-screen bg-night text-white">
      <header className="border-b border-white/10 bg-night-soft">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5 sm:px-6">
          <span className="rounded-md bg-gold/15 px-2 py-0.5 text-xs font-bold text-gold">
            관리자 콘솔
          </span>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-semibold text-white/50 hover:text-gold">
              홈
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
        {/* 새 섹션 추가 */}
        <section className="rounded-2xl bg-coal p-5 ring-1 ring-white/10">
          <h2 className="mb-1 text-sm font-bold text-white">새 섹션(기수) 추가</h2>
          <p className="mb-4 text-xs text-white/50">
            과정/기수별로 완전히 분리됩니다. 각 섹션은 고유 링크로 입장합니다.
          </p>
          <form action={createCohortAction} className="flex flex-col gap-3 sm:flex-row">
            <input
              name="name"
              required
              placeholder="섹션 이름 (예: AI 보수교육 2차)"
              className="flex-1 rounded-lg border border-white/15 bg-coal-soft px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
            <input
              name="slug"
              placeholder="링크 주소 (선택, 예: bosu-2)"
              className="w-full rounded-lg border border-white/15 bg-coal-soft px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold focus:ring-2 focus:ring-gold/20 sm:w-56"
            />
            <button className="rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-night transition hover:bg-gold-soft">
              섹션 추가
            </button>
          </form>
        </section>

        {/* 섹션별 관리 */}
        {sections.map(({ c, students, projects, ranked, raters, comments }) => (
          <section key={c.id} className="rounded-2xl bg-coal p-5 ring-1 ring-white/10">
            {/* 헤더 + 링크 */}
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-white">{c.name}</h2>
              {c.rankRevealed ? (
                <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs font-bold text-gold">
                  순위 공개
                </span>
              ) : (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/60">
                  {c.scoringOpen ? "채점 중" : "채점 마감"}
                </span>
              )}
              <Link
                href={`/g/${c.slug}`}
                className="ml-auto text-xs font-semibold text-gold hover:underline"
              >
                갤러리 열기 →
              </Link>
            </div>
            <div className="mt-2 rounded-lg bg-night px-3 py-2 text-xs text-white/60 ring-1 ring-white/10">
              교육생 배부 링크:{" "}
              <span className="font-mono text-gold">{origin}/g/{c.slug}</span>
            </div>

            {/* 운영 토글 */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                <div className="text-sm">
                  <div className="font-bold text-white">채점</div>
                  <div className="text-xs text-white/50">
                    {c.scoringOpen ? "진행 중" : "마감됨"}
                  </div>
                </div>
                <form action={toggleScoringOpen}>
                  <input type="hidden" name="cohortId" value={c.id} />
                  <input type="hidden" name="value" value={(!c.scoringOpen).toString()} />
                  <button
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                      c.scoringOpen
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gold text-night hover:bg-gold-soft"
                    }`}
                  >
                    {c.scoringOpen ? "채점 마감" : "채점 열기"}
                  </button>
                </form>
              </div>
              <div className="flex flex-1 items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                <div className="text-sm">
                  <div className="font-bold text-white">순위</div>
                  <div className="text-xs text-white/50">
                    {c.rankRevealed ? "공개됨" : "비공개"}
                  </div>
                </div>
                <form action={toggleRankRevealed}>
                  <input type="hidden" name="cohortId" value={c.id} />
                  <input type="hidden" name="value" value={(!c.rankRevealed).toString()} />
                  <button
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                      c.rankRevealed
                        ? "bg-white/15 text-white hover:bg-white/25"
                        : "bg-ink text-white hover:bg-ink-soft"
                    }`}
                  >
                    {c.rankRevealed ? "순위 숨기기" : "🏆 순위 공개"}
                  </button>
                </form>
              </div>
            </div>

            {/* 현황 */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat label="교육생" value={`${students.length}명`} />
              <Stat label="채점 참여" value={`${raters}/${students.length}`} />
              <Stat label="프로젝트" value={`${projects.length}개`} />
            </div>

            {/* 명단/코드 관리 */}
            <div className="mt-5">
              <h3 className="mb-2 text-sm font-bold text-white">명단 · 코드</h3>
              <form action={addStudentsAction} className="flex flex-col gap-2">
                <input type="hidden" name="cohortId" value={c.id} />
                <textarea
                  name="names"
                  rows={2}
                  placeholder="이름을 줄바꿈 또는 쉼표로 여러 명 입력 (예: 홍길동, 김철수)"
                  className="w-full resize-none rounded-lg border border-white/15 bg-coal-soft px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
                <button className="self-start rounded-lg bg-gold px-4 py-2 text-sm font-bold text-night transition hover:bg-gold-soft">
                  추가하고 코드 생성
                </button>
              </form>

              {students.length > 0 && (
                <ul className="mt-3 divide-y divide-white/10 rounded-lg ring-1 ring-white/10">
                  {students.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-3 px-3 py-2 text-sm"
                    >
                      <span className="flex-1 text-white">{s.name}</span>
                      <span className="rounded bg-night px-2 py-0.5 font-mono text-gold ring-1 ring-white/10">
                        {s.accessCode}
                      </span>
                      <form action={removeStudentAction}>
                        <input type="hidden" name="id" value={s.id} />
                        <button className="rounded px-2 py-0.5 text-xs text-white/40 hover:text-red-400">
                          삭제
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 순위 미리보기 */}
            {ranked.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-bold text-white">
                  순위 미리보기 (관리자 전용)
                </h3>
                <ul className="divide-y divide-white/10">
                  {ranked.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 py-2 text-sm">
                      <span className="w-6 text-center font-black text-gold">
                        {p.rank ?? "-"}
                      </span>
                      <span className="flex-1 text-white">
                        {p.title}
                        <span className="ml-2 text-xs text-white/40">
                          {p.authorName}
                        </span>
                      </span>
                      <span className="text-white/60">
                        {p.avgScore !== null ? p.avgScore.toFixed(2) : "-"}
                      </span>
                      <span className="w-12 text-right text-xs text-white/40">
                        {p.raterCount}명
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 댓글 모더레이션 */}
            {comments.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-bold text-white">
                  댓글 모더레이션 ({comments.length})
                </h3>
                <ul className="flex flex-col gap-2">
                  {comments.map((cm) => (
                    <li
                      key={cm.id}
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        cm.isHidden ? "border-red-500/30 bg-red-500/10" : "border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-white/40">
                          <span className="font-semibold text-white/70">
                            {cm.aiNickname}
                          </span>{" "}
                          · 실명 {cm.authorName}
                          {cm.isAuthorReply && " · 제작자"}
                          {cm.isHidden && " · (숨김)"}
                        </span>
                        <form action={moderateComment}>
                          <input type="hidden" name="id" value={cm.id} />
                          <input
                            type="hidden"
                            name="hidden"
                            value={(!cm.isHidden).toString()}
                          />
                          <button
                            className={`rounded px-2 py-0.5 text-xs font-semibold ${
                              cm.isHidden
                                ? "bg-gold text-night hover:bg-gold-soft"
                                : "bg-white/10 text-white/70 hover:bg-white/20"
                            }`}
                          >
                            {cm.isHidden ? "복구" : "숨기기"}
                          </button>
                        </form>
                      </div>
                      <p className="mt-1 text-white/80">{cm.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-coal-soft px-3 py-2 ring-1 ring-white/10">
      <div className="text-xs text-white/50">{label}</div>
      <div className="text-base font-bold text-white">{value}</div>
    </div>
  );
}
