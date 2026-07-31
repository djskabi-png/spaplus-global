"use client";

import { useEffect, useMemo, useState } from "react";

type StoredStatus = "new" | "in_progress" | "closed" | "won" | "irrelevant" | "deleted";
type DashboardStatus = "new" | "won" | "irrelevant" | "deleted";

type Submission = {
  id: number;
  formType: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  topic: string;
  message: string;
  locale: string;
  source: string;
  resourceKey: string;
  status: StoredStatus;
  createdAt: string;
};

const copy = {
  en: {
    eyebrow: "Lead management",
    title: "Lead dashboard",
    subtitle: "Every enquiry in one place, organized by its current outcome.",
    loading: "Loading leads...",
    error: "Unable to load leads. Please refresh the page.",
    updateError: "The lead could not be updated. Please try again.",
    empty: "There are no leads matching these filters.",
    allAreas: "All areas",
    allLeads: "All leads",
    search: "Search by name, spa, email or phone",
    new: "New",
    won: "Closed successfully",
    irrelevant: "Not relevant",
    deleted: "Deleted",
    update: "Lead status",
    global: "Global website",
    ontario: "Ontario",
    received: "Received",
    contact: "Contact details",
    enquiry: "Enquiry",
    restoreHint: "Deleted leads remain available here and can be restored.",
  },
  he: {
    eyebrow: "ניהול פניות",
    title: "דשבורד לידים",
    subtitle: "כל פנייה במקום אחד, מסודרת לפי התוצאה והשלב הנוכחי שלה.",
    loading: "טוען לידים...",
    error: "לא ניתן לטעון את הלידים. נסו לרענן את העמוד.",
    updateError: "לא ניתן לעדכן את הליד. נסו שוב.",
    empty: "אין לידים שמתאימים לסינון שבחרתם.",
    allAreas: "כל האזורים",
    allLeads: "כל הלידים",
    search: "חיפוש לפי שם, ספא, מייל או טלפון",
    new: "חדש",
    won: "נסגר בהצלחה",
    irrelevant: "לא רלוונטי",
    deleted: "נמחק",
    update: "מצב הליד",
    global: "האתר העולמי",
    ontario: "אונטריו",
    received: "התקבל",
    contact: "פרטי קשר",
    enquiry: "פרטי הפנייה",
    restoreHint: "לידים שנמחקו נשמרים כאן וניתן לשחזר אותם.",
  },
  "fr-CA": {
    eyebrow: "Gestion des demandes",
    title: "Tableau de bord des prospects",
    subtitle: "Toutes les demandes au même endroit, classées selon leur résultat actuel.",
    loading: "Chargement des prospects...",
    error: "Impossible de charger les prospects. Veuillez actualiser la page.",
    updateError: "Impossible de mettre le prospect à jour. Veuillez réessayer.",
    empty: "Aucun prospect ne correspond aux filtres sélectionnés.",
    allAreas: "Tous les secteurs",
    allLeads: "Tous les prospects",
    search: "Rechercher par nom, spa, courriel ou téléphone",
    new: "Nouveau",
    won: "Conclu avec succès",
    irrelevant: "Non pertinent",
    deleted: "Supprimé",
    update: "État du prospect",
    global: "Site mondial",
    ontario: "Ontario",
    received: "Reçu",
    contact: "Coordonnées",
    enquiry: "Demande",
    restoreHint: "Les prospects supprimés restent accessibles ici et peuvent être restaurés.",
  },
} as const;

const dashboardStatuses: DashboardStatus[] = ["new", "won", "irrelevant", "deleted"];

function normalizeStatus(status: StoredStatus): DashboardStatus {
  if (status === "closed") return "won";
  if (status === "in_progress") return "new";
  return status;
}

export default function SubmissionsClient({ systemLocale }: { systemLocale: string }) {
  const locale = systemLocale === "he" || systemLocale === "fr-CA" ? systemLocale : "en";
  const t = copy[locale];
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resource, setResource] = useState("all");
  const [statusFilter, setStatusFilter] = useState<DashboardStatus | "all">("new");
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function load() {
    setError("");
    try {
      const response = await fetch("/api/cms/submissions");
      if (!response.ok) throw new Error("Unable to load submissions");
      const data = (await response.json()) as { submissions: Submission[] };
      setSubmissions(data.submissions || []);
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const resources = useMemo(
    () => Array.from(new Set(submissions.map((item) => item.resourceKey))),
    [submissions],
  );
  const resourceLabel = (key: string) => key === "market:ca:on" ? t.ontario : t.global;
  const statusLabel = (status: DashboardStatus) => t[status];
  const resourceLeads = resource === "all"
    ? submissions
    : submissions.filter((item) => item.resourceKey === resource);
  const counts = Object.fromEntries(
    dashboardStatuses.map((status) => [
      status,
      resourceLeads.filter((item) => normalizeStatus(item.status) === status).length,
    ]),
  ) as Record<DashboardStatus, number>;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visible = resourceLeads.filter((item) => {
    if (statusFilter !== "all" && normalizeStatus(item.status) !== statusFilter) return false;
    if (!normalizedQuery) return true;
    return [item.name, item.organization, item.email, item.phone, item.topic, item.message]
      .join(" ")
      .toLocaleLowerCase()
      .includes(normalizedQuery);
  });

  async function updateStatus(item: Submission, status: DashboardStatus) {
    setUpdatingId(item.id);
    setError("");
    const response = await fetch("/api/cms/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, status }),
    });
    if (response.ok) {
      setSubmissions((current) => current.map((lead) =>
        lead.id === item.id ? { ...lead, status } : lead,
      ));
    } else {
      setError(t.updateError);
    }
    setUpdatingId(null);
  }

  return (
    <section className="cms-content lead-dashboard">
      <div className="cms-intro lead-dashboard-intro">
        <div><p>{t.eyebrow}</p><h1>{t.title}</h1><span>{t.subtitle}</span></div>
      </div>

      <div className="lead-status-grid" aria-label={t.update}>
        {dashboardStatuses.map((status) => (
          <button
            className={`lead-status-card is-${status}${statusFilter === status ? " is-active" : ""}`}
            key={status}
            type="button"
            aria-pressed={statusFilter === status}
            onClick={() => setStatusFilter(status)}
          >
            <span>{statusLabel(status)}</span>
            <strong>{counts[status]}</strong>
          </button>
        ))}
      </div>

      <div className="lead-filters">
        <label>
          <span>{t.allAreas}</span>
          <select value={resource} onChange={(event) => setResource(event.target.value)}>
            <option value="all">{t.allAreas}</option>
            {resources.map((key) => <option key={key} value={key}>{resourceLabel(key)}</option>)}
          </select>
        </label>
        <label className="lead-search">
          <span>{t.search}</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} />
        </label>
        <button className={statusFilter === "all" ? "is-active" : ""} type="button" onClick={() => setStatusFilter("all")}>{t.allLeads} ({resourceLeads.length})</button>
      </div>

      {statusFilter === "deleted" ? <p className="lead-restore-note">{t.restoreHint}</p> : null}
      {loading ? <p className="lead-system-message">{t.loading}</p> : null}
      {error ? <p className="lead-system-message is-error" role="alert">{error}</p> : null}
      {!loading && !error && visible.length === 0 ? <p className="lead-system-message">{t.empty}</p> : null}

      <div className="lead-list">
        {visible.map((item) => {
          const currentStatus = normalizeStatus(item.status);
          return (
            <article className={`lead-card is-${currentStatus}`} key={item.id}>
              <header>
                <div>
                  <span className={`lead-status-badge is-${currentStatus}`}>{statusLabel(currentStatus)}</span>
                  <small>{resourceLabel(item.resourceKey)}</small>
                </div>
                <time dateTime={item.createdAt}>{t.received}: {new Date(item.createdAt).toLocaleString(locale === "he" ? "he-IL" : locale)}</time>
              </header>
              <div className="lead-card-grid">
                <section>
                  <span>{t.contact}</span>
                  <h2>{item.name || item.organization}</h2>
                  {item.organization && item.organization !== item.name ? <strong>{item.organization}</strong> : null}
                  <a dir="ltr" href={`mailto:${item.email}`}>{item.email}</a>
                  {item.phone ? <a dir="ltr" href={`tel:${item.phone}`}>{item.phone}</a> : null}
                </section>
                <section>
                  <span>{t.enquiry}</span>
                  {item.topic ? <h3>{item.topic}</h3> : null}
                  <p>{item.message}</p>
                </section>
              </div>
              <footer>
                <label>
                  <span>{t.update}</span>
                  <select
                    value={currentStatus}
                    disabled={updatingId === item.id}
                    onChange={(event) => void updateStatus(item, event.target.value as DashboardStatus)}
                  >
                    {dashboardStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                  </select>
                </label>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
