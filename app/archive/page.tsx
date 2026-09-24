import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { listImages } from "@/lib/media";

export const dynamic = "force-dynamic";

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

// 실제 연도×트랙 구조 (드라이브 자료 기반)
const ARCHIVE = [
  {
    year: "2026",
    tag: "진행 중",
    cohorts: ["정책·제도 1·2·3기", "AI 리더십", "AI·SW 프로젝트"],
  },
  {
    year: "2025",
    tag: "",
    cohorts: ["AI 리더십", "정책·제도", "AI·SW 프로젝트"],
  },
  {
    year: "2024",
    tag: "과정 시작",
    cohorts: ["AI 리더십", "정책·제도", "AI·SW 프로젝트"],
  },
];

export default function ArchivePage() {
  return (
    <div className="min-h-screen bg-night text-white">
      <SiteHeader />

      <section className="border-b border-white/10 bg-night-soft">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Eyebrow>Archive</Eyebrow>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            기수별 아카이브
          </h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/60">
            2024년 시작 이래 매년 여러 트랙으로 운영해 온 교육의 기록입니다.
            연도별 현장 사진과 트랙을 모았습니다.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {ARCHIVE.map((y) => {
          const photos = listImages(`media/archive/${y.year}`);
          return (
            <section key={y.year} className="mb-16 last:mb-0">
              {/* 연도 헤더 */}
              <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-4">
                <h2 className="text-3xl font-black text-white">{y.year}</h2>
                {y.tag && (
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">
                    {y.tag}
                  </span>
                )}
                <div className="ml-auto flex flex-wrap gap-2">
                  {y.cohorts.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/70 ring-1 ring-white/10"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* 사진 스트립 (media/archive/<year>/ 에 넣으면 자동 표시) */}
              {photos.length > 0 ? (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {photos.map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={src}
                      src={src}
                      alt={`${y.year} 현장`}
                      className="aspect-[4/3] w-full rounded-xl object-cover ring-1 ring-white/10"
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 flex aspect-[16/5] items-center justify-center rounded-xl bg-white/[0.05] ring-1 ring-white/10">
                  <span className="text-xs text-white/35">
                    {y.year} 현장 사진 자리 · public/media/archive/{y.year}/ 에 넣으면 표시됩니다
                  </span>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <SiteFooter />
    </div>
  );
}
