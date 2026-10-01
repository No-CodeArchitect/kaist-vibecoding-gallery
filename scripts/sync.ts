// "갱신" 배치 스크립트:  npm run sync
// 구글시트(또는 샘플 CSV) → (변경분만) → 스크린샷 캡처 → Opus 4.8 요약·AI채점 → data/projects.json
//
// 키/의존성이 없어도 끝까지 동작한다:
//   - ANTHROPIC_API_KEY 없음 → 요약·채점은 목(mock)
//   - Playwright 없음        → 스크린샷 건너뜀(플레이스홀더)
//   - SHEET_CSV_URL 없음     → data/sample-projects.csv 사용

import { loadEnv } from "../lib/pipeline/env";
import { loadProjectInputs } from "../lib/pipeline/sheet";
import { curateProject, hasApiKey } from "../lib/pipeline/ai";
import { captureScreenshot } from "../lib/pipeline/capture";
import {
  readStore,
  writeStore,
  contentHash,
  type StoredProject,
} from "../lib/pipeline/store";

async function main() {
  loadEnv();

  console.log("── 갤러리 갱신(sync) 시작 ──");
  console.log(`AI: ${hasApiKey() ? "Opus 4.8 (실제 호출)" : "목(mock) — ANTHROPIC_API_KEY 미설정"}`);
  console.log(`시트: ${process.env.SHEET_CSV_URL ? "SHEET_CSV_URL" : "샘플 CSV"}\n`);

  const inputs = await loadProjectInputs();
  console.log(`대상 프로젝트 ${inputs.length}개\n`);

  const existing = readStore();
  const byId = new Map<string, StoredProject>(existing.map((r) => [r.id, r]));

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const input of inputs) {
    const id = input.authorId; // 1 교육생 : 1 프로젝트
    const hash = contentHash(input);
    const prev = byId.get(id);

    if (prev && prev.contentHash === hash && prev.status === "generated") {
      console.log(`= ${input.title} (${input.authorName}) — 변경 없음, 건너뜀`);
      skipped++;
      continue;
    }

    const isNewCard = !prev;
    console.log(
      `${isNewCard ? "+" : "~"} ${input.title} (${input.authorName}) — 생성 중…`
    );

    const shot = await captureScreenshot(id, input.liveUrl);
    const curation = await curateProject(input);

    const record: StoredProject = {
      id,
      cohortId: "c1", // 현재 기본 섹션. (섹션별 sync는 후속 작업)
      authorId: input.authorId,
      authorName: input.authorName,
      title: input.title,
      tagline: curation.tagline || input.tagline || input.title,
      liveUrl: input.liveUrl,
      repoUrl: input.repoUrl || undefined,
      signatureImageUrl: shot,
      aiSummary: curation.summary,
      features: curation.features,
      status: "generated",
      publishedAt: prev?.publishedAt ?? new Date().toISOString(),
      aiReview: {
        scoreCompleteness: curation.completeness,
        scoreCreativity: curation.creativity,
        rationale: curation.rationale,
      },
      // 뷰 파생 필드 기본값 (세션에서 재계산됨)
      isNew: true,
      hasScored: false,
      isMine: false,
      rank: null,
      avgScore: null,
      raterCount: 0,
      // 메타
      contentHash: hash,
      generatedAt: new Date().toISOString(),
    };

    byId.set(id, record);
    if (isNewCard) created++;
    else updated++;
  }

  const all = [...byId.values()];
  writeStore(all);

  console.log(
    `\n── 완료 ── 신규 ${created} · 갱신 ${updated} · 변경없음 ${skipped} · 총 ${all.length}개`
  );
  console.log("data/projects.json 에 저장됨. 웹앱을 새로고침하면 반영됩니다.");
}

main().catch((err) => {
  console.error("\n❌ sync 실패:", err);
  process.exit(1);
});
