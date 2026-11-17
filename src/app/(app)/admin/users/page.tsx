import { AdminCreateUserForm } from "@/components/admin-create-user-form";
import { getSessionUser } from "@/lib/auth";
import { isRole, roleLabel } from "@/lib/roles";
import { listUsersForAdmin } from "@/lib/users/create-user";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default async function AdminUsersPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/admin");

  const users = await listUsersForAdmin();

  return (
    <div className="panel-stack">
      <section className="content-panel">
        <h1>Users</h1>
        <p className="muted">
          Create local username/password accounts. Only admins can manage users.
        </p>
        <AdminCreateUserForm />
      </section>

      <section className="content-panel">
        <h2>Existing users</h2>
        {users.length === 0 ? (
          <p className="muted">No users yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <code>{user.username}</code>
                    </td>
                    <td>{user.displayName}</td>
                    <td>{isRole(user.role) ? roleLabel(user.role) : user.role}</td>
                    <td>{user.active ? "Active" : "Inactive"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
