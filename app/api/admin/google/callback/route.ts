import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  OAUTH_COOKIE,
  exchangeAndVerify,
  originOf,
  ssoEnabled,
} from "@/lib/google-oauth";
import { isAllowedAdmin } from "@/lib/admin-allowlist";
import { createAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

// 구글에서 돌아온 뒤: state 확인 → 코드 교환·검증 → 허용 이메일인지 확인 → 세션 발급.
export async function GET(req: Request) {
  const origin = originOf(req);
  const fail = (code: string, extra = "") =>
    NextResponse.redirect(`${origin}/admin/login?error=${code}${extra}`);

  if (!ssoEnabled()) return fail("sso_off");

  const url = new URL(req.url);
  if (url.searchParams.get("error")) return fail("google"); // 사용자가 취소 등

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const c = await cookies();
  const saved = c.get(OAUTH_COOKIE)?.value ?? "";
  c.delete(OAUTH_COOKIE); // 일회용
  const [savedState, savedNonce] = saved.split(".");

  if (!code || !state || !savedState || !savedNonce || state !== savedState) {
    return fail("state");
  }

  let result;
  try {
    result = await exchangeAndVerify(origin, code, savedNonce);
  } catch {
    return fail("google");
  }
  if (!result.ok) return fail("google");

  if (!(await isAllowedAdmin(result.email))) {
    return fail("denied", `&email=${encodeURIComponent(result.email)}`);
  }

  await createAdminSession(result.email);
  return NextResponse.redirect(`${origin}/admin`);
}
