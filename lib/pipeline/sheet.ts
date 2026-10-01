// 구글 시트(또는 로컬 CSV) → 정규화된 ProjectInput 목록.
// - SHEET_CSV_URL 환경변수가 있으면 그 URL의 CSV를 fetch.
// - 없으면 data/sample-projects.csv 를 읽는다 (키 없이 파이프라인 테스트 가능).

import fs from "node:fs";
import path from "node:path";
import { csvToRecords } from "./csv";
import { findStudentByNameInCohort } from "../students-store";

// 현재 sync는 기본 섹션(c1)의 명단에 매칭한다. (섹션별 sync는 후속 작업)
const SYNC_COHORT = "c1";

export interface ProjectInput {
  authorId: string;
  authorName: string;
  title: string;
  tagline: string;
  liveUrl: string;
  repoUrl: string;
  problem: string;
  features: string; // 원본(줄바꿈/쉼표 구분 문자열)
  techStack: string;
  militaryUseCase: string;
  notes: string;
}

// PRD 권장 칼럼명 → 필드 매핑 (여러 별칭 허용)
function pick(rec: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    if (rec[k] != null && rec[k].trim() !== "") return rec[k].trim();
  }
  return "";
}

async function toInput(
  rec: Record<string, string>
): Promise<ProjectInput | null> {
  const name = pick(rec, ["이름", "제작자", "name"]);
  const student = await findStudentByNameInCohort(SYNC_COHORT, name);
  if (!student) {
    console.warn(`  ⚠️  명단에 없는 이름, 건너뜀: "${name}"`);
    return null;
  }
  const title = pick(rec, ["프로젝트명", "제목", "title"]);
  const liveUrl = pick(rec, ["배포 URL", "배포URL", "URL", "링크", "url"]);
  if (!title || !liveUrl) {
    console.warn(`  ⚠️  필수값(프로젝트명/배포URL) 누락, 건너뜀: "${name}"`);
    return null;
  }
  return {
    authorId: student.id,
    authorName: student.name,
    title,
    tagline: pick(rec, ["한 줄 소개", "한줄소개", "tagline"]),
    liveUrl,
    repoUrl: pick(rec, ["소스코드 URL", "소스 URL", "repo", "github"]),
    problem: pick(rec, ["문제 정의", "문제정의", "problem"]),
    features: pick(rec, ["주요 기능", "주요기능", "features"]),
    techStack: pick(rec, ["사용 기술", "사용기술", "tech", "stack"]),
    militaryUseCase: pick(rec, ["군 활용 시나리오", "군 활용", "military"]),
    notes: pick(rec, ["제작 후기/어려웠던 점", "제작 후기", "후기", "notes"]),
  };
}

export async function loadProjectInputs(): Promise<ProjectInput[]> {
  const url = process.env.SHEET_CSV_URL;
  let text: string;

  if (url) {
    console.log(`시트 로드: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`시트 CSV fetch 실패: ${res.status} ${res.statusText}`);
    }
    text = await res.text();
  } else {
    const local = path.resolve(process.cwd(), "data/sample-projects.csv");
    console.log(`SHEET_CSV_URL 미설정 → 샘플 CSV 사용: ${local}`);
    text = fs.readFileSync(local, "utf8");
  }

  const records = csvToRecords(text);
  const resolved = await Promise.all(records.map(toInput));
  return resolved.filter((x): x is ProjectInput => x !== null);
}
