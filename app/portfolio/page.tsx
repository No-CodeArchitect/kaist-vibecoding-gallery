import { redirect } from "next/navigation";

// 포트폴리오는 이제 섹션별(/g/<slug>)로 운영됩니다.
export default function PortfolioRedirect() {
  redirect("/sections");
}
