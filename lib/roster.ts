// 교육생 로스터 데이터 (가드 없음 — Node 배치 스크립트에서도 import 가능).
// 앱 코드는 `server-only`로 감싼 lib/students.ts를 통해 접근한다.
// 이후 단계에서 Supabase `students` 테이블 조회로 교체한다.

export interface Student {
  id: string;
  name: string;
  accessCode: string; // 사전 배부 개인 코드 (6자리)
}

export const students: Student[] = [
  { id: "s1", name: "김도현", accessCode: "7GQ2AX" },
  { id: "s2", name: "이서준", accessCode: "4MP9KD" },
  { id: "s3", name: "박민재", accessCode: "QT1Z8B" },
  { id: "s4", name: "정우진", accessCode: "X3T6R9" },
  { id: "s5", name: "최유나", accessCode: "K9N2WY" },
  { id: "s6", name: "한지호", accessCode: "H5J7QP" },
];

// 클라이언트(로그인 드롭다운)로 넘겨도 안전한 정보만.
export function getStudentsPublic(): { id: string; name: string }[] {
  return students.map((s) => ({ id: s.id, name: s.name }));
}

export function findStudentById(id: string): Student | undefined {
  return students.find((s) => s.id === id);
}

export function findStudentByName(name: string): Student | undefined {
  const n = name.trim();
  return students.find((s) => s.name === n);
}

// 로그인 검증: id + 코드 일치 여부.
export function validateStudent(id: string, code: string): Student | null {
  const student = findStudentById(id);
  if (!student) return null;
  const input = code.trim().toUpperCase();
  if (input.length === 0) return null;
  return input === student.accessCode ? student : null;
}
