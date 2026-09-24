// data/videos.json 에서 유튜브 영상 목록을 읽는다.
// 파일 형식: [{ "youtubeId": "abc123", "title": "교육 하이라이트" }, ...]
// 파일이 없거나 비어 있으면 빈 배열 → 페이지는 플레이스홀더를 보여준다.

import "server-only";
import fs from "node:fs";
import path from "node:path";

export interface VideoItem {
  youtubeId: string;
  title: string;
}

const CONFIG = path.join(process.cwd(), "data/videos.json");

// 유튜브 URL/ID 어느 쪽을 넣어도 ID만 뽑아낸다.
function extractId(raw: string): string | null {
  if (!raw) return null;
  const s = raw.trim();
  const patterns = [
    /[?&]v=([\w-]{11})/, // watch?v=
    /youtu\.be\/([\w-]{11})/, // youtu.be/
    /embed\/([\w-]{11})/, // embed/
    /shorts\/([\w-]{11})/, // shorts/
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  if (/^[\w-]{11}$/.test(s)) return s; // 이미 ID
  return null;
}

export function getVideos(): VideoItem[] {
  try {
    if (!fs.existsSync(CONFIG)) return [];
    const data = JSON.parse(fs.readFileSync(CONFIG, "utf8"));
    if (!Array.isArray(data)) return [];
    return data
      .map((v: { youtubeId?: string; url?: string; title?: string }) => {
        const id = extractId(v.youtubeId ?? v.url ?? "");
        return id ? { youtubeId: id, title: String(v.title ?? "영상") } : null;
      })
      .filter((v): v is VideoItem => v !== null);
  } catch {
    return [];
  }
}
