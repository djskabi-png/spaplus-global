import { redirect } from "next/navigation";
import { requireAuthorizedAdmin } from "../admin-auth";
import { cmsResources, hasPermission } from "../cms-access";
import SubmissionsClient from "./SubmissionsClient";
import "../admin/admin.css";
import "./leads.css";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const admin = await requireAuthorizedAdmin("/tools");
  if (!cmsResources.some((resource) => hasPermission(admin.role, admin.permissions, resource.key, "viewLeads"))) {
    redirect("/access-denied");
  }
  const isHebrew = admin.systemLocale === "he";
  const centreName = isHebrew
    ? "מרכז הלידים"
    : admin.systemLocale === "fr-CA"
      ? "Centre des prospects"
      : "Lead centre";
  const backLabel = isHebrew
    ? "חזרה לניהול"
    : admin.systemLocale === "fr-CA"
      ? "Retour à la gestion"
      : "Back to management";

  return (
    <main className="cms-shell" dir={isHebrew ? "rtl" : "ltr"} lang={admin.systemLocale}>
      <header className="cms-header">
        <a className="cms-brand" href="/admin">
          <img src="/spaplus-mark.png" alt="" />
          <span>{centreName}</span>
        </a>
        <a className="cms-preview" href="/admin">{backLabel}</a>
      </header>
      <SubmissionsClient systemLocale={admin.systemLocale} />
    </main>
  );
}
