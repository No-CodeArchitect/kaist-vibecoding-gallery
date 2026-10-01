// 갤러리 도메인 타입 (PRD 5절 데이터 모델의 프론트 표현)

export type ProjectStatus =
  | "pending"
  | "generating"
  | "generated"
  | "capture_failed";

export interface AiReview {
  scoreCompleteness: number; // 완성도/작동성 (1~5)
  scoreCreativity: number; // 창의성/아이디어 (1~5)
  rationale: string; // AI 심사평 (순위 미반영)
}

export interface Project {
  id: string;
  cohortId: string; // 소속 섹션(기수) — 섹션 간 분리
  title: string;
  tagline: string;
  authorId: string; // 제작자(교육생) id — 본인 작품 판정용
  authorName: string; // 제작자 실명 (카드 표기용)
  liveUrl: string;
  repoUrl?: string;
  signatureImageUrl: string | null; // null이면 플레이스홀더
  aiSummary: string;
  features: string[];
  status: ProjectStatus;
  publishedAt: string; // ISO. NEW 뱃지 기준
  aiReview: AiReview;

  // --- 로그인 사용자 관점의 파생 상태 (1단계에서는 더미 값) ---
  isNew: boolean; // 내가 아직 안 본 새 카드
  hasScored: boolean; // 내가 채점 완료
  isMine: boolean; // 내 작품 (채점 비활성)

  // --- 순위 (공개 전에는 null) ---
  rank: number | null;
  avgScore: number | null; // 교육생 평균 (순위 산정 기준)
  raterCount: number;
}
