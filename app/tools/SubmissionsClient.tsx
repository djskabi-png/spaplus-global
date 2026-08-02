"use client";

import { useEffect, useMemo, useState } from "react";
import { normalizeSystemLocale } from "../system-locale";
import "./status.css";

type StoredStatus = "new" | "in_progress" | "closed" | "won" | "irrelevant" | "deleted";
type DashboardStatus = "new" | "in_progress" | "won" | "irrelevant" | "deleted";

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
    in_progress: "In progress",
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
    in_progress: "בטיפול",
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
    in_progress: "En traitement",
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

const dashboardStatuses: DashboardStatus[] = ["new", "in_progress", "won", "irrelevant", "deleted"];

function normalizeStatus(status: StoredStatus): DashboardStatus {
  if (status === "closed") return "won";
  return status;
}

type SourceGroup = "meta_paid" | "google_paid" | "direct" | "other";
type DatePeriod = "all" | "today" | "week" | "month";

function periodLabels(locale: string) {
  if (locale === "he") return { total: "סך הכול לידים", label: "תקופה", all: "כל התקופות", today: "היום", week: "7 ימים אחרונים", month: "30 ימים אחרונים" };
  if (locale === "fr-CA") return { total: "Total des prospects", label: "Période", all: "Depuis le début", today: "Aujourd’hui", week: "7 derniers jours", month: "30 derniers jours" };
  return { total: "Total leads", label: "Period", all: "All time", today: "Today", week: "Last 7 days", month: "Last 30 days" };
}

function attribution(item: Submission) {
  const source = item.source || "";
  const campaign = item.message.match(/Campaign:\s*([^\n]+)/i)?.[1] || "";
  const values = new URLSearchParams(campaign.replace(/,\s*/g, "&"));
  const normalized = `${source} ${campaign}`.toLowerCase();
  const group: SourceGroup = /(^|[=&\s])meta|facebook|instagram|fbclid/.test(normalized)
    ? "meta_paid"
    : /google|gclid/.test(normalized)
      ? "google_paid"
      : !campaign || /direct or untagged/i.test(campaign)
        ? "direct"
        : "other";
  return {
    group,
    utmSource: values.get("utm_source") || "",
    utmMedium: values.get("utm_medium") || "",
    utmCampaign: values.get("utm_campaign") || "",
    utmContent: values.get("utm_content") || "",
  };
}

function sourceLabels(locale: string) {
  if (locale === "he") return { title: "מקורות לידים", all: "כל מקורות הלידים", meta_paid: "קמפיין פייסבוק ואינסטגרם ממומן", google_paid: "קמפיין גוגל ממומן", direct: "הגעה ישירה", other: "מקור אחר" };
  if (locale === "fr-CA") return { title: "Sources des prospects", all: "Toutes les sources", meta_paid: "Campagne Facebook et Instagram", google_paid: "Campagne Google", direct: "Accès direct", other: "Autre source" };
  return { title: "Lead sources", all: "All lead sources", meta_paid: "Paid Facebook and Instagram campaign", google_paid: "Paid Google campaign", direct: "Direct visit", other: "Other source" };
}

function receivedAt(item: Submission, locale: string) {
  const isOntario = item.resourceKey === "market:ca:on";
  const timeZone = isOntario ? "America/Toronto" : "Asia/Jerusalem";
  const zoneLabel = locale === "he"
    ? (isOntario ? "שעון טורונטו" : "שעון ישראל")
    : locale === "fr-CA"
      ? (isOntario ? "Heure de Toronto" : "Heure d’Israël")
      : (isOntario ? "Toronto time" : "Israel time");
  const formatted = new Intl.DateTimeFormat(locale === "he" ? "he-IL" : locale, {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone,
  }).format(new Date(item.createdAt));
  return { formatted, zoneLabel };
}

export default function SubmissionsClient({ systemLocale }: { systemLocale: string }) {
  const locale = normalizeSystemLocale(systemLocale);
  const t = copy[locale];
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resource, setResource] = useState("all");
  const [sourceFilter, setSourceFilter] = useState<SourceGroup | "all">("all");
  const [statusFilter, setStatusFilter] = useState<DashboardStatus | "all">("new");
  const [datePeriod, setDatePeriod] = useState<DatePeriod>("all");
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
  }, [locale]);

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
  const periodLeads = useMemo(() => {
    if (datePeriod === "all") return resourceLeads;
    const now = Date.now();
    const duration = datePeriod === "today" ? 24 * 60 * 60 * 1000 : datePeriod === "week" ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    return resourceLeads.filter((item) => now - new Date(item.createdAt).getTime() <= duration);
  }, [datePeriod, resourceLeads]);
  const counts = Object.fromEntries(
    dashboardStatuses.map((status) => [
      status,
      periodLeads.filter((item) => normalizeStatus(item.status) === status).length,
    ]),
  ) as Record<DashboardStatus, number>;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const sources = sourceLabels(locale);
  const periods = periodLabels(locale);
  const sourceCounts = Object.fromEntries(
    (["meta_paid", "google_paid", "direct", "other"] as SourceGroup[]).map((source) => [
      source,
      periodLeads.filter((item) => attribution(item).group === source).length,
    ]),
  ) as Record<SourceGroup, number>;
  const visible = periodLeads.filter((item) => {
    if (statusFilter !== "all" && normalizeStatus(item.status) !== statusFilter) return false;
    if (sourceFilter !== "all" && attribution(item).group !== sourceFilter) return false;
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
        <button
          className={`lead-status-card is-total${statusFilter === "all" ? " is-active" : ""}`}
          type="button"
          aria-pressed={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        >
          <span>{periods.total}</span>
          <strong>{periodLeads.length}</strong>
        </button>
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
          <span>{periods.label}</span>
          <select value={datePeriod} onChange={(event) => setDatePeriod(event.target.value as DatePeriod)}>
            <option value="all">{periods.all}</option>
            <option value="today">{periods.today}</option>
            <option value="week">{periods.week}</option>
            <option value="month">{periods.month}</option>
          </select>
        </label>
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
        <button className={statusFilter === "all" ? "is-active" : ""} type="button" onClick={() => setStatusFilter("all")}>{t.allLeads} ({periodLeads.length})</button>
      </div>

      <nav className="lead-source-tabs" aria-label={sources.title}>
        <button className={sourceFilter === "all" ? "is-active" : ""} type="button" onClick={() => setSourceFilter("all")}>{sources.all} ({periodLeads.length})</button>
        {(["meta_paid", "google_paid", "direct", "other"] as SourceGroup[]).map((source) => (
          <button className={sourceFilter === source ? "is-active" : ""} key={source} type="button" onClick={() => setSourceFilter(source)}>{sources[source]} ({sourceCounts[source]})</button>
        ))}
      </nav>

      <section className="lead-source-dashboard" aria-label={sources.title}>
        {(["meta_paid", "google_paid", "direct", "other"] as SourceGroup[]).map((source) => {
          const sourceLeads = periodLeads.filter((item) => attribution(item).group === source);
          const sourceStatus = Object.fromEntries(
            dashboardStatuses.map((status) => [status, sourceLeads.filter((item) => normalizeStatus(item.status) === status).length]),
          ) as Record<DashboardStatus, number>;
          return (
            <button className={`lead-source-summary is-${source}${sourceFilter === source ? " is-active" : ""}`} key={source} type="button" onClick={() => setSourceFilter(source)}>
              <span>{sources[source]}</span>
              <strong>{sourceLeads.length}</strong>
              <small>{t.new}: {sourceStatus.new} · {t.in_progress}: {sourceStatus.in_progress} · {t.won}: {sourceStatus.won}</small>
            </button>
          );
        })}
      </section>

      {statusFilter === "deleted" ? <p className="lead-restore-note">{t.restoreHint}</p> : null}
      {loading ? <p className="lead-system-message">{t.loading}</p> : null}
      {error ? <p className="lead-system-message is-error" role="alert">{error}</p> : null}
      {!loading && !error && visible.length === 0 ? <p className="lead-system-message">{t.empty}</p> : null}

      <div className="lead-list">
        {visible.map((item) => {
          const currentStatus = normalizeStatus(item.status);
          const leadAttribution = attribution(item);
          const received = receivedAt(item, locale);
          return (
            <article className={`lead-card is-${currentStatus}`} key={item.id}>
              <header>
                <div>
                  <span className={`lead-status-badge is-${currentStatus}`}>{statusLabel(currentStatus)}</span>
                  <small>{resourceLabel(item.resourceKey)}</small>
                  <span className={`lead-source-badge is-${leadAttribution.group}`}>{sources[leadAttribution.group]}</span>
                </div>
                <time dateTime={item.createdAt}>{t.received}: {received.formatted} <span className="lead-time-zone">{received.zoneLabel}</span></time>
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
                  <div className="lead-attribution" dir="ltr">
                    <strong>{sources.title}</strong>
                    <span>{leadAttribution.utmSource || leadAttribution.group}</span>
                    {leadAttribution.utmMedium ? <span>{leadAttribution.utmMedium}</span> : null}
                    {leadAttribution.utmCampaign ? <span>{leadAttribution.utmCampaign}</span> : null}
                    {leadAttribution.utmContent ? <span>{leadAttribution.utmContent}</span> : null}
                  </div>
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
