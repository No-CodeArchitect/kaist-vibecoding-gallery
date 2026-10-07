import { redirect } from "next/navigation";

// 로그인은 구글 계정으로 — 내 계정 화면에서 시작한다.
export default function LoginRedirect() {
  redirect("/me");
}
