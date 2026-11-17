import { localAuthProvider } from "./local-provider";
import type { AuthProvider, AuthResult, Credentials } from "./types";

/**
 * Auth facade. Swap or compose providers here when Entra/AD SSO is added —
 * role gating and employee links stay unchanged.
 */
const providers: AuthProvider[] = [localAuthProvider];

export function getAuthProviders(): AuthProvider[] {
  return providers;
}

export async function authenticateWithPassword(
  credentials: Credentials,
): Promise<AuthResult> {
  const local = providers.find((p) => p.id === "local");
  if (!local) {
    return { ok: false, error: "Local authentication is not configured." };
  }
  return local.authenticate(credentials);
}

export type { AuthProvider, AuthResult, Credentials, SessionUser } from "./types";
export {
  SESSION_COOKIE,
  clearSessionCookie,
  createSessionToken,
  getSessionUser,
  readSessionToken,
  setSessionCookie,
} from "./session";
