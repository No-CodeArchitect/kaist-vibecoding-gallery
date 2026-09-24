// public/ 아래 파일이 실제로 있는지 확인해 URL(있으면)/null(없으면)을 돌려준다.
// → 지정된 이름으로 파일만 넣으면 코드 수정 없이 자동 반영된다.

import "server-only";
import fs from "node:fs";
import path from "node:path";

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

function toUrl(relPath: string): string {
  return "/" + relPath.replace(/^\/+/, "");
}

// relPath 예: "media/hero/hero-1.jpg"
export function publicFile(relPath: string): string | null {
  try {
    const full = path.join(process.cwd(), "public", relPath);
    return fs.existsSync(full) ? toUrl(relPath) : null;
  } catch {
    return null;
  }
}

// 확장자 없는 기본경로(예: "media/hero/hero-1")에 대해 지원 확장자를 순회.
export function findImage(relPathNoExt: string): string | null {
  for (const ext of IMAGE_EXTS) {
    const url = publicFile(relPathNoExt + ext);
    if (url) return url;
  }
  return null;
}

// 여러 후보 중 처음 존재하는 것.
export function firstImage(relPathsNoExt: string[]): string | null {
  for (const p of relPathsNoExt) {
    const url = findImage(p);
    if (url) return url;
  }
  return null;
}

// 특정 폴더(public/media/<dir>)의 이미지 파일들을 이름순으로 나열해 URL 배열로.
export function listImages(relDir: string): string[] {
  try {
    const full = path.join(process.cwd(), "public", relDir);
    if (!fs.existsSync(full)) return [];
    return fs
      .readdirSync(full)
      .filter((f) => IMAGE_EXTS.includes(path.extname(f).toLowerCase()))
      .sort()
      .map((f) => toUrl(path.posix.join(relDir, f)));
  } catch {
    return [];
  }
}
