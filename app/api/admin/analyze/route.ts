import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin-session";
import { analyzeProject } from "@/lib/analyze";

export const dynamic = "force-dynamic";
// Opus 분석(수십 초)을 한 요청에서 처리한다.
export const maxDuration = 300;

// 관리자 전용: 작품 1개 분석. body: { id }
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  const id = String(body?.id ?? "");
  if (!id) return NextResponse.json({ error: "id가 없습니다." }, { status: 400 });

  const result = await analyzeProject(id);
  revalidatePath("/", "layout");
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
