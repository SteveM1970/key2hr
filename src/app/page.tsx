import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ensureBootstrapped } from "@/lib/db/bootstrap";
import { roleHomePath } from "@/lib/roles";

export const runtime = "nodejs";

export default async function HomePage() {
  await ensureBootstrapped();
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  redirect(roleHomePath(user.role));
}
