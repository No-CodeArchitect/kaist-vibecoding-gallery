"use client";

import { useActionState } from "react";
import { adminLogin, type AdminLoginState } from "@/lib/admin-actions";

const initialState: AdminLoginState = { error: null };

export default function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(
    adminLogin,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-white">
          관리자 비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="off"
          required
          className="rounded-lg border border-white/15 bg-coal-soft px-3 py-2.5 text-sm text-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
        />
      </div>
      {state.error && (
        <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-night transition hover:bg-gold-soft disabled:opacity-60"
      >
        {pending ? "확인 중…" : "관리자 로그인"}
      </button>
    </form>
  );
}
