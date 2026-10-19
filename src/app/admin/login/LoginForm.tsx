"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { login, type LoginState } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);
  return (
    <form action={action} className="mt-6 space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label htmlFor="email" className="a-label">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="a-input" />
      </div>
      <div>
        <label htmlFor="password" className="a-label">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="a-input" />
      </div>
      <div aria-live="polite">{state?.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}</div>
      <button type="submit" disabled={pending} className="a-btn a-btn-primary w-full">
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Sign in
      </button>
    </form>
  );
}
