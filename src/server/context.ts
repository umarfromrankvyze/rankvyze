import "server-only";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getWorkspace } from "@/server/queries";

/** Resolves the signed-in customer and their currently selected website. */
export async function dashboardContext() {
  const user = await requireUser("/dashboard");
  const workspace = await getWorkspace(user.id);
  if (!workspace) redirect(user.role === "ADMIN" ? "/admin" : "/onboarding");
  if (!workspace.website) redirect("/onboarding?restart=1");
  return { user, website: workspace.website, organization: workspace.organization, websites: workspace.websites };
}
