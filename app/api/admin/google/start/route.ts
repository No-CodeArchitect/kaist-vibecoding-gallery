import crypto from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  OAUTH_COOKIE,
  buildAuthUrl,
  originOf,
  ssoEnabled,
} from "@/lib/google-oauth";

export const dynamic = "force-dynamic";

// 구글 로그인 시작: state/nonce를 만들어 짧게 쿠키에 두고 구글로 보낸다.
export async function GET(req: Request) {
  const origin = originOf(req);
  if (!ssoEnabled()) {
    return NextResponse.redirect(`${origin}/admin/login?error=sso_off`);
  }

  const state = crypto.randomBytes(16).toString("hex");
  const nonce = crypto.randomBytes(16).toString("hex");

  const c = await cookies();
  c.set(OAUTH_COOKIE, `${state}.${nonce}`, {
    httpOnly: true,
    sameSite: "lax", // 구글에서 돌아오는 최상위 GET 이동에는 쿠키가 실린다
    path: "/",
    maxAge: 60 * 10,
    secure: origin.startsWith("https://"),
  });

  return NextResponse.redirect(buildAuthUrl(origin, state, nonce));
}
