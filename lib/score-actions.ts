"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "./session";
import { setScore } from "./scores-store";
import { getSettings } from "./settings-store";
import { getProjectById } from "./projects-data";

export interface ScoreState {
  ok: boolean;
  error: string | null;
}

function parseStar(value: FormDataEntryValue | null): number | null {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 5) return null;
  return n;
}

export async function submitScore(
  _prevState: ScoreState,
  formData: FormData
): Promise<ScoreState> {
  const student = await getSession();
  if (!student) {
    return { ok: false, error: "로그인이 필요합니다." };
  }

  if (!(await getSettings()).scoringOpen) {
    return { ok: false, error: "채점이 마감되었습니다." };
  }

  const projectId = String(formData.get("projectId") ?? "");
  const project = getProjectById(projectId);
  if (!project) {
    return { ok: false, error: "프로젝트를 찾을 수 없습니다." };
  }

  // 본인 프로젝트 채점 차단 (서버측 검증).
  if (project.authorId === student.id) {
    return { ok: false, error: "본인 프로젝트는 채점할 수 없습니다." };
  }

  const completeness = parseStar(formData.get("completeness"));
  const creativity = parseStar(formData.get("creativity"));
  if (completeness === null || creativity === null) {
    return { ok: false, error: "두 항목 모두 1~5점으로 선택해 주세요." };
  }

  await setScore(projectId, student.id, completeness, creativity);
  revalidatePath("/");
  revalidatePath(`/project/${projectId}`);
  return { ok: true, error: null };
}
