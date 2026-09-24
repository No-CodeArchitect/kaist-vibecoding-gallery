"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  checkAdminPassword,
  createAdminSession,
  destroyAdminSession,
  isAdmin,
} from "./admin-session";
import { setScoringOpen, setRankRevealed } from "./settings-store";
import { setCommentHidden } from "./comments-store";

export interface AdminLoginState {
  error: string | null;
}

export async function adminLogin(
  _prev: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const password = String(formData.get("password") ?? "");
  if (!checkAdminPassword(password)) {
    return { error: "관리자 비밀번호가 올바르지 않습니다." };
  }
  await createAdminSession();
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}

async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("관리자 권한이 필요합니다.");
}

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/present");
}

export async function toggleScoringOpen(formData: FormData): Promise<void> {
  await requireAdmin();
  await setScoringOpen(String(formData.get("value")) === "true");
  revalidateAll();
}

export async function toggleRankRevealed(formData: FormData): Promise<void> {
  await requireAdmin();
  await setRankRevealed(String(formData.get("value")) === "true");
  revalidateAll();
}

export async function moderateComment(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const hidden = String(formData.get("hidden")) === "true";
  await setCommentHidden(id, hidden);
  revalidatePath("/admin");
  revalidatePath("/");
}
