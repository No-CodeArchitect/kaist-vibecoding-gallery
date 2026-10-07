"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { destroyMemberSession, getMember } from "./member-session";
import { getCohortById } from "./cohorts-store";
import { requestMembership } from "./memberships-store";
import { safeNext } from "./google-oauth";

export interface JoinState {
  ok: boolean;
  error: string | null;
  values?: { realName: string; nickname: string };
}

const NICK_RE = /^[0-9A-Za-z가-힣_.\- ]+$/;

// 섹션 가입 신청 (구글 로그인 후). 관리자가 수락하면 채점·댓글·작품 등록이 가능해진다.
export async function joinSectionAction(_prev: JoinState, formData: FormData): Promise<JoinState> {
  const member = await getMember();
  if (!member) return { ok: false, error: "먼저 구글 계정으로 로그인해 주세요." };

  const cohortId = String(formData.get("cohortId") ?? "");
  const realName = String(formData.get("realName") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim().replace(/\s+/g, " ");
  const values = { realName, nickname };

  const cohort = await getCohortById(cohortId);
  if (!cohort) return { ok: false, error: "섹션을 찾을 수 없습니다.", values };
  if (realName.length < 2 || realName.length > 20) {
    return { ok: false, error: "실명을 2~20자로 입력해 주세요.", values };
  }
  if (nickname.length < 2 || nickname.length > 12 || !NICK_RE.test(nickname)) {
    return { ok: false, error: "닉네임은 2~12자, 한글·영문·숫자와 _ . - 만 쓸 수 있습니다.", values };
  }

  try {
    const res = await requestMembership({
      cohortId,
      googleSub: member.sub,
      email: member.email,
      googleName: member.name,
      realName,
      nickname,
    });
    if (!res.ok) return { ok: false, error: res.error, values };
  } catch (err) {
    console.error("[join]", (err as Error).message);
    return { ok: false, error: "일시적인 오류로 신청하지 못했습니다. 잠시 후 다시 시도해 주세요.", values };
  }

  revalidatePath(`/g/${cohort.slug}/join`);
  revalidatePath("/admin");
  return { ok: true, error: null, values };
}

// 로그아웃 (구글 계정 세션 종료). next로 돌아갈 곳을 지정할 수 있다.
export async function logout(formData?: FormData): Promise<void> {
  await destroyMemberSession();
  redirect(safeNext(formData ? String(formData.get("next") ?? "") : "", "/"));
}
