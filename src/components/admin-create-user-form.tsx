"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ROLES, roleLabel, type Role } from "@/lib/roles";

export function AdminCreateUserForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          role,
          firstName,
          lastName,
          email,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        user?: { username: string; role: Role };
      };

      if (!response.ok) {
        setError(data.error ?? "Could not create user.");
        return;
      }

      setSuccess(
        `Created ${data.user?.username ?? username} (${roleLabel(data.user?.role ?? role)}).`,
      );
      setUsername("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setRole("staff");
      router.refresh();
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-user-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label className="field">
          <span>Username</span>
          <input
            name="username"
            autoComplete="off"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={2}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        <label className="field">
          <span>Role</span>
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {ROLES.map((value) => (
              <option key={value} value={value}>
                {roleLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>First name</span>
          <input
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Last name</span>
          <input
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Email (optional)</span>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {success ? <p className="form-success">{success}</p> : null}
      <button className="btn-primary" type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create user"}
      </button>
    </form>
  );
}
