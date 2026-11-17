import { RoleHome } from "@/components/role-home";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StaffHomePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <RoleHome
      user={user}
      headline="Staff home"
      summary="Limited self-service shell for your own record and workflows."
      bullets={[
        "View your own personnel record.",
        "Start workflows such as annual leave.",
        "No Excel export access.",
      ]}
    />
  );
}
