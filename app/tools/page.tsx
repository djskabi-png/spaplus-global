import { requireAuthorizedAdmin } from "../admin-auth";
import SubmissionsClient from "./SubmissionsClient";
import "../admin/admin.css";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  await requireAuthorizedAdmin("/tools");
  return (
    <main className="cms-shell" dir="rtl">
      <header className="cms-header">
        <a className="cms-brand" href="/admin">
          <img src="/spaplus-mark.png" alt="" />
          <span>מרכז הפניות</span>
        </a>
        <a className="cms-preview" href="/admin">חזרה לניהול</a>
      </header>
      <SubmissionsClient />
    </main>
  );
}
