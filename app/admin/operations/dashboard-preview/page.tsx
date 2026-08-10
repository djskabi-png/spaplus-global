import { redirect } from "next/navigation";
import { requireAuthorizedAdmin } from "../../../admin-auth";
import { hasPermission } from "../../../cms-access";
import DashboardPreviewClient from "./DashboardPreviewClient";
import "../../admin.css";
import "../operations.css";
import "./dashboard-preview.css";

export const dynamic = "force-dynamic";

export default async function DashboardPreviewPage() {
  const admin = await requireAuthorizedAdmin("/admin/operations/dashboard-preview");
  const allowed = admin.role === "owner" || hasPermission(admin.role, admin.permissions, "ops:global", "viewContent");
  if (!allowed) redirect("/access-denied");

  return (
    <main className="cms-shell" dir="rtl" lang="he">
      <header className="cms-header">
        <a className="cms-brand" href="/admin" aria-label="SpaPlus"><img src="/spaplus-mark.png" alt="" /><span>SpaPlus</span></a>
        <div className="cms-user"><a href="/admin/operations">חזרה לניהול בתי הספא</a><span>{admin.displayName}</span></div>
      </header>
      <DashboardPreviewClient />
    </main>
  );
}
