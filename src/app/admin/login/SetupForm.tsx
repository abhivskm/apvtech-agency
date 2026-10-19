"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { setupFirstAdmin, type SetupState } from "./setup-actions";

export function SetupForm() {
  const [state, action, pending] = useActionState<SetupState, FormData>(setupFirstAdmin, undefined);
  const invalid = (f: string) => (state?.field === f ? true : undefined);
  return (
    <form action={action} className="mt-6 space-y-4">
      <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
        First-time setup: create the first Super Admin. This form disappears once an administrator exists.
      </p>
      <div>
        <label htmlFor="token" className="a-label">
          Setup code
        </label>
        <input id="token" name="token" type="password" autoComplete="off" required className="a-input" aria-invalid={invalid("token")} />
        <p className="a-help">The SETUP_TOKEN value from your hosting environment variables.</p>
      </div>
      <div>
        <label htmlFor="name" className="a-label">
          Your name
        </label>
        <input id="name" name="name" autoComplete="name" required className="a-input" aria-invalid={invalid("name")} />
      </div>
      <div>
        <label htmlFor="email" className="a-label">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="a-input" aria-invalid={invalid("email")} />
      </div>
      <div>
        <label htmlFor="password" className="a-label">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="new-password" required className="a-input" aria-invalid={invalid("password")} />
        <p className="a-help">At least 12 characters using three of: lowercase, uppercase, numbers, symbols.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="a-label">
          Confirm password
        </label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="a-input" aria-invalid={invalid("confirm")} />
      </div>
      <div aria-live="polite">{state?.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}</div>
      <button type="submit" disabled={pending} className="a-btn a-btn-primary w-full">
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Create admin account
      </button>
    </form>
  );
}
