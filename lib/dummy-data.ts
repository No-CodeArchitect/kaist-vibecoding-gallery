import type { Project } from "./types";

// 1단계 더미 데이터.
// 이후 단계에서 Supabase 조회로 교체된다 (sync 스크립트가 채운 projects 테이블).

export const COHORT_NAME = "AI 보수교육 1차";

// 채점/순위 상태는 lib/settings-store.ts 에서 관리한다 (관리자 토글).

export const dummyProjects: Project[] = [
  {
    id: "p1",
    title: "부대 당직근무 자동 편성기",
    tagline: "엑셀 지옥 탈출, 클릭 한 번으로 공평한 당직표",
    authorId: "s1",
    authorName: "김도현",
    liveUrl: "https://example.com",
    signatureImageUrl: null,
    aiSummary:
      "당직 인원의 가용일·연속근무 제약을 입력하면 규칙 기반으로 한 달 당직표를 자동 생성한다. 수기 편성의 반복 노동과 형평성 시비를 줄이는 데 초점을 맞췄다.",
    features: ["제약 조건 입력", "자동 편성", "형평성 통계", "엑셀 내보내기"],
    status: "generated",
    publishedAt: "2026-09-13T14:00:00+09:00",
    aiReview: {
      scoreCompleteness: 4,
      scoreCreativity: 4,
      rationale:
        "실무 페인포인트가 명확하고 결과물이 즉시 쓸모 있다. 예외 규칙 처리를 더 다듬으면 완성도가 오른다.",
    },
    isNew: true,
    hasScored: false,
    isMine: false,
    rank: null,
    avgScore: null,
    raterCount: 0,
  },
  {
    id: "p2",
    title: "군수품 재고 스캔 도우미",
    tagline: "바코드 찍으면 끝나는 재물조사",
    authorId: "s2",
    authorName: "이서준",
    liveUrl: "https://example.com",
    signatureImageUrl: null,
    aiSummary:
      "휴대폰 카메라로 바코드를 스캔해 재고를 실시간으로 대조한다. 수불부와 실물의 차이를 즉시 표시해 재물조사 시간을 크게 단축한다.",
    features: ["바코드 스캔", "실시간 대조", "차이 리포트", "CSV 동기화"],
    status: "generated",
    publishedAt: "2026-09-13T13:30:00+09:00",
    aiReview: {
      scoreCompleteness: 5,
      scoreCreativity: 3,
      rationale:
        "완성도가 높고 흐름이 매끄럽다. 아이디어 자체는 익숙한 편이라 차별화 포인트를 더 살리면 좋겠다.",
    },
    isNew: true,
    hasScored: false,
    isMine: false,
    rank: null,
    avgScore: null,
    raterCount: 0,
  },
  {
    id: "p3",
    title: "정신전력 교육 퀴즈봇",
    tagline: "지루한 정훈 시간을 게임처럼",
    authorId: "s3",
    authorName: "박민재",
    liveUrl: "https://example.com",
    signatureImageUrl: null,
    aiSummary:
      "정신전력 교육 내용을 실시간 퀴즈로 진행하는 웹앱. 인원이 각자 폰으로 접속해 정답률과 순위가 즉시 반영된다.",
    features: ["실시간 참여", "정답률 통계", "팀 대항전", "문제 은행"],
    status: "generated",
    publishedAt: "2026-09-13T11:00:00+09:00",
    aiReview: {
      scoreCompleteness: 3,
      scoreCreativity: 5,
      rationale:
        "교육을 참여형으로 바꾸는 발상이 신선하다. 동시 접속 안정성만 보강하면 현장 활용도가 높다.",
    },
    isNew: false,
    hasScored: true,
    isMine: false,
    rank: null,
    avgScore: null,
    raterCount: 0,
  },
  {
    id: "p4",
    title: "체력검정 기록 관리 대시보드",
    tagline: "3km, 팔굽혀펴기, 윗몸일으키기 한눈에",
    authorId: "s4",
    authorName: "정우진",
    liveUrl: "https://example.com",
    signatureImageUrl: null,
    aiSummary:
      "개인·부대별 체력검정 기록을 입력하고 등급 변화를 추적하는 대시보드. 취약 종목을 자동으로 짚어준다.",
    features: ["기록 입력", "등급 자동 산정", "추세 그래프", "취약 종목 알림"],
    status: "generated",
    publishedAt: "2026-09-13T10:15:00+09:00",
    aiReview: {
      scoreCompleteness: 4,
      scoreCreativity: 3,
      rationale:
        "데이터 시각화가 깔끔하고 실용적이다. 부대 단위 비교 기능을 넣으면 활용 폭이 넓어진다.",
    },
    isNew: false,
    hasScored: true,
    isMine: false,
    rank: null,
    avgScore: null,
    raterCount: 0,
  },
  {
    id: "p5",
    title: "간부 일일결산 요약 AI",
    tagline: "긴 상황보고를 세 줄로",
    authorId: "s5",
    authorName: "최유나",
    liveUrl: "https://example.com",
    signatureImageUrl: null,
    aiSummary:
      "일일 상황보고 텍스트를 붙여넣으면 핵심만 세 줄로 요약하고 조치 필요 항목을 분류한다.",
    features: ["자동 요약", "조치 항목 분류", "우선순위 태그", "복사 편의"],
    status: "generated",
    publishedAt: "2026-09-13T09:40:00+09:00",
    aiReview: {
      scoreCompleteness: 3,
      scoreCreativity: 4,
      rationale:
        "업무 부담을 실제로 덜어주는 방향이 좋다. 보안 고려(민감정보 처리) 안내가 추가되면 신뢰도가 오른다.",
    },
    isNew: false,
    hasScored: false,
    isMine: false, // 세션 기준으로 페이지에서 계산됨
    rank: null,
    avgScore: null,
    raterCount: 0,
  },
  {
    id: "p6",
    title: "외출·외박 신청 간소화 폼",
    tagline: "종이 없이, 승인까지 한 흐름에",
    authorId: "s6",
    authorName: "한지호",
    liveUrl: "https://example.com",
    signatureImageUrl: null,
    aiSummary:
      "외출·외박 신청을 온라인 폼으로 받아 지휘계통 승인 상태를 단계별로 보여준다. 반려 사유도 함께 기록된다.",
    features: ["온라인 신청", "단계별 승인", "상태 알림", "이력 조회"],
    status: "capture_failed", // 스크린샷 실패 예시 → 플레이스홀더
    publishedAt: "2026-09-13T15:10:00+09:00",
    aiReview: {
      scoreCompleteness: 4,
      scoreCreativity: 3,
      rationale:
        "행정 절차를 매끄럽게 디지털화했다. 모바일 화면 최적화를 조금 더 손보면 좋겠다.",
    },
    isNew: true,
    hasScored: false,
    isMine: false,
    rank: null,
    avgScore: null,
    raterCount: 0,
  },
];
