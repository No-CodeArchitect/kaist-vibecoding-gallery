"use server";

import { redirect } from "next/navigation";
import { validateStudent } from "./students-store";
import { createSession, destroySession } from "./session";

export interface LoginState {
  error: string | null;
}

// 섹션(기수) 로그인. 폼에 cohortId + slug(리다이렉트용)가 함께 온다.
export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const cohortId = String(formData.get("cohortId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const studentId = String(formData.get("studentId") ?? "");
  const code = String(formData.get("code") ?? "");

  if (!cohortId) return { error: "섹션 정보가 없습니다." };
  if (!studentId) return { error: "이름을 선택해 주세요." };

  const student = await validateStudent(cohortId, studentId, code);
  if (!student) {
    return { error: "이름 또는 개인 코드가 올바르지 않습니다." };
  }

  await createSession(student.id);
  redirect(slug ? `/g/${slug}` : "/");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}
