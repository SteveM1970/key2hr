import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { ensureBootstrapped } from "@/lib/db/bootstrap";

export const runtime = "nodejs";

export default async function LoginPage() {
  await ensureBootstrapped();

  return (
    <main className="login-page">
      <div className="login-card">
        <span className="brand-mark">Key2HR</span>
        <h1>Sign in</h1>
        <p className="muted">
          Sign in with your Key2HR username and password. Auth is structured so
          Entra ID / AD SSO can be added later.
        </p>
        <Suspense fallback={<p className="muted">Loading sign-in…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
