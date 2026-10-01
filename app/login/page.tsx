import { redirect } from "next/navigation";

// 로그인은 이제 섹션별(/g/<slug>/login)로 진입합니다.
export default function LoginRedirect() {
  redirect("/sections");
}
