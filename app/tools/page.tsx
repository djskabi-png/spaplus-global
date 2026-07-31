import { requireAuthorizedAdmin } from "../admin-auth";
import SubmissionsClient from "./SubmissionsClient";
import { redirect } from "next/navigation";
import { cmsResources, hasPermission } from "../cms-access";
import "../admin/admin.css";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const admin = await requireAuthorizedAdmin("/tools");
  if (!cmsResources.some((resource) => hasPermission(admin.role, admin.permissions, resource.key, "viewLeads"))) {
    redirect("/access-denied");
  }
  const isHebrew = admin.systemLocale === "he";
  return (
    <main className="cms-shell" dir={isHebrew ? "rtl" : "ltr"} lang={admin.systemLocale}>
      <header className="cms-header">
        <a className="cms-brand" href="/admin">
          <img src="/spaplus-mark.png" alt="" />
          <span>{isHebrew ? "מרכז הפניות" : admin.systemLocale === "fr-CA" ? "Centre des demandes" : "Lead centre"}</span>
        </a>
        <a className="cms-preview" href="/admin">{isHebrew ? "חזרה לניהול" : admin.systemLocale === "fr-CA" ? "Retour à la gestion" : "Back to management"}</a>
      </header>
      <SubmissionsClient systemLocale={admin.systemLocale} />
    </main>
  );
}
