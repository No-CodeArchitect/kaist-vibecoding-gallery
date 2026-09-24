// 기수 운영 상태 (채점 진행/마감, 순위 공개).
// Supabase 활성 시 settings 테이블(단일 'default' 행), 아니면 인메모리 폴백.

import "server-only";
import { getSupabase } from "./supabase";

export interface Settings {
  scoringOpen: boolean;
  rankRevealed: boolean;
}

const DEFAULTS: Settings = { scoringOpen: true, rankRevealed: false };

const g = globalThis as unknown as { __vgSettings?: Settings };
const mem: Settings = g.__vgSettings ?? (g.__vgSettings = { ...DEFAULTS });

export async function getSettings(): Promise<Settings> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb
      .from("settings")
      .select("scoring_open,rank_revealed")
      .eq("id", "default")
      .maybeSingle();
    if (data) {
      return {
        scoringOpen: !!data.scoring_open,
        rankRevealed: !!data.rank_revealed,
      };
    }
    return { ...DEFAULTS };
  }
  return { ...mem };
}

export async function setScoringOpen(v: boolean): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    await sb.from("settings").upsert({ id: "default", scoring_open: v });
    return;
  }
  mem.scoringOpen = v;
}

export async function setRankRevealed(v: boolean): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    await sb.from("settings").upsert({ id: "default", rank_revealed: v });
    return;
  }
  mem.rankRevealed = v;
}
