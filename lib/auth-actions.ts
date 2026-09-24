"use server";

import { redirect } from "next/navigation";
import { validateStudent } from "./students";
import { createSession, destroySession } from "./session";

export interface LoginState {
  error: string | null;
}

// 로그인 서버 액션 (useActionState와 함께 사용).
export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const studentId = String(formData.get("studentId") ?? "");
  const code = String(formData.get("code") ?? "");

  if (!studentId) {
    return { error: "이름을 선택해 주세요." };
  }
  const student = validateStudent(studentId, code);
  if (!student) {
    return { error: "이름 또는 개인 코드가 올바르지 않습니다." };
  }

  await createSession(student.id);
  redirect("/portfolio");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
