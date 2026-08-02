import { redirect } from "next/navigation";
import { requireAuthorizedAdmin } from "../admin-auth";
import { cmsContentResources, hasPermission } from "../cms-access";
import { normalizeSystemLocale } from "../system-locale";
import SubmissionsClient from "../tools/SubmissionsClient";
import "../admin/admin.css";
import "../tools/leads.css";

export const dynamic = "force-dynamic";

export default async function Vila4uLeadsPage() {
  const admin = await requireAuthorizedAdmin("/vila4u");
  if (!hasPermission(admin.role, admin.permissions, "business:vila4u:leads", "viewLeads")) {
    redirect("/access-denied");
  }

  const systemLocale = normalizeSystemLocale(admin.systemLocale);
  const isHebrew = systemLocale === "he";
  const canViewContentManagement = cmsContentResources.some((resource) =>
    hasPermission(admin.role, admin.permissions, resource.key, "viewContent"),
  );
  const backHref = canViewContentManagement ? "/admin" : "/auth/logout?return_to=/";
  const backLabel = isHebrew
    ? canViewContentManagement ? "חזרה לניהול" : "יציאה"
    : canViewContentManagement ? "Back to management" : "Sign out";

  return (
    <main className="cms-shell" dir={isHebrew ? "rtl" : "ltr"} lang={systemLocale}>
      <header className="cms-header">
        <a className="cms-brand" href="/vila4u">
          <img src="/spaplus-mark.png" alt="" />
          <span>{isHebrew ? "קבוצת וילה פור יו, מרכז הלידים" : "Vila4U lead centre"}</span>
        </a>
        <a className="cms-preview" href={backHref}>{backLabel}</a>
      </header>
      <SubmissionsClient systemLocale={systemLocale} allowedResourceKeys={["business:vila4u:leads"]} />
    </main>
  );
}
