// 구글 id_token 클레임 검증 (순수 함수 — 서버 의존성 없음, 단독 테스트 가능).
//
// 참고: id_token은 코드 교환(back-channel, TLS)으로 구글 토큰 엔드포인트에서 직접 받은 것만
// 사용하므로 OIDC 규격상 서명 검증은 생략할 수 있다. 대신 발급자·대상·만료·nonce·이메일 검증을 확인한다.

export interface GoogleClaims {
  iss?: string;
  sub?: string; // 구글 계정 고유 ID (이메일이 바뀌어도 그대로)
  aud?: string;
  exp?: number;
  nonce?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
}

export type ClaimsResult =
  | { ok: true; sub: string; email: string; name: string }
  | { ok: false; reason: string };

export function decodeJwtPayload(idToken: string): GoogleClaims | null {
  const parts = idToken.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function validateClaims(
  claims: GoogleClaims | null,
  opts: { clientId: string; nonce: string; nowSec?: number }
): ClaimsResult {
  if (!claims) return { ok: false, reason: "id_token 해석 실패" };
  const now = opts.nowSec ?? Math.floor(Date.now() / 1000);

  if (
    claims.iss !== "https://accounts.google.com" &&
    claims.iss !== "accounts.google.com"
  ) {
    return { ok: false, reason: "발급자 불일치" };
  }
  if (claims.aud !== opts.clientId) return { ok: false, reason: "대상(aud) 불일치" };
  if (!claims.exp || claims.exp < now) return { ok: false, reason: "토큰 만료" };
  if (!claims.nonce || claims.nonce !== opts.nonce) {
    return { ok: false, reason: "nonce 불일치" };
  }
  if (!claims.sub) return { ok: false, reason: "계정 ID 없음" };
  if (!claims.email) return { ok: false, reason: "이메일 없음" };
  // 구글은 boolean true 또는 문자열 "true"로 줄 수 있다.
  if (claims.email_verified !== true && claims.email_verified !== "true") {
    return { ok: false, reason: "이메일 미인증 계정" };
  }
  return {
    ok: true,
    sub: claims.sub,
    email: claims.email.trim().toLowerCase(),
    name: claims.name ?? "",
  };
}
