import { redirect } from "next/navigation";
import { requireAuthorizedAdmin } from "../../../../admin-auth";
import { hasPermission } from "../../../../cms-access";
import NewSpaDemo from "../../../../demo/new-spa/NewSpaDemo";
import "../../../../demo/new-spa/new-spa-demo.css";
import "../../../../demo/new-spa/new-spa-typography.css";

export const dynamic = "force-dynamic";

export default async function NewSpaWorkspacePage() {
  const admin = await requireAuthorizedAdmin("/admin/operations/spas/new");
  const canView = admin.role === "owner" || ["ops:global", "ops:ca", "ops:ca:on"].some((key) =>
    hasPermission(admin.role, admin.permissions, key, "viewContent"),
  );
  if (!canView) redirect("/access-denied");
  return <NewSpaDemo homeHref="/admin/operations" />;
}
