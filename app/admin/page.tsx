import { requireAuthorizedAdmin } from "../admin-auth";
import AdminClient from "./AdminClient";
import { cmsContentResources, cmsResources, hasPermission } from "../cms-access";
import { redirect } from "next/navigation";
import "./admin.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAuthorizedAdmin("/admin");
  const canViewContent = cmsContentResources.some((resource) =>
    hasPermission(admin.role, admin.permissions, resource.key, "viewContent"),
  );
  const canViewLeads = cmsResources.some((resource) =>
    hasPermission(admin.role, admin.permissions, resource.key, "viewLeads"),
  );
  const canViewVila4uLeads = hasPermission(
    admin.role,
    admin.permissions,
    "business:vila4u:leads",
    "viewLeads",
  );
  const canViewOtherLeads = cmsResources.some(
    (resource) => resource.key !== "business:vila4u:leads" &&
      hasPermission(admin.role, admin.permissions, resource.key, "viewLeads"),
  );
  if (!canViewContent && canViewVila4uLeads && !canViewOtherLeads) redirect("/vila4u");
  if (!canViewContent && canViewLeads) redirect("/tools");
  if (!canViewContent && !canViewLeads && admin.role !== "owner") redirect("/access-denied");
  const isHebrew = admin.systemLocale === "he";
  return (
    <main className="cms-shell" dir={isHebrew ? "rtl" : "ltr"} lang={admin.systemLocale}>
      <header className="cms-header">
        <a className="cms-brand" href="/" aria-label="SpaPlus Global">
          <img src="/spaplus-mark.png" alt="" />
          <span>SpaPlus</span>
        </a>
        <div className="cms-user">
          <span>{admin.displayName}</span>
          <a href="/auth/logout?return_to=/">{isHebrew ? "יציאה" : admin.systemLocale === "fr-CA" ? "Déconnexion" : "Sign out"}</a>
        </div>
      </header>
      <AdminClient
        role={admin.role}
        defaultLocale={admin.defaultLocale}
        systemLocale={admin.systemLocale}
        permissions={admin.permissions}
        resources={[...cmsResources]}
      />
    </main>
  );
}
