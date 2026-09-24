// 채점 저장소. Supabase 활성 시 scores 테이블, 아니면 인메모리(globalThis) 폴백.

import "server-only";
import { getSupabase } from "./supabase";

export interface Score {
  completeness: number; // 완성도/작동성 (1~5)
  creativity: number; // 창의성/아이디어 (1~5)
  updatedAt: string;
}

export interface ScoreRow {
  projectId: string;
  studentId: string;
  completeness: number;
  creativity: number;
}

// key: `${projectId}::${studentId}`
const g = globalThis as unknown as { __vgScores?: Map<string, Score> };
const mem: Map<string, Score> = g.__vgScores ?? (g.__vgScores = new Map());
const key = (p: string, s: string) => `${p}::${s}`;

export async function getScore(
  projectId: string,
  studentId: string
): Promise<Score | null> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb
      .from("scores")
      .select("completeness,creativity,updated_at")
      .eq("project_id", projectId)
      .eq("student_id", studentId)
      .maybeSingle();
    return data
      ? {
          completeness: data.completeness,
          creativity: data.creativity,
          updatedAt: data.updated_at ?? "",
        }
      : null;
  }
  return mem.get(key(projectId, studentId)) ?? null;
}

export async function setScore(
  projectId: string,
  studentId: string,
  completeness: number,
  creativity: number
): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    await sb.from("scores").upsert(
      {
        project_id: projectId,
        student_id: studentId,
        completeness,
        creativity,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "project_id,student_id" }
    );
    return;
  }
  mem.set(key(projectId, studentId), {
    completeness,
    creativity,
    updatedAt: new Date().toISOString(),
  });
}

// 순위/집계용: 전체 채점 행을 한 번에.
export async function allScoreRows(): Promise<ScoreRow[]> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb
      .from("scores")
      .select("project_id,student_id,completeness,creativity");
    return (data ?? []).map((r) => ({
      projectId: r.project_id,
      studentId: r.student_id,
      completeness: r.completeness,
      creativity: r.creativity,
    }));
  }
  const rows: ScoreRow[] = [];
  for (const [k, v] of mem.entries()) {
    const [projectId, studentId] = k.split("::");
    rows.push({
      projectId,
      studentId,
      completeness: v.completeness,
      creativity: v.creativity,
    });
  }
  return rows;
}

export async function scoredProjectIds(
  studentId: string
): Promise<Set<string>> {
  const rows = await allScoreRows();
  const ids = new Set<string>();
  for (const r of rows) if (r.studentId === studentId) ids.add(r.projectId);
  return ids;
}

export async function distinctRaterCount(): Promise<number> {
  const rows = await allScoreRows();
  return new Set(rows.map((r) => r.studentId)).size;
}

// 집계(평균/인원)를 프로젝트별 Map으로.
export function aggregateRows(
  rows: ScoreRow[]
): Map<string, { avg: number; count: number }> {
  const acc = new Map<string, { sum: number; count: number }>();
  for (const r of rows) {
    const cur = acc.get(r.projectId) ?? { sum: 0, count: 0 };
    cur.sum += (r.completeness + r.creativity) / 2;
    cur.count += 1;
    acc.set(r.projectId, cur);
  }
  const out = new Map<string, { avg: number; count: number }>();
  for (const [pid, v] of acc.entries()) {
    out.set(pid, { avg: v.sum / v.count, count: v.count });
  }
  return out;
}
