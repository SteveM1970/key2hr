import type { SessionUser } from "@/lib/auth";
import { roleLabel } from "@/lib/roles";

type RoleHomeProps = {
  user: SessionUser;
  headline: string;
  summary: string;
  bullets: string[];
};

export function RoleHome({ user, headline, summary, bullets }: RoleHomeProps) {
  return (
    <section className="panel home-panel">
      <p className="eyebrow">{roleLabel(user.role)} workspace</p>
      <h1>{headline}</h1>
      <p className="lede">{summary}</p>
      <ul className="feature-list">
        {bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <dl className="session-meta">
        <div>
          <dt>Signed in as</dt>
          <dd>{user.displayName}</dd>
        </div>
        <div>
          <dt>Username</dt>
          <dd>{user.username}</dd>
        </div>
        <div>
          <dt>Auth provider</dt>
          <dd>{user.provider}</dd>
        </div>
        <div>
          <dt>Linked employee</dt>
          <dd>{user.employeeId ?? "None"}</dd>
        </div>
      </dl>
    </section>
  );
}
