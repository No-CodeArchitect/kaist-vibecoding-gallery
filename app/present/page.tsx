import { redirect } from "next/navigation";

// 발표 화면은 이제 섹션별(/g/<slug>/present)로 제공됩니다.
export default function PresentRedirect() {
  redirect("/sections");
}
