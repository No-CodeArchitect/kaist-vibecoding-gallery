// Claude(Opus 4.8) 호출 래퍼. ANTHROPIC_API_KEY가 없으면 규칙 기반 목(mock)으로 폴백한다.
// 요약·특징·AI채점을 한 번의 호출로 생성하고, 댓글 닉네임도 여기서 생성한다.

import Anthropic from "@anthropic-ai/sdk";
import type { ProjectInput } from "./sheet";
import { generateNickname as mockNickname } from "../nickname";

const MODEL = "claude-opus-4-8";

export interface Curation {
  summary: string;
  features: string[];
  highlights: string;
  tagline: string;
  completeness: number; // 1~5
  creativity: number; // 1~5
  rationale: string;
}

export function hasApiKey(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

function clamp(n: unknown, def: number): number {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return def;
  return Math.min(5, Math.max(1, v));
}

// 응답 텍스트에서 첫 JSON 객체를 추출.
function extractJson(text: string): any | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function splitFeatures(raw: string): string[] {
  return raw
    .split(/[\n,·•]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
}

// ---- 목(mock) 구현: 키 없이도 파이프라인이 끝까지 돌게 한다 ----
function mockCuration(p: ProjectInput): Curation {
  const feats = splitFeatures(p.features);
  const seed = (p.authorId + p.title).length;
  return {
    summary:
      p.problem ||
      `${p.title}은(는) ${p.tagline || "실무 문제를 해결하는"} 프로젝트입니다.`,
    features: feats.length ? feats : ["핵심 기능", "간편한 사용", "빠른 처리"],
    highlights: p.techStack
      ? `사용 기술: ${p.techStack}`
      : "바이브코딩으로 빠르게 구현한 프로토타입.",
    tagline: p.tagline || `${p.title}`,
    completeness: 3 + (seed % 3), // 3~5
    creativity: 3 + ((seed >> 1) % 3),
    rationale:
      "[목 심사평] 실무 활용도가 보이는 프로젝트입니다. (API 키 설정 시 Opus 4.8이 실제 심사평을 생성합니다.)",
  };
}

export async function curateProject(p: ProjectInput): Promise<Curation> {
  if (!hasApiKey()) return mockCuration(p);

  const prompt = `당신은 군 특화 AI 보수교육의 심사위원입니다. 아래 교육생 프로젝트 정보를 읽고, 갤러리 설명 페이지용 요약과 심사 점수를 생성하세요.

[프로젝트 정보]
- 프로젝트명: ${p.title}
- 한 줄 소개: ${p.tagline}
- 문제 정의: ${p.problem}
- 주요 기능: ${p.features}
- 사용 기술: ${p.techStack}
- 군 활용 시나리오: ${p.militaryUseCase}
- 제작 후기: ${p.notes}

다음 JSON 형식으로만 응답하세요(설명 문장 없이 JSON만):
{
  "summary": "2~3문장 요약(한국어)",
  "features": ["핵심 특징 3~5개", "..."],
  "highlights": "기술적 하이라이트 1문장",
  "tagline": "60자 이내 캐치프레이즈",
  "completeness": 1-5 정수(완성도/작동성),
  "creativity": 1-5 정수(창의성/아이디어),
  "rationale": "심사평 1~2문장(순위 미반영)"
}`;

  try {
    const res = await getClient().messages.create({
      model: MODEL,
      max_tokens: 2000,
      output_config: { effort: "high" },
      messages: [{ role: "user", content: prompt }],
    });
    const textBlock = res.content.find((b) => b.type === "text");
    const text = textBlock && "text" in textBlock ? textBlock.text : "";
    const json = extractJson(text);
    if (!json) throw new Error("JSON 파싱 실패");

    return {
      summary: String(json.summary ?? "").trim() || mockCuration(p).summary,
      features: Array.isArray(json.features)
        ? json.features.map((f: unknown) => String(f).trim()).filter(Boolean).slice(0, 5)
        : splitFeatures(p.features),
      highlights: String(json.highlights ?? "").trim(),
      tagline: String(json.tagline ?? p.tagline ?? "").trim().slice(0, 60),
      completeness: clamp(json.completeness, 3),
      creativity: clamp(json.creativity, 3),
      rationale: String(json.rationale ?? "").trim(),
    };
  } catch (err) {
    console.warn(
      `  ⚠️  Claude 호출 실패, 목 사용: ${(err as Error).message}`
    );
    return mockCuration(p);
  }
}

// 댓글 위트 닉네임: 키 있으면 Opus 4.8, 없으면 규칙 기반 목.
export async function generateNickname(
  body: string,
  seed: string
): Promise<string> {
  if (!hasApiKey()) return mockNickname(body, seed);

  const prompt = `아래 댓글의 맥락(칭찬/비평/질문/유머 등)에 어울리는, 군 색채가 살짝 담긴 재치있는 한국어 닉네임을 하나만 지어주세요. 2~6자 형용사 + 역할 형태가 좋습니다. 설명 없이 닉네임만 한 줄로 출력하세요.

댓글: "${body}"`;
  try {
    const res = await getClient().messages.create({
      model: MODEL,
      max_tokens: 100,
      messages: [{ role: "user", content: prompt }],
    });
    const textBlock = res.content.find((b) => b.type === "text");
    let text = textBlock && "text" in textBlock ? textBlock.text : "";
    text = text.trim().replace(/^["'`]|["'`]$/g, "").split("\n")[0].trim();
    return text || mockNickname(body, seed);
  } catch {
    return mockNickname(body, seed);
  }
}
