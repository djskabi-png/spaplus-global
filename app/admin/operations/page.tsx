import { redirect } from "next/navigation";
import { requireAuthorizedAdmin } from "../../admin-auth";
import { hasPermission } from "../../cms-access";
import OperationsClient, { type OperationsScope } from "./OperationsClient";
import "../admin.css";
import "./operations.css";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const admin = await requireAuthorizedAdmin("/admin/operations");
  const scopes: OperationsScope[] = [];
  const allowed = (key: string) => hasPermission(admin.role, admin.permissions, key, "viewContent");
  if (admin.role === "owner" || allowed("ops:global")) scopes.push("global");
  if (admin.role === "owner" || allowed("ops:global") || allowed("ops:ca")) scopes.push("ca");
  if (admin.role === "owner" || allowed("ops:global") || allowed("ops:ca") || allowed("ops:ca:on")) scopes.push("ca-on");
  if (admin.role === "owner" || allowed("ops:global") || allowed("ops:il")) scopes.push("il");
  if (!scopes.length) redirect("/access-denied");
  return (
    <main className="cms-shell" dir={admin.systemLocale === "he" ? "rtl" : "ltr"} lang={admin.systemLocale}>
      <header className="cms-header">
        <a className="cms-brand" href="/admin" aria-label="SpaPlus"><img src="/spaplus-mark.png" alt="" /><span>SpaPlus</span></a>
        <div className="cms-user"><a href="/admin">{admin.systemLocale === "he" ? "חזרה לניהול" : admin.systemLocale === "fr-CA" ? "Retour à la gestion" : "Back to management"}</a><span>{admin.displayName}</span></div>
      </header>
      <OperationsClient scopes={scopes} locale={admin.systemLocale} />
    </main>
  );
}
