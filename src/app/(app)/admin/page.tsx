import { RoleHome } from "@/components/role-home";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminHomePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <RoleHome
      user={user}
      headline="Admin home"
      summary="Full-access shell for company-wide personnel, org structure, workflows, and exports."
      bullets={[
        "Create and manage local users under Users.",
        "See and manage all personnel and org units (coming next).",
        "Configure workflows and company settings.",
        "Export all in-scope data to Excel.",
      ]}
    />
  );
}
