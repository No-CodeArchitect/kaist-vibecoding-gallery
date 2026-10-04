"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "./admin-session";
import { extractYoutubeId } from "./youtube";
import {
  addMedia,
  publicUrlFor,
  removeMedia,
  type MediaKind,
  type MediaSlot,
} from "./media-items";

export interface MediaResult {
  ok: boolean;
  error: string | null;
}

function refresh() {
  revalidatePath("/", "layout");
}

function validSlot(slot: string): slot is MediaSlot {
  return slot === "about" || slot === "sketch";
}

// 유튜브 링크(또는 ID) 추가
export async function addYoutubeAction(
  slot: string,
  link: string,
  title?: string
): Promise<MediaResult> {
  if (!(await isAdmin())) return { ok: false, error: "관리자 권한이 필요합니다." };
  if (!validSlot(slot)) return { ok: false, error: "잘못된 위치입니다." };

  const youtubeId = extractYoutubeId(link);
  if (!youtubeId) {
    return { ok: false, error: "유튜브 링크를 인식하지 못했습니다." };
  }
  try {
    await addMedia({
      slot,
      kind: "youtube",
      youtubeId,
      title: (title ?? "").trim() || "영상",
    });
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  refresh();
  return { ok: true, error: null };
}

// 브라우저가 Storage에 업로드를 마친 파일을 목록에 등록
export async function addUploadedAction(input: {
  slot: string;
  kind: string;
  path: string;
  title: string;
}): Promise<MediaResult> {
  if (!(await isAdmin())) return { ok: false, error: "관리자 권한이 필요합니다." };
  if (!validSlot(input.slot)) return { ok: false, error: "잘못된 위치입니다." };
  if (input.kind !== "video" && input.kind !== "image") {
    return { ok: false, error: "잘못된 파일 종류입니다." };
  }
  // 우리가 발급한 업로드 경로만 허용
  if (!/^uploads\/[\w.-]+$/.test(input.path)) {
    return { ok: false, error: "잘못된 파일 경로입니다." };
  }
  try {
    await addMedia({
      slot: input.slot,
      kind: input.kind as MediaKind,
      url: publicUrlFor(input.path),
      path: input.path,
      title: input.title.trim() || "미디어",
    });
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  refresh();
  return { ok: true, error: null };
}

export async function deleteMediaAction(id: string): Promise<MediaResult> {
  if (!(await isAdmin())) return { ok: false, error: "관리자 권한이 필요합니다." };
  try {
    await removeMedia(id);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  refresh();
  return { ok: true, error: null };
}
