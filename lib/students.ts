// 앱(서버) 전용 로스터 접근 지점. `server-only` 가드로 클라이언트 번들 유입을 막는다.
// 실제 데이터/헬퍼는 lib/roster.ts에 있으며, 배치 스크립트는 roster.ts를 직접 사용한다.

import "server-only";

export type { Student } from "./roster";
export {
  students,
  getStudentsPublic,
  findStudentById,
  findStudentByName,
  validateStudent,
} from "./roster";
