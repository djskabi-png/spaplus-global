import { redirect } from "next/navigation";
import { requireAuthorizedAdmin } from "../admin-auth";
import { cmsContentResources, cmsResources, hasPermission } from "../cms-access";
import { normalizeSystemLocale } from "../system-locale";
import SubmissionsClient from "./SubmissionsClient";
import "../admin/admin.css";
import "./leads.css";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const admin = await requireAuthorizedAdmin("/tools");
  const allowedLeadResourceKeys = cmsResources
    .filter((resource) => hasPermission(admin.role, admin.permissions, resource.key, "viewLeads"))
    .map((resource) => resource.key);
  if (allowedLeadResourceKeys.length === 0) {
    redirect("/access-denied");
  }
  const canViewContentManagement = cmsContentResources.some((resource) =>
    hasPermission(admin.role, admin.permissions, resource.key, "viewContent"),
  );
  const systemLocale = normalizeSystemLocale(admin.systemLocale);
  const isHebrew = systemLocale === "he";
  const centreName = isHebrew
    ? "מרכז הלידים"
    : systemLocale === "fr-CA"
      ? "Centre des prospects"
      : "Lead centre";
  const backLabel = isHebrew
    ? canViewContentManagement ? "חזרה לניהול" : "יציאה"
    : systemLocale === "fr-CA"
      ? canViewContentManagement ? "Retour à la gestion" : "Déconnexion"
      : canViewContentManagement ? "Back to management" : "Sign out";
  const backHref = canViewContentManagement ? "/admin" : "/auth/logout?return_to=/";

  return (
    <main className="cms-shell" dir={isHebrew ? "rtl" : "ltr"} lang={systemLocale}>
      <header className="cms-header">
        <a className="cms-brand" href="/admin">
          <img src="/spaplus-mark.png" alt="" />
          <span>{centreName}</span>
        </a>
        {admin.role === "owner" ? <a className="cms-preview" href="/admin/projects">{isHebrew ? "הפרויקטים של אדיר" : systemLocale === "fr-CA" ? "Projets d’Adir" : "Adir’s projects"}</a> : null}
        <a className="cms-preview" href="/tools/meetings">{isHebrew ? "קביעת פגישה" : systemLocale === "fr-CA" ? "Planifier une réunion" : "Schedule a meeting"}</a>
        <a className="cms-preview" href={backHref}>{backLabel}</a>
      </header>
      <SubmissionsClient systemLocale={systemLocale} allowedResourceKeys={allowedLeadResourceKeys} />
    </main>
  );
}
