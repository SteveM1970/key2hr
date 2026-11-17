import type { Role } from "@/lib/roles";

export type AuthProviderId = "local" | "entra";

export type SessionUser = {
  id: string;
  username: string;
  role: Role;
  employeeId: string | null;
  displayName: string;
  provider: AuthProviderId;
};

export type Credentials = {
  username: string;
  password: string;
};

export type AuthResult =
  | { ok: true; user: SessionUser }
  | { ok: false; error: string };

/**
 * Clean auth boundary: local username/password today; Entra/AD SSO can implement
 * the same contract without changing role gating or personnel links.
 */
export interface AuthProvider {
  readonly id: AuthProviderId;
  authenticate(credentials: Credentials): Promise<AuthResult>;
}
