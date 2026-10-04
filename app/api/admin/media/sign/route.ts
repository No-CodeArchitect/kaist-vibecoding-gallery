import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-session";
import { getSupabase } from "@/lib/supabase";
import {
  BUCKET,
  MAX_FILE_BYTES,
  ensureBucket,
  publicUrlFor,
  type MediaKind,
} from "@/lib/media-items";

export const dynamic = "force-dynamic";

// 허용 형식 (확장자 → 종류)
const ALLOWED: Record<string, MediaKind> = {
  mp4: "video",
  webm: "video",
  mov: "video",
  jpg: "image",
  jpeg: "image",
  png: "image",
  webp: "image",
  gif: "image",
};

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// 관리자 전용: 브라우저가 Storage로 직접 올릴 서명 URL을 발급한다.
// (Vercel 요청 본문 한도(4.5MB)를 피하기 위해 파일은 서버를 거치지 않는다.)
export async function POST(req: Request) {
  if (!(await isAdmin())) return bad("관리자 권한이 필요합니다.", 401);

  const sb = getSupabase();
  if (!sb) return bad("Supabase가 설정되지 않아 파일 업로드를 쓸 수 없습니다.");

  let body: { name?: string; size?: number };
  try {
    body = await req.json();
  } catch {
    return bad("잘못된 요청입니다.");
  }

  const ext = (body.name ?? "").split(".").pop()?.toLowerCase() ?? "";
  const kind = ALLOWED[ext];
  if (!kind) {
    return bad(
      "지원하지 않는 형식입니다. (영상: mp4·webm·mov / 이미지: jpg·png·webp·gif)"
    );
  }
  if (!body.size || body.size > MAX_FILE_BYTES) {
    return bad(
      "파일이 50MB를 넘습니다. 큰 영상은 유튜브에 올려 링크로 추가해 주세요."
    );
  }

  await ensureBucket();
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { data, error } = await sb.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) {
    return bad(`업로드 URL 발급 실패: ${error?.message ?? "알 수 없음"}`, 500);
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    path,
    kind,
    publicUrl: publicUrlFor(path),
  });
}
