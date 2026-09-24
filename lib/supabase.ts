// Supabase 서버 클라이언트 (service_role 키 사용 — 서버 전용, 절대 클라이언트 노출 금지).
// 환경변수(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)가 있으면 활성화되고,
// 없으면 supabaseEnabled=false → 각 저장소가 인메모리 폴백으로 동작한다.

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseEnabled = !!(url && serviceKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseEnabled) return null;
  if (!client) {
    client = createClient(url as string, serviceKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
