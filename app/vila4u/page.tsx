import { redirect } from "next/navigation";
import { requireAuthorizedAdmin } from "../admin-auth";
import { hasPermission } from "../cms-access";
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

  return (
    <main className="cms-shell" dir={isHebrew ? "rtl" : "ltr"} lang={systemLocale}>
      <header className="cms-header">
        <a className="cms-brand" href="/admin">
          <img src="/spaplus-mark.png" alt="" />
          <span>{isHebrew ? "קבוצת וילה פור יו, מרכז הלידים" : "Vila4U lead centre"}</span>
        </a>
        <a className="cms-preview" href="/admin">
          {isHebrew ? "חזרה לניהול" : "Back to management"}
        </a>
      </header>
      <SubmissionsClient systemLocale={systemLocale} />
    </main>
  );
}
