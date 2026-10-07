import Link from "next/link";

const NAV = [
  { href: "/", label: "홈" },
  { href: "/about", label: "과정 소개" },
  { href: "/archive", label: "아카이브" },
  { href: "/sections", label: "포트폴리오" },
  { href: "/media", label: "미디어" },
  { href: "/apply", label: "교육 신청" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-night/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-gold" />
          <span className="text-sm font-black tracking-widest text-white">
            AI 보수교육
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-white/70 transition hover:text-gold"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="rounded-full border border-gold/60 px-4 py-1.5 text-xs font-bold text-gold transition hover:bg-gold hover:text-night"
        >
          로그인
        </Link>
      </div>
    </header>
  );
}
