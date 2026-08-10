"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type OperationsScope = "global" | "ca" | "ca-on" | "il";
type OperationsData = {
  scope: OperationsScope;
  lastUpdated: string;
  intake: { total: number; today: number; new: number; inProgress: number; won: number; irrelevant: number };
  recent: Array<{ id: number; name: string; organization: string; source: string; status: string; createdAt: string }>;
};

const copy = {
  en: { title: "SpaPlus operations", eyebrow: "Global spa management", intro: "One operational view for spa onboarding, agreements, bookings, finance and reports.", back: "Management home", live: "Live spa intake", updated: "Updated", scopes: { global: "All markets", ca: "Canada", "ca-on": "Ontario", il: "Israel" }, metrics: ["Spa enquiries", "Received today", "In progress", "Joined successfully", "Active spas", "Agreements pending", "Bookings today", "Gross booking value"], funnel: "Spa onboarding pipeline", stages: ["Lead captured", "Registration started", "Profile completed", "Agreement sent", "Agreement signed", "Internal review", "Active"], recent: "Recent spa enquiries", noRecent: "No spa enquiries in this scope yet.", integrations: "Connection health", connected: "Lead intake is connected", pending: "Awaiting Gal booking connection", pendingText: "Bookings, approvals, cancellations, sales, commission and settlements remain at zero until the verified Gal connector is active.", directory: "Spa directory", agreements: "Agreements and documents", bookings: "Bookings and changes", finance: "Finance and settlements", reports: "Reports", notConnected: "Not connected yet", refresh: "Refresh now", loading: "Loading verified data" },
  he: { title: "ניהול בתי ספא", eyebrow: "מערכת התפעול העולמית", intro: "תמונה תפעולית אחת לקליטת בתי ספא, הסכמים, הזמנות, כספים ודוחות.", back: "חזרה לניהול", live: "קליטת בתי ספא בזמן אמת", updated: "עודכן", scopes: { global: "כל השווקים", ca: "קנדה", "ca-on": "אונטריו", il: "ישראל" }, metrics: ["פניות מבתי ספא", "התקבלו היום", "בטיפול", "הצטרפו בהצלחה", "בתי ספא פעילים", "הסכמים ממתינים", "הזמנות היום", "שווי הזמנות ברוטו"], funnel: "משפך קליטת בתי ספא", stages: ["ליד נקלט", "הרשמה התחילה", "פרופיל הושלם", "הסכם נשלח", "הסכם נחתם", "בדיקה פנימית", "פעיל"], recent: "פניות אחרונות מבתי ספא", noRecent: "עדיין אין פניות מבתי ספא באזור הזה.", integrations: "מצב החיבורים", connected: "קליטת הלידים מחוברת", pending: "ממתין לחיבור ההזמנות של גל", pendingText: "הזמנות, אישורים, ביטולים, מכירות, עמלות והתחשבנויות נשארים על אפס עד להפעלת חיבור מאומת לגל.", directory: "ספר בתי הספא", agreements: "הסכמים ומסמכים", bookings: "הזמנות ושינויים", finance: "כספים והתחשבנות", reports: "דוחות", notConnected: "עדיין לא מחובר", refresh: "רענון עכשיו", loading: "טוען נתונים מאומתים" },
  "fr-CA": { title: "Gestion des spas", eyebrow: "Opérations mondiales", intro: "Une vue unique pour l’intégration, les ententes, les réservations, les finances et les rapports.", back: "Retour à la gestion", live: "Intégration des spas en direct", updated: "Mis à jour", scopes: { global: "Tous les marchés", ca: "Canada", "ca-on": "Ontario", il: "Israël" }, metrics: ["Demandes de spas", "Reçues aujourd’hui", "En traitement", "Adhésions réussies", "Spas actifs", "Ententes en attente", "Réservations aujourd’hui", "Valeur brute"], funnel: "Parcours d’intégration", stages: ["Demande reçue", "Inscription commencée", "Profil terminé", "Entente envoyée", "Entente signée", "Vérification interne", "Actif"], recent: "Demandes récentes", noRecent: "Aucune demande dans cette zone.", integrations: "État des connexions", connected: "L’arrivée des demandes est connectée", pending: "Connexion aux réservations de Gal en attente", pendingText: "Les réservations, approbations, annulations, ventes, commissions et règlements restent à zéro jusqu’à la connexion vérifiée.", directory: "Répertoire des spas", agreements: "Ententes et documents", bookings: "Réservations et changements", finance: "Finances et règlements", reports: "Rapports", notConnected: "Pas encore connecté", refresh: "Actualiser", loading: "Chargement des données vérifiées" },
} as const;

export default function OperationsClient({ scopes, locale }: { scopes: OperationsScope[]; locale: "en" | "he" | "fr-CA" }) {
  const t = copy[locale];
  const [scope, setScope] = useState(scopes[0]);
  const [data, setData] = useState<OperationsData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    const response = await fetch(`/api/cms/operations?scope=${encodeURIComponent(scope)}`, { cache: "no-store" });
    if (!response.ok) { setError("Unable to load operations data"); setLoading(false); return; }
    setData(await response.json() as OperationsData); setLoading(false);
  }, [scope]);
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 30000); return () => window.clearInterval(timer); }, [load]);
  const values = useMemo(() => data ? [data.intake.total, data.intake.today, data.intake.inProgress, data.intake.won, 0, 0, 0, 0] : [0, 0, 0, 0, 0, 0, 0, 0], [data]);
  const stageValues = data ? [data.intake.total, 0, 0, 0, 0, 0, 0] : [0, 0, 0, 0, 0, 0, 0];
  return <section className="operations-content">
    <header className="operations-hero"><div><p>{t.eyebrow}</p><h1>{t.title}</h1><span>{t.intro}</span><div className="operations-hero-actions"><a className="operations-new-spa" href="/admin/operations/dashboard-preview">{locale === "he" ? "תוצאות מכירות ודוחות" : locale === "fr-CA" ? "Résultats et rapports" : "Sales results and reports"}</a><a className="operations-new-spa operations-new-spa-secondary" href="/admin/operations/spas/new">{locale === "he" ? "תצוגת סביבת עבודה לספא חדש" : locale === "fr-CA" ? "Voir l’espace d’un nouveau spa" : "Preview a new spa workspace"}</a></div></div><div className="operations-scope"><label>{t.live}<select value={scope} onChange={event => setScope(event.target.value as OperationsScope)}>{scopes.map(item => <option key={item} value={item}>{t.scopes[item]}</option>)}</select></label><button onClick={() => void load()}>{t.refresh}</button></div></header>
    <div className="operations-status"><i className={error ? "error" : ""} /> <strong>{loading ? t.loading : error || t.connected}</strong><span>{data ? `${t.updated}: ${new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: scope === "il" ? "Asia/Jerusalem" : "America/Toronto" }).format(new Date(data.lastUpdated))}` : ""}</span></div>
    <section className="operations-metrics">{t.metrics.map((label, index) => <article key={label}><span>{label}</span><strong>{values[index]}</strong><small>{index < 4 ? t.live : t.notConnected}</small></article>)}</section>
    <section className="operations-grid"><article className="operations-card"><header><h2>{t.funnel}</h2><span>{data?.intake.total || 0}</span></header><div className="operations-funnel">{t.stages.map((stage, index) => <div key={stage}><b>{index + 1}</b><span>{stage}</span><strong>{stageValues[index]}</strong></div>)}</div></article><article className="operations-card operations-connection"><header><h2>{t.integrations}</h2></header><div className="connected"><b>✓</b><span>{t.connected}</span></div><div className="pending"><b>!</b><div><strong>{t.pending}</strong><p>{t.pendingText}</p></div></div></article></section>
    <section className="operations-card operations-recent"><header><h2>{t.recent}</h2><span>{data?.recent.length || 0}</span></header>{data?.recent.length ? <div>{data.recent.map(item => <article key={item.id}><div><strong>{item.organization || item.name}</strong><span>{item.name}</span></div><span>{item.source || "SpaPlus"}</span><span>{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: scope === "il" ? "Asia/Jerusalem" : "America/Toronto" }).format(new Date(item.createdAt))}</span><b>{item.status}</b></article>)}</div> : <p>{t.noRecent}</p>}</section>
    <section className="operations-modules">{[t.directory, t.agreements, t.bookings, t.finance, t.reports].map((label, index) => <article key={label}><span>0{index + 1}</span><h2>{label}</h2><p>{t.notConnected}</p></article>)}</section>
  </section>;
}
