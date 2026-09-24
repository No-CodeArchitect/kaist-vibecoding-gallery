import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
        {children}
      </span>
    </div>
  );
}

// 3개 트랙 (드라이브 자료 기반: AI 리더십 / 정책·제도 / AI·SW 프로젝트)
const TRACKS = [
  {
    name: "AI 리더십",
    desc: "지휘관·간부가 AI 시대의 의사결정과 정책 방향을 이해하는 리더십 과정. 저녁 화상·소집 중심으로 운영합니다.",
  },
  {
    name: "정책·제도 수립",
    desc: "국방 AI 정책과 제도를 설계하고 실무에 적용하는 과정. 소집교육과 소양평가, 실습으로 이어집니다.",
  },
  {
    name: "AI·SW 프로젝트",
    desc: "국방 AI 혁신주제를 정하고 연구실 배정 후 실제 결과물을 개발·발표하는 과정. 바이브코딩 결과물이 여기서 나옵니다.",
  },
];

// 진행 흐름 (2024 일정표 기반)
const FLOW = [
  "입과식",
  "온라인·화상 기본교육",
  "소집교육 · AI 실습",
  "현장학습 · 특강",
  "중간발표회",
  "프로젝트 수행결과 발표",
  "자체 경연대회",
  "최종발표회 · 수료식",
];

// 연혁
const HISTORY = [
  { year: "2024", note: "군 특화 AI 교육 시작 · 3개 트랙 운영(9~12월)" },
  { year: "2025", note: "과정 지속 · 온라인 플랫폼(K-DAP) 학습 확대" },
  { year: "2026", note: "정책제도 1~3기 · 리더십 · AI·SW 프로젝트 과정 운영" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-night text-white">
      <SiteHeader />

      {/* 개요 */}
      <section className="border-b border-white/10 bg-night-soft">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Eyebrow>국방 AI 인재양성사업</Eyebrow>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            군 특화 AI 보수교육
          </h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/60">
            군 장병이 AI를 &lsquo;배우는&rsquo; 데 그치지 않고 직접 만들어
            국방 현장의 문제를 푸는 역량강화 과정입니다. 온라인 플랫폼(K-DAP)
            학습과 집합·화상 교육, 현장학습·특강을 거쳐, 마지막에는 각자
            바이브코딩으로 완성한 결과물을 발표합니다.
          </p>
        </div>
      </section>

      {/* 3개 트랙 */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Eyebrow>Tracks</Eyebrow>
        <h2 className="mt-4 text-2xl font-black sm:text-3xl">3개 트랙</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TRACKS.map((t, i) => (
            <div key={t.name} className="rounded-xl bg-coal p-6 ring-1 ring-white/10">
              <div className="text-3xl font-black text-gold/30">
                0{i + 1}
              </div>
              <div className="mt-2 text-lg font-bold text-white">{t.name}</div>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 진행 방식 */}
      <section className="border-t border-white/10 bg-night-soft">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-4 text-2xl font-black sm:text-3xl">진행 방식</h2>
          <p className="mt-3 max-w-2xl text-sm text-white/50">
            약 3개월간 온라인·집합 교육을 병행하며, 아래 흐름으로 진행됩니다.
          </p>
          <ol className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
            {FLOW.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className="rounded-lg bg-coal px-3 py-2 text-sm font-medium text-white ring-1 ring-white/10">
                  <span className="mr-1.5 text-xs font-bold text-gold">
                    {i + 1}
                  </span>
                  {step}
                </span>
                {i < FLOW.length - 1 && (
                  <span className="text-white/25">→</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 연혁 */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Eyebrow>History</Eyebrow>
        <h2 className="mt-4 text-2xl font-black sm:text-3xl">연혁</h2>
        <ul className="mt-8 space-y-4">
          {HISTORY.map((h) => (
            <li key={h.year} className="flex gap-6 border-b border-white/10 pb-4">
              <span className="w-16 shrink-0 text-lg font-black text-gold">
                {h.year}
              </span>
              <span className="flex-1 text-white/70">{h.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <SiteFooter />
    </div>
  );
}
