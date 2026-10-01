// 교육생 명단·코드 저장소 (섹션별). Supabase + students 테이블이 있으면 그걸,
// 없거나 오류면 인메모리로 자동 폴백. 관리자가 이름을 넣으면 6자리 코드를 생성한다.

import "server-only";
import { getSupabase } from "./supabase";

export interface Student {
  id: string;
  cohortId: string;
  name: string;
  accessCode: string;
}

const SEED: Student[] = [
  { id: "s1", cohortId: "c1", name: "김도현", accessCode: "7GQ2AX" },
  { id: "s2", cohortId: "c1", name: "이서준", accessCode: "4MP9KD" },
  { id: "s3", cohortId: "c1", name: "박민재", accessCode: "QT1Z8B" },
  { id: "s4", cohortId: "c1", name: "정우진", accessCode: "X3T6R9" },
  { id: "s5", cohortId: "c1", name: "최유나", accessCode: "K9N2WY" },
  { id: "s6", cohortId: "c1", name: "한지호", accessCode: "H5J7QP" },
];

const g = globalThis as unknown as { __vgStudents?: Student[] };
const mem: Student[] =
  g.__vgStudents ?? (g.__vgStudents = SEED.map((s) => ({ ...s })));

type Row = { id: string; cohort_id: string; name: string; access_code: string };
const fromRow = (r: Row): Student => ({
  id: r.id,
  cohortId: r.cohort_id,
  name: r.name,
  accessCode: r.access_code,
});

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function randomCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++)
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}

export async function listStudents(cohortId: string): Promise<Student[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("students")
        .select("*")
        .eq("cohort_id", cohortId)
        .order("name", { ascending: true });
      if (!error && data) return (data as Row[]).map(fromRow);
    } catch {
      /* 폴백 */
    }
  }
  return mem
    .filter((s) => s.cohortId === cohortId)
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

export async function getStudentsPublic(
  cohortId: string
): Promise<{ id: string; name: string }[]> {
  return (await listStudents(cohortId)).map((s) => ({ id: s.id, name: s.name }));
}

export async function findStudentById(id: string): Promise<Student | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("students")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error) return data ? fromRow(data as Row) : null;
    } catch {
      /* 폴백 */
    }
  }
  return mem.find((s) => s.id === id) ?? null;
}

export async function findStudentByNameInCohort(
  cohortId: string,
  name: string
): Promise<Student | null> {
  const n = name.trim();
  const list = await listStudents(cohortId);
  return list.find((s) => s.name === n) ?? null;
}

export async function validateStudent(
  cohortId: string,
  studentId: string,
  code: string
): Promise<Student | null> {
  const input = code.trim().toUpperCase();
  if (!studentId || input.length === 0) return null;
  const s = await findStudentById(studentId);
  if (!s || s.cohortId !== cohortId) return null;
  return s.accessCode.toUpperCase() === input ? s : null;
}

export async function addStudents(
  cohortId: string,
  names: string[]
): Promise<Student[]> {
  const clean = names.map((n) => n.trim()).filter(Boolean);
  if (clean.length === 0) return [];
  const used = new Set((await listStudents(cohortId)).map((s) => s.accessCode));
  const created: Student[] = [];
  for (const name of clean) {
    let code = randomCode();
    while (used.has(code)) code = randomCode();
    used.add(code);
    created.push({
      id: `st_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      cohortId,
      name,
      accessCode: code,
    });
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from("students").insert(
        created.map((s) => ({
          id: s.id,
          cohort_id: s.cohortId,
          name: s.name,
          access_code: s.accessCode,
        }))
      );
      if (!error) return created;
    } catch {
      /* 폴백 */
    }
  }
  mem.push(...created);
  return created;
}

export async function removeStudent(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from("students").delete().eq("id", id);
      if (!error) return;
    } catch {
      /* 폴백 */
    }
  }
  const i = mem.findIndex((s) => s.id === id);
  if (i >= 0) mem.splice(i, 1);
}
