// 관리자 세션 (데모용). 관리자 비밀번호는 ADMIN_PASSWORD 환경변수, 기본값 'admin1234'.

import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "vg_admin";
const SECRET =
  process.env.AUTH_SECRET || "dev-insecure-secret-change-me-in-.env";

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin1234";
}

function sign(value: string): string {
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(value)
    .digest("base64url");
  return `${value}.${sig}`;
}

function verify(signed: string | undefined): boolean {
  if (!signed) return false;
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return false;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  if (value !== "admin") return false;
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(value)
    .digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function checkAdminPassword(input: string): boolean {
  // 붙여넣기에 딸려오는 앞뒤 공백/줄바꿈은 무시한다.
  return input.trim() === adminPassword().trim();
}

export async function createAdminSession(): Promise<void> {
  const c = await cookies();
  c.set(ADMIN_COOKIE, sign("admin"), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function destroyAdminSession(): Promise<void> {
  const c = await cookies();
  c.delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return verify(c.get(ADMIN_COOKIE)?.value);
}
