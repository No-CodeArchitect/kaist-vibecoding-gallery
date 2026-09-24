import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "바이브코딩 결과물 갤러리",
  description: "AI 보수교육 교육생 프로젝트 갤러리 · 상호 채점 · AI 큐레이션",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
