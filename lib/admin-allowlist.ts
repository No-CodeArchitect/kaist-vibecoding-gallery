// 관리자 허용 이메일 목록.
// - 소유자: 환경변수 ADMIN_EMAILS (쉼표/공백 구분). 화면에서 삭제 불가 → 잠금 방지.
// - 추가 관리자: /admin 화면에서 이메일을 입력해 추가·삭제 (비공개 버킷에 저장).
// 도메인은 제한하지 않는다. 등록된 이메일이면 어떤 구글 계정이든 관리자가 된다.

import "server-only";
import { readPrivateJson, writePrivateJson } from "./private-store";

export interface AdminEntry {
  email: string;
  addedAt: string;
  addedBy: string;
}

const PATH = "admins.json";

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function ownerEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(/[,;\s]+/)
    .map(normalizeEmail)
    .filter(Boolean);
}

export async function listManagedAdmins(): Promise<AdminEntry[]> {
  const list = await readPrivateJson<AdminEntry[]>(PATH, []);
  return Array.isArray(list) ? list : [];
}

export async function isAllowedAdmin(email: string): Promise<boolean> {
  const e = normalizeEmail(email);
  if (!e) return false;
  if (ownerEmails().includes(e)) return true;
  return (await listManagedAdmins()).some((a) => a.email === e);
}

export async function addAdminEmail(
  rawEmail: string,
  addedBy: string
): Promise<{ ok: boolean; error: string | null }> {
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) return { ok: false, error: "이메일 형식이 올바르지 않습니다." };
  if (ownerEmails().includes(email)) return { ok: true, error: null }; // 이미 소유자
  const list = await listManagedAdmins();
  if (list.some((a) => a.email === email)) return { ok: true, error: null };
  await writePrivateJson(PATH, [
    ...list,
    { email, addedAt: new Date().toISOString(), addedBy },
  ]);
  return { ok: true, error: null };
}

export async function removeAdminEmail(rawEmail: string): Promise<void> {
  const email = normalizeEmail(rawEmail);
  const list = await listManagedAdmins();
  await writePrivateJson(
    PATH,
    list.filter((a) => a.email !== email)
  );
}
