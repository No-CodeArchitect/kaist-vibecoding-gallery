import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-night">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-gold" />
            <span className="text-sm font-black tracking-widest text-white">
              AI 보수교육
            </span>
          </div>
          <p className="mt-2 text-xs text-white/40">
            군 특화 AI 보수교육 · 바이브코딩 결과물 아카이브
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-xs text-white/50">
          <Link href="/about" className="hover:text-gold">
            과정 소개
          </Link>
          <Link href="/archive" className="hover:text-gold">
            아카이브
          </Link>
          <Link href="/portfolio" className="hover:text-gold">
            포트폴리오
          </Link>
          <Link href="/media" className="hover:text-gold">
            미디어
          </Link>
          <Link href="/admin" className="hover:text-gold">
            관리자
          </Link>
        </nav>
      </div>
    </footer>
  );
}
