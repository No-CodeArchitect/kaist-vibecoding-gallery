// 웹앱의 프로젝트 데이터 소스 (섹션별).
// sync 스크립트가 만든 data/projects.json 이 있으면 그것을, 없으면 더미.
// projects.json / 더미는 기본 섹션(c1)에 속한다. 다른 섹션은 sync(섹션 지원)로 채워진다.
// (이후 Supabase projects 테이블 조회로 교체 가능)

import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Project } from "./types";
import { dummyProjects } from "./dummy-data";

const STORE_PATH = path.resolve(process.cwd(), "data/projects.json");
const DEFAULT_COHORT = "c1";

function loadAll(): Project[] {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
      if (Array.isArray(data) && data.length > 0) {
        // cohortId 없는 레코드는 기본 섹션으로 간주 (하위호환)
        return (data as Project[]).map((p) => ({
          ...p,
          cohortId: p.cohortId ?? DEFAULT_COHORT,
        }));
      }
    }
  } catch {
    // 손상 → 더미로 폴백
  }
  return dummyProjects;
}

// cohortId 생략 시 전체(관리 용도), 지정 시 해당 섹션만.
export function getProjects(cohortId?: string): Project[] {
  const all = loadAll();
  return cohortId ? all.filter((p) => p.cohortId === cohortId) : all;
}

export function getProjectById(id: string): Project | undefined {
  return loadAll().find((p) => p.id === id);
}

// sync 파이프라인 생성 메타 (관리자 현황용, 섹션별).
export function getProjectsMeta(cohortId?: string): {
  fromPipeline: boolean;
  count: number;
  lastGeneratedAt: string | null;
} {
  const hasFile = fs.existsSync(STORE_PATH);
  const list = getProjects(cohortId);
  const times = list
    .map((p) => (p as Project & { generatedAt?: string }).generatedAt)
    .filter(Boolean) as string[];
  const last = times.sort().at(-1) ?? null;
  return { fromPipeline: hasFile, count: list.length, lastGeneratedAt: last };
}
