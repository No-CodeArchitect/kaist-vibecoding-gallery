// 배포 URL 스크린샷 캡처 (로컬 Playwright).
// Playwright 미설치/브라우저 미설치/접속 실패 시 null을 반환하고 파이프라인은 계속 진행한다.
// 준비되면:  npm i -D playwright  &&  npx playwright install chromium
//
// 저장 위치: public/shots/<id>.png  → 웹에서는 /shots/<id>.png 로 참조.
// (이후 단계에서 Supabase Storage 업로드로 교체)

import fs from "node:fs";
import path from "node:path";

const SHOTS_DIR = path.resolve(process.cwd(), "public/shots");

export async function captureScreenshot(
  id: string,
  url: string
): Promise<string | null> {
  let chromium: any;
  try {
    // 간접 지정자: playwright 미설치 시에도 타입체크가 깨지지 않도록 함.
    const mod: any = await import(/* webpackIgnore: true */ "playwright" as string);
    chromium = mod.chromium;
  } catch {
    console.log("  · Playwright 미설치 → 스크린샷 건너뜀 (플레이스홀더 사용)");
    return null;
  }

  fs.mkdirSync(SHOTS_DIR, { recursive: true });
  const outPath = path.join(SHOTS_DIR, `${id}.png`);

  let browser: any = null;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });
    await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1200); // 렌더 안정화
    await page.screenshot({ path: outPath }); // 뷰포트 캡처
    console.log(`  · 스크린샷 저장: /shots/${id}.png`);
    return `/shots/${id}.png`;
  } catch (err) {
    console.warn(`  ⚠️  캡처 실패(${url}): ${(err as Error).message}`);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}
