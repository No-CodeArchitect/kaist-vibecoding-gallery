"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/auth-actions";

const initialState: LoginState = { error: null };

export default function LoginForm({
  students,
  cohortId,
  slug,
}: {
  students: { id: string; name: string }[];
  cohortId: string;
  slug: string;
}) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="cohortId" value={cohortId} />
      <input type="hidden" name="slug" value={slug} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="studentId" className="text-sm font-semibold text-white">
          이름
        </label>
        <select
          id="studentId"
          name="studentId"
          defaultValue=""
          required
          className="rounded-lg border border-white/15 bg-coal-soft px-3 py-2.5 text-sm text-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
        >
          <option value="" disabled>
            명단에서 이름 선택
          </option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="code" className="text-sm font-semibold text-white">
          개인 코드
        </label>
        <input
          id="code"
          name="code"
          type="text"
          inputMode="text"
          autoComplete="off"
          placeholder="배부받은 6자리 코드"
          required
          className="rounded-lg border border-white/15 bg-coal-soft px-3 py-2.5 text-sm uppercase tracking-widest text-white outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-white/40 focus:border-gold focus:ring-2 focus:ring-gold/20"
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
        className="mt-1 rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-night transition hover:bg-gold-soft disabled:opacity-60"
      >
        {pending ? "확인 중…" : "입장하기"}
      </button>
    </form>
  );
}
