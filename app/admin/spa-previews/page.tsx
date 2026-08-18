import { redirect } from "next/navigation";
import { requireAuthorizedAdmin } from "../../admin-auth";
import { hasPermission } from "../../cms-access";
import { listSpaPreviews } from "../../spa-preview";
import SpaPreviewManager from "./SpaPreviewManager";
import "./spa-previews.css";

export const dynamic = "force-dynamic";

export default async function SpaPreviewsPage() {
  const admin = await requireAuthorizedAdmin("/admin/spa-previews");
  if (!hasPermission(admin.role, admin.permissions, "site:global:spa-previews", "viewContent")) redirect("/access-denied");
  const initialPreviews = await listSpaPreviews();
  return <main className="spa-cms-shell" dir={admin.systemLocale === "he" ? "rtl" : "ltr"} lang={admin.systemLocale}><SpaPreviewManager canEdit={hasPermission(admin.role, admin.permissions, "site:global:spa-previews", "editContent")} initialPreviews={initialPreviews} /></main>;
}
