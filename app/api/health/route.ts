import crypto from "crypto";
import { NextResponse } from "next/server";
import { getSupabase, supabaseEnabled } from "@/lib/supabase";

// 진단용: 환경변수 "유무"(값 아님)와 Supabase 연결 상태만 보고한다.
export const dynamic = "force-dynamic";

// TEMP(관리자 비번 진단): 값 자체는 노출하지 않고, AUTH_SECRET 키로 만든 짧은 지문만 반환.
// 원인 확인 후 제거할 것.
const fp = (v: string) =>
  crypto
    .createHmac("sha256", process.env.AUTH_SECRET || "dev")
    .update(v)
    .digest("hex")
    .slice(0, 10);

export async function GET() {
  const env = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
  };

  let db = "disabled (env 없음 → 인메모리)";
  const sb = getSupabase();
  if (sb) {
    try {
      const r = await sb.from("scores").select("project_id").limit(1);
      db = r.error ? `error: ${r.error.message}` : "ok (Supabase 연결됨)";
    } catch (e) {
      db = `exception: ${(e as Error).message}`;
    }
  }

  const pw = process.env.ADMIN_PASSWORD ?? "";
  const adminPw = {
    isDefault: !pw || pw === "admin1234",
    edgeWhitespace: pw !== pw.trim(),
    quoted: /^["'`].*["'`]$/.test(pw.trim()),
    fp: fp(pw),
  };

  return NextResponse.json({ supabaseEnabled, env, db, adminPw, secretFp: fp("probe") });
}
