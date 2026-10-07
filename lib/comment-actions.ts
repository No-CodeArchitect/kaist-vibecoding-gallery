"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "./session";
import { addComment } from "./comments-store";
import { generateNickname } from "./pipeline/ai";
import { getProjectById } from "./projects-data";

export interface CommentState {
  ok: boolean;
  error: string | null;
}

const MAX_LEN = 500;

export async function postComment(
  _prevState: CommentState,
  formData: FormData
): Promise<CommentState> {
  const student = await getSession();
  if (!student) {
    return { ok: false, error: "로그인이 필요합니다." };
  }

  const projectId = String(formData.get("projectId") ?? "");
  const project = await getProjectById(projectId);
  if (!project) {
    return { ok: false, error: "프로젝트를 찾을 수 없습니다." };
  }

  // 다른 섹션 프로젝트엔 댓글 불가 (섹션 간 분리)
  if (project.cohortId !== student.cohortId) {
    return { ok: false, error: "이 섹션의 교육생만 댓글을 남길 수 있습니다." };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (body.length === 0) {
    return { ok: false, error: "댓글 내용을 입력해 주세요." };
  }
  if (body.length > MAX_LEN) {
    return { ok: false, error: `댓글은 ${MAX_LEN}자 이내로 작성해 주세요.` };
  }

  const isAuthorReply = project.authorId === student.id;
  // 위트 닉네임 생성: ANTHROPIC_API_KEY 있으면 Opus 4.8, 없으면 규칙 기반 목.
  const aiNickname = await generateNickname(body, student.id + project.id);

  await addComment({
    projectId,
    authorId: student.id,
    authorName: student.name,
    aiNickname,
    body,
    isAuthorReply,
  });

  revalidatePath(`/project/${projectId}`);
  return { ok: true, error: null };
}
