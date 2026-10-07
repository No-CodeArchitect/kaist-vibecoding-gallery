import { redirect } from "next/navigation";

// 예전 주소(이름+코드 로그인) → 구글 로그인·가입 화면으로.
export default async function SectionLoginRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { slug } = await params;
  const next = (await searchParams).next === "submit" ? "?next=submit" : "";
  redirect(`/g/${slug}/join${next}`);
}
