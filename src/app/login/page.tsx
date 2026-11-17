import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { ensureBootstrapped } from "@/lib/db/bootstrap";
import { DEMO_CREDENTIALS } from "@/lib/db/seed";

export const runtime = "nodejs";

export default async function LoginPage() {
  await ensureBootstrapped();

  return (
    <main className="login-page">
      <div className="login-card">
        <span className="brand-mark">Key2HR</span>
        <h1>Sign in</h1>
        <p className="muted">
          Username and password for local demo. Auth is structured so Entra ID /
          AD SSO can be added later.
        </p>
        <Suspense fallback={<p className="muted">Loading sign-in…</p>}>
          <LoginForm />
        </Suspense>
        <div className="demo-creds">
          <p>Demo users (local only):</p>
          <ul>
            {DEMO_CREDENTIALS.map((demo) => (
              <li key={demo.username}>
                <code>
                  {demo.username} / {demo.password}
                </code>{" "}
                ({demo.role})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
