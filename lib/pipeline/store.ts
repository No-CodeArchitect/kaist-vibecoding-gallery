// 생성 결과 영속화 (데모용 로컬 JSON: data/projects.json).
// 웹앱은 lib/projects-data.ts를 통해 이 파일을 읽는다.
// 이후 단계에서 Supabase `projects` 테이블로 교체한다. (인터페이스 유지)

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { Project } from "../types";
import type { ProjectInput } from "./sheet";

export type StoredProject = Project & {
  contentHash: string;
  generatedAt: string;
};

const STORE_PATH = path.resolve(process.cwd(), "data/projects.json");

export function readStore(): StoredProject[] {
  if (!fs.existsSync(STORE_PATH)) return [];
  try {
    const text = fs.readFileSync(STORE_PATH, "utf8");
    const data = JSON.parse(text);
    return Array.isArray(data) ? (data as StoredProject[]) : [];
  } catch {
    return [];
  }
}

export function writeStore(records: StoredProject[]): void {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(records, null, 2), "utf8");
}

// 시트 원본 변경 감지용 콘텐츠 해시.
export function contentHash(input: ProjectInput): string {
  const material = JSON.stringify([
    input.title,
    input.tagline,
    input.liveUrl,
    input.repoUrl,
    input.problem,
    input.features,
    input.techStack,
    input.militaryUseCase,
    input.notes,
  ]);
  return crypto.createHash("sha1").update(material).digest("hex");
}
