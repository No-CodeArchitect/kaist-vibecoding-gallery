// 관리자 세션.
// - 구글 SSO가 설정돼 있으면(GOOGLE_CLIENT_ID/SECRET): 구글 로그인만 허용. 비밀번호 로그인은 꺼진다.
// - 설정 전: 임시로 비밀번호(ADMIN_PASSWORD, 기본 'admin1234')로 로그인. (잠금 방지용 전환 단계)
// 세션 쿠키에는 "누가" 로그인했는지(이메일)가 서명되어 들어간다.

import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { isAllowedAdmin } from "./admin-allowlist";
import { ssoEnabled } from "./google-oauth";

const ADMIN_COOKIE = "vg_admin";
const PASSWORD_IDENTITY = "password"; // 비밀번호 로그인 세션의 식별자
const SECRET =
  process.env.AUTH_SECRET || "dev-insecure-secret-change-me-in-.env";

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin1234";
}

function mac(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
}

function sign(value: string): string {
  return `${value}.${mac(value)}`;
}

// 서명이 맞으면 값을, 아니면 null.
function verify(signed: string | undefined): string | null {
  if (!signed) return null;
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(mac(value));
    return a.length === b.length && crypto.timingSafeEqual(a, b) ? value : null;
  } catch {
    return null;
  }
}

// SSO가 켜져 있으면 비밀번호 로그인은 항상 거부한다.
export function checkAdminPassword(input: string): boolean {
  if (ssoEnabled()) return false;
  // 붙여넣기에 딸려오는 앞뒤 공백/줄바꿈은 무시한다.
  return input.trim() === adminPassword().trim();
}

// identity: 구글 로그인이면 이메일, 비밀번호 로그인이면 "password"
export async function createAdminSession(identity: string): Promise<void> {
  const c = await cookies();
  const value = `admin:${Buffer.from(identity).toString("base64url")}`;
  c.set(ADMIN_COOKIE, sign(value), {
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

// 쿠키에 서명된 로그인 식별자(이메일 또는 "password"). 권한 검증은 isAdmin()에서.
async function readIdentity(): Promise<string | null> {
  const c = await cookies();
  const value = verify(c.get(ADMIN_COOKIE)?.value);
  if (!value || !value.startsWith("admin:")) return null;
  try {
    return Buffer.from(value.slice("admin:".length), "base64url").toString("utf8");
  } catch {
    return null;
  }
}

// 현재 로그인한 관리자의 이메일 (비밀번호 세션이면 null).
export async function getAdminEmail(): Promise<string | null> {
  const who = await readIdentity();
  return who && who !== PASSWORD_IDENTITY ? who : null;
}

// 매 요청마다 허용 목록을 다시 확인한다 → 관리자를 삭제하면 즉시 접근이 끊긴다.
export async function isAdmin(): Promise<boolean> {
  const who = await readIdentity();
  if (!who) return false;
  if (ssoEnabled()) {
    if (who === PASSWORD_IDENTITY) return false; // SSO 전환 후 옛 비밀번호 세션 무효
    return isAllowedAdmin(who);
  }
  return true; // SSO 설정 전: 임시 비밀번호 세션 허용
}
