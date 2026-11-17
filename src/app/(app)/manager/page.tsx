import { RoleHome } from "@/components/role-home";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ManagerHomePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <RoleHome
      user={user}
      headline="Manager home"
      summary="Direct-reports workspace for team visibility, approvals, and team-scoped exports."
      bullets={[
        "View only your direct reports.",
        "Approve or reject team workflows (leave first).",
        "Export Excel for your team only.",
      ]}
    />
  );
}
