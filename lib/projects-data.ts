// 웹앱의 프로젝트 데이터 소스.
// sync 스크립트가 만든 data/projects.json 이 있으면 그것을, 없으면 더미 데이터를 반환한다.
// (이후 Supabase 조회로 교체하면 이 함수 시그니처만 유지하면 된다.)

import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Project } from "./types";
import { dummyProjects } from "./dummy-data";

const STORE_PATH = path.resolve(process.cwd(), "data/projects.json");

export function getProjects(): Project[] {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
      if (Array.isArray(data) && data.length > 0) return data as Project[];
    }
  } catch {
    // 파일 손상 등 → 더미로 폴백
  }
  return dummyProjects;
}

export function getProjectById(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id);
}

// sync 파이프라인 생성 메타 (관리자 현황용).
export function getProjectsMeta(): {
  fromPipeline: boolean;
  count: number;
  lastGeneratedAt: string | null;
} {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
      if (Array.isArray(data) && data.length > 0) {
        const times = data
          .map((p: { generatedAt?: string }) => p.generatedAt)
          .filter(Boolean) as string[];
        const last = times.sort().at(-1) ?? null;
        return { fromPipeline: true, count: data.length, lastGeneratedAt: last };
      }
    }
  } catch {
    // 무시
  }
  return { fromPipeline: false, count: dummyProjects.length, lastGeneratedAt: null };
}
