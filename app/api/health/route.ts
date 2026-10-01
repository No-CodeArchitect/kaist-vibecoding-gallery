import { NextResponse } from "next/server";
import { getSupabase, supabaseEnabled } from "@/lib/supabase";

// 진단용: 환경변수 "유무"(값 아님)와 Supabase 연결 상태만 보고한다.
export const dynamic = "force-dynamic";

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

  return NextResponse.json({ supabaseEnabled, env, db });
}
