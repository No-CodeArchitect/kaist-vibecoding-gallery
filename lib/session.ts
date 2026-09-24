// 세션 관리 (서버 전용).
// 데모용: studentId를 HMAC 서명한 값을 httpOnly 쿠키에 저장.
// 이후 Supabase Auth로 교체 가능.

import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { findStudentById, type Student } from "./students";

export const SESSION_COOKIE = "vg_session";

const SECRET =
  process.env.AUTH_SECRET || "dev-insecure-secret-change-me-in-.env";

function sign(value: string): string {
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(value)
    .digest("base64url");
  return `${value}.${sig}`;
}

function verify(signed: string | undefined): string | null {
  if (!signed) return null;
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(value)
    .digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return null;
    return crypto.timingSafeEqual(a, b) ? value : null;
  } catch {
    return null;
  }
}

// 로그인 성공 시 세션 쿠키 발급.
export async function createSession(studentId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sign(studentId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7일 (교육 기간)
    secure: process.env.NODE_ENV === "production",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// 현재 로그인한 교육생 반환 (없으면 null).
export async function getSession(): Promise<Student | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const studentId = verify(raw);
  if (!studentId) return null;
  return findStudentById(studentId) ?? null;
}
