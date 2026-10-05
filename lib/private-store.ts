// 비공개 JSON 저장소. Supabase Storage의 "비공개" 버킷(site-private)에 저장한다.
// (공개 버킷 media와 분리: 관리자 이메일처럼 외부에 노출되면 안 되는 데이터용)
// Supabase 미설정이면 인메모리 폴백.

import "server-only";
import { getSupabase } from "./supabase";

const BUCKET = "site-private";

const g = globalThis as unknown as { __vgPrivate?: Record<string, string> };
const mem: Record<string, string> = g.__vgPrivate ?? (g.__vgPrivate = {});

async function ensureBucket(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.storage.createBucket(BUCKET, { public: false });
  if (error && !/already exists|duplicate/i.test(error.message)) {
    console.warn("[private-store] createBucket:", error.message);
  }
}

export async function readPrivateJson<T>(path: string, fallback: T): Promise<T> {
  const sb = getSupabase();
  if (!sb) {
    return path in mem ? (JSON.parse(mem[path]) as T) : fallback;
  }
  try {
    const { data, error } = await sb.storage.from(BUCKET).download(path);
    if (error || !data) return fallback;
    return JSON.parse(await data.text()) as T;
  } catch {
    return fallback;
  }
}

export async function writePrivateJson(path: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value, null, 2);
  const sb = getSupabase();
  if (!sb) {
    mem[path] = json;
    return;
  }
  await ensureBucket();
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, new Blob([json], { type: "application/json" }), {
      upsert: true,
      contentType: "application/json",
      cacheControl: "0",
    });
  if (error) throw new Error(`저장 실패: ${error.message}`);
}
