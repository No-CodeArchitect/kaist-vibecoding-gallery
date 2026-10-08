import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = { title: "개인정보 처리방침" };

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. 수집하는 개인정보",
    body: (
      <ul className="list-disc pl-5">
        <li>
          교육생 로그인·가입: 구글 계정 정보(이메일, 이름, 계정 식별자), 가입 시 입력한 실명·닉네임
        </li>
        <li>작품 등록: 작품 설명, 배포 주소, 썸네일 이미지 등 교육생이 입력·업로드한 내용</li>
        <li>채점·댓글: 채점 점수, 댓글 내용 (작성자 계정과 연결)</li>
        <li>부대 AI 교육 신청: 부대(기관)명, 담당자 계급·성명, 연락처, 이메일(선택), 신청 내용</li>
        <li>관리자: 구글 계정 이메일</li>
      </ul>
    ),
  },
  {
    title: "2. 이용 목적",
    body: (
      <ul className="list-disc pl-5">
        <li>교육생 본인 확인, 섹션(과정) 가입 승인, 채점·댓글·작품 등록 기능 제공</li>
        <li>교육 결과물 갤러리 운영 및 AI 요약·심사 생성</li>
        <li>부대 AI 교육 신청 확인 및 일정 협의 연락</li>
      </ul>
    ),
  },
  {
    title: "3. 공개 범위",
    body: (
      <p>
        갤러리에는 교육생이 정한 <b>닉네임</b>과 등록한 작품 정보만 공개됩니다. 실명·이메일·채점
        내역·교육 신청 정보는 관리자만 볼 수 있습니다. 댓글은 AI가 붙인 별칭으로 표시됩니다.
      </p>
    ),
  },
  {
    title: "4. 처리를 맡기는 서비스",
    body: (
      <ul className="list-disc pl-5">
        <li>Google — 로그인(계정 인증)</li>
        <li>Supabase — 데이터·이미지 저장</li>
        <li>Vercel — 웹사이트 호스팅</li>
        <li>Anthropic(Claude) — 등록된 작품 설명·썸네일을 분석해 요약·심사 생성</li>
      </ul>
    ),
  },
  {
    title: "5. 보유 기간과 파기",
    body: (
      <p>
        교육 결과물 아카이브는 과정 운영 기간 동안 보관합니다. 교육 신청 정보는 상담 종료 후 1년
        이내에 파기합니다. 본인이 요청하면 가입 정보·작품·댓글을 지체 없이 삭제합니다.
      </p>
    ),
  },
  {
    title: "6. 이용자의 권리와 문의",
    body: (
      <p>
        자신의 정보 열람·수정·삭제를 원하면 과정 담당 강사(사이트 관리자)에게 요청해 주세요. 구글
        로그인 연결은 구글 계정 설정의 「서드 파티 앱 및 서비스」에서 언제든 해제할 수 있습니다.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-night text-white">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-black tracking-tight">개인정보 처리방침</h1>
        <p className="mt-3 text-sm text-white/50">
          군 특화 AI 교육 결과물 갤러리(이하 「사이트」)가 이용자의 개인정보를 어떻게 다루는지
          안내합니다.
        </p>
        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-white/70">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="mb-2 text-base font-bold text-white">{s.title}</h2>
              {s.body}
            </section>
          ))}
        </div>
        <p className="mt-12 text-xs text-white/40">시행일: 2026년 10월 8일</p>
      </main>
      <SiteFooter />
    </div>
  );
}
