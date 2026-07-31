import { requireAuthorizedAdmin } from "../admin-auth";
import AdminClient from "./AdminClient";
import "./admin.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAuthorizedAdmin("/admin");
  return (
    <main className="cms-shell" dir="rtl">
      <header className="cms-header">
        <a className="cms-brand" href="/" aria-label="SpaPlus Global">
          <img src="/spaplus-mark.png" alt="" />
          <span>SpaPlus</span>
        </a>
        <div className="cms-user">
          <span>{admin.displayName}</span>
          <a href="/auth/logout?return_to=/">יציאה</a>
        </div>
      </header>
      <AdminClient role={admin.role} defaultLocale={admin.defaultLocale} />
    </main>
  );
}
