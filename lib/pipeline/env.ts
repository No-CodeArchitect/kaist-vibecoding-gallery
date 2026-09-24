// 아주 단순한 .env 로더 (의존성 없음).
// 배치 스크립트 시작 시 호출해 프로젝트 루트의 .env를 process.env로 로드한다.

import fs from "node:fs";
import path from "node:path";

export function loadEnv(file = ".env"): void {
  const full = path.resolve(process.cwd(), file);
  if (!fs.existsSync(full)) return;
  const text = fs.readFileSync(full, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    // 양쪽 따옴표 제거
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
