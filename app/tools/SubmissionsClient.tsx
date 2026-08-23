"use client";

import { useEffect, useMemo, useState } from "react";
import {
  isExplicitTestLead,
  leadCustomerMessage,
  leadLocation,
  taggedValue,
} from "./lead-display.mjs";
import { normalizeSystemLocale } from "../system-locale";
import "./status.css";
import "./business-tabs.css";
import "./lead-activity.css";
import "./lead-origin.css";

type StoredStatus = "new" | "in_progress" | "closed" | "won" | "irrelevant" | "deleted";
type DashboardStatus = "new" | "in_progress" | "won" | "irrelevant" | "deleted";
type NoteState = "open" | "important" | "handled";

type LeadStatusEvent = { id: number; fromStatus: StoredStatus; toStatus: StoredStatus; actorEmail: string; actorName: string; createdAt: string };
type LeadNote = { id: number; body: string; state: NoteState; actorEmail: string; actorName: string; createdAt: string; updatedAt: string };

type Submission = {
  id: number;
  submissionId?: string;
  isTest?: boolean;
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
  statusEvents: LeadStatusEvent[];
  notes: LeadNote[];
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
    israel: "Israel",
    ontario: "Ontario",
    quebec: "Québec",
    received: "Received",
    contact: "Contact details",
    enquiry: "Enquiry",
    business: "Business",
    location: "City or area",
    phoneLabel: "Phone",
    emailLabel: "Email",
    customerMessage: "What the customer submitted",
    noCustomerMessage: "No additional message was submitted.",
    moreInfo: "Show more information",
    lessInfo: "Hide additional information",
    treatment: "Lead follow-up",
    hideTreatment: "Hide lead follow-up",
    technicalInfo: "Source and technical information",
    sourceLabel: "Source",
    formLabel: "Form type",
    leadIdLabel: "Lead ID",
    languageLabel: "Language",
    rawSourceData: "Full source data",
    utmSource: "Campaign source",
    utmMedium: "Campaign channel",
    utmCampaign: "Campaign name",
    utmContent: "Ad variation",
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
    israel: "ישראל",
    ontario: "אונטריו",
    quebec: "קוויבק",
    received: "התקבל",
    contact: "פרטי קשר",
    enquiry: "פרטי הפנייה",
    business: "בית העסק",
    location: "עיר או אזור",
    phoneLabel: "טלפון",
    emailLabel: "דוא״ל",
    customerMessage: "מה הלקוח השאיר",
    noCustomerMessage: "לא נכתבה הודעה נוספת.",
    moreInfo: "הצג מידע נוסף",
    lessInfo: "הסתר מידע נוסף",
    treatment: "טיפול בליד",
    hideTreatment: "הסתר טיפול בליד",
    technicalInfo: "מקור ונתונים טכניים",
    sourceLabel: "מקור",
    formLabel: "סוג טופס",
    leadIdLabel: "מזהה ליד",
    languageLabel: "שפה",
    rawSourceData: "כל המידע שהתקבל מהמקור",
    utmSource: "מקור הקמפיין",
    utmMedium: "ערוץ הקמפיין",
    utmCampaign: "שם הקמפיין",
    utmContent: "גרסת המודעה",
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
    israel: "Israël",
    ontario: "Ontario",
    quebec: "Québec",
    received: "Reçu",
    contact: "Coordonnées",
    enquiry: "Demande",
    business: "Entreprise",
    location: "Ville ou secteur",
    phoneLabel: "Téléphone",
    emailLabel: "Courriel",
    customerMessage: "Informations envoyées par le client",
    noCustomerMessage: "Aucun message supplémentaire n’a été envoyé.",
    moreInfo: "Afficher plus d’informations",
    lessInfo: "Masquer les informations supplémentaires",
    treatment: "Suivi du prospect",
    hideTreatment: "Masquer le suivi du prospect",
    technicalInfo: "Source et données techniques",
    sourceLabel: "Source",
    formLabel: "Type de formulaire",
    leadIdLabel: "Identifiant du prospect",
    languageLabel: "Langue",
    rawSourceData: "Données complètes reçues de la source",
    utmSource: "Source de campagne",
    utmMedium: "Canal de campagne",
    utmCampaign: "Nom de campagne",
    utmContent: "Variante de l’annonce",
    restoreHint: "Les prospects supprimés restent accessibles ici et peuvent être restaurés.",
  },
} as const;

const dashboardStatuses: DashboardStatus[] = ["new", "in_progress", "won", "irrelevant", "deleted"];

function normalizeStatus(status: StoredStatus): DashboardStatus {
  if (status === "closed") return "won";
  return status;
}

type SourceGroup = "meta_paid" | "google_paid" | "organic" | "direct" | "other";
type DatePeriod = "all" | "today" | "week" | "month" | "custom";
type BusinessFilter = "all" | "spaplus" | "vila4u";
type BrandFilter = "all" | "spaplus" | "vii" | "roomsvip" | "vila4u" | "zimmercard";
type WorldFilter = "all" | "vacation" | "events" | "spa" | "hourly" | "providers" | "activities" | "general" | "owners";

function leadBusiness(item: Pick<Submission, "resourceKey">): Exclude<BusinessFilter, "all"> {
  return item.resourceKey.startsWith("business:vila4u:") ? "vila4u" : "spaplus";
}

function isLeadResourceKey(resourceKey: string) {
  return resourceKey === "site:global"
    || resourceKey.startsWith("market:")
    || resourceKey === "business:vila4u:leads";
}

function businessLabels(locale: string) {
  if (locale === "he") return { all: "כל העסקים", spaplus: "ספא פלוס", vila4u: "וילה פור יו" };
  if (locale === "fr-CA") return { all: "Toutes les entreprises", spaplus: "SpaPlus", vila4u: "Vila4U" };
  return { all: "All businesses", spaplus: "SpaPlus", vila4u: "Vila4U" };
}

function leadBrand(item: Pick<Submission, "formType" | "message" | "resourceKey">): Exclude<BrandFilter, "all"> {
  const explicit = taggedValue(item, "Brand").toLowerCase();
  if (explicit === "vii") return "vii";
  if (explicit === "roomsvip") return "roomsvip";
  if (explicit === "zimmercard") return "zimmercard";
  const formType = item.formType.toLowerCase();
  if (formType.includes("room") && formType.includes("vip")) return "roomsvip";
  if (formType.startsWith("vii-")) return "vii";
  if (formType.includes("zimmer")) return "zimmercard";
  if (item.resourceKey.startsWith("business:vila4u:")) return "vila4u";
  return "spaplus";
}

function leadWorld(item: Pick<Submission, "formType" | "message" | "resourceKey">): Exclude<WorldFilter, "all"> {
  const explicit = taggedValue(item, "World").toLowerCase() as Exclude<WorldFilter, "all">;
  if (["vacation", "events", "spa", "hourly", "providers", "activities", "general", "owners"].includes(explicit)) return explicit;
  const formType = item.formType.toLowerCase();
  if (formType.includes("room") && formType.includes("vip")) return "hourly";
  if (formType.includes("spa")) return "spa";
  if (formType.includes("contact")) return "general";
  return item.resourceKey.startsWith("business:vila4u:") ? "owners" : "spa";
}

function brandLabels(locale: string) {
  if (locale === "he") return { title: "מותג", all: "כל המותגים", spaplus: "ספא פלוס", vii: "VII", roomsvip: "RoomsVIP", vila4u: "וילה פור יו", zimmercard: "צימר קארד" };
  if (locale === "fr-CA") return { title: "Marque", all: "Toutes les marques", spaplus: "SpaPlus", vii: "VII", roomsvip: "RoomsVIP", vila4u: "Vila4U", zimmercard: "ZimmerCard" };
  return { title: "Brand", all: "All brands", spaplus: "SpaPlus", vii: "VII", roomsvip: "RoomsVIP", vila4u: "Vila4U", zimmercard: "ZimmerCard" };
}

function worldLabels(locale: string) {
  if (locale === "he") return { title: "עולם", all: "כל העולמות", vacation: "נופש", events: "אירועים", spa: "ספא", hourly: "חדרים לפי שעה", providers: "ספקים", activities: "אטרקציות", general: "כללי", owners: "בעלי מקומות" };
  if (locale === "fr-CA") return { title: "Univers", all: "Tous les univers", vacation: "Séjours", events: "Événements", spa: "Spa", hourly: "Chambres à l’heure", providers: "Fournisseurs", activities: "Activités", general: "Général", owners: "Propriétaires" };
  return { title: "World", all: "All worlds", vacation: "Vacation", events: "Events", spa: "Spa", hourly: "Hourly rooms", providers: "Providers", activities: "Activities", general: "General", owners: "Property owners" };
}

function periodLabels(locale: string) {
  if (locale === "he") return { total: "סך הכול לידים", label: "תקופה", all: "כל התקופות", today: "היום", week: "7 ימים אחרונים", month: "30 ימים אחרונים", custom: "טווח לבחירה", from: "מתאריך", to: "עד תאריך" };
  if (locale === "fr-CA") return { total: "Total des prospects", label: "Période", all: "Depuis le début", today: "Aujourd’hui", week: "7 derniers jours", month: "30 derniers jours", custom: "Plage personnalisée", from: "Date de début", to: "Date de fin" };
  return { total: "Total leads", label: "Period", all: "All time", today: "Today", week: "Last 7 days", month: "Last 30 days", custom: "Custom range", from: "From", to: "To" };
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
      : /organic|vii\.co\.il/.test(normalized)
        ? "organic"
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
  if (locale === "he") return { title: "מקורות לידים", all: "כל מקורות הלידים", meta_paid: "קמפיין פייסבוק ואינסטגרם ממומן", google_paid: "קמפיין גוגל ממומן", organic: "אתר אורגני", direct: "הגעה ישירה", other: "מקור אחר" };
  if (locale === "fr-CA") return { title: "Sources des prospects", all: "Toutes les sources", meta_paid: "Campagne Facebook et Instagram", google_paid: "Campagne Google", organic: "Site organique", direct: "Accès direct", other: "Autre source" };
  return { title: "Lead sources", all: "All lead sources", meta_paid: "Paid Facebook and Instagram campaign", google_paid: "Paid Google campaign", organic: "Organic website", direct: "Direct visit", other: "Other source" };
}

function activityLabels(locale: string) {
  if (locale === "he") return {
    activity: "היסטוריית טיפול", created: "הליד נוצר", changed: "שינה מצב", from: "ממצב", to: "למצב",
    notes: "הערות לליד", add: "הוספת הערה חדשה", placeholder: "כתבו הערה על הטיפול בליד", publish: "פרסום הערה",
    open: "רגילה", important: "חשובה", handled: "טופלה", all: "כל ההערות", noteFilter: "סינון הערות",
    noteError: "לא ניתן לשמור את ההערה. נסו שוב.", noNotes: "אין הערות בסינון שנבחר.", by: "על ידי", saving: "שומר, נא להמתין...",
  };
  if (locale === "fr-CA") return {
    activity: "Historique du suivi", created: "Prospect créé", changed: "a modifié l’état", from: "de", to: "à",
    notes: "Notes du prospect", add: "Ajouter une note", placeholder: "Écrivez une note sur le suivi", publish: "Publier la note",
    open: "Normale", important: "Importante", handled: "Traitée", all: "Toutes les notes", noteFilter: "Filtrer les notes",
    noteError: "La note n’a pas pu être enregistrée.", noNotes: "Aucune note pour ce filtre.", by: "par", saving: "Enregistrement en cours...",
  };
  return {
    activity: "Lead activity", created: "Lead created", changed: "changed status", from: "from", to: "to",
    notes: "Lead notes", add: "Add a new note", placeholder: "Write a note about this lead", publish: "Publish note",
    open: "Normal", important: "Important", handled: "Handled", all: "All notes", noteFilter: "Filter notes",
    noteError: "The note could not be saved. Please try again.", noNotes: "No notes match this filter.", by: "by", saving: "Saving, please wait...",
  };
}

function receivedAt(item: Submission, locale: string) {
  const isCanada = item.resourceKey.startsWith("market:ca:");
  const isQuebec = item.resourceKey === "market:ca:qc";
  const timeZone = isQuebec ? "America/Montreal" : isCanada ? "America/Toronto" : "Asia/Jerusalem";
  const zoneLabel = locale === "he"
    ? (isQuebec ? "שעון מונטריאול" : isCanada ? "שעון טורונטו" : "שעון ישראל")
    : locale === "fr-CA"
      ? (isQuebec ? "Heure de Montréal" : isCanada ? "Heure de Toronto" : "Heure d’Israël")
      : (isQuebec ? "Montréal time" : isCanada ? "Toronto time" : "Israel time");
  const formatted = new Intl.DateTimeFormat(locale === "he" ? "he-IL" : locale, {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone,
  }).format(new Date(item.createdAt));
  return { formatted, zoneLabel };
}

async function fetchSubmissions() {
  const response = await fetch("/api/cms/submissions");
  if (!response.ok) throw new Error("Unable to load submissions");
  const data = (await response.json()) as { submissions: Submission[] };
  return data.submissions || [];
}

export default function SubmissionsClient({
  systemLocale,
  allowedResourceKeys,
}: {
  systemLocale: string;
  allowedResourceKeys: string[];
}) {
  const locale = normalizeSystemLocale(systemLocale);
  const t = copy[locale];
  const allowedBusinesses = Array.from(new Set(
    allowedResourceKeys.map((resourceKey) => leadBusiness({ resourceKey })),
  ));
  const initialBusiness: BusinessFilter = allowedBusinesses.length === 1
    ? allowedBusinesses[0]
    : "all";
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resource, setResource] = useState("all");
  const [business, setBusiness] = useState<BusinessFilter>(initialBusiness);
  const [brandFilter, setBrandFilter] = useState<BrandFilter>("all");
  const [worldFilter, setWorldFilter] = useState<WorldFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceGroup | "all">("all");
  const [statusFilter, setStatusFilter] = useState<DashboardStatus | "all">("new");
  const [datePeriod, setDatePeriod] = useState<DatePeriod>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});
  const [noteKinds, setNoteKinds] = useState<Record<number, NoteState>>({});
  const [noteFilters, setNoteFilters] = useState<Record<number, NoteState | "all">>({});
  const [savingNoteId, setSavingNoteId] = useState<number | null>(null);
  const [expandedInfo, setExpandedInfo] = useState<Record<number, boolean>>({});
  const [expandedTreatment, setExpandedTreatment] = useState<Record<number, boolean>>({});
  const [periodReference] = useState(() => Date.now());

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
  }, [locale]);

  async function load() {
    setError("");
    try {
      setSubmissions(await fetchSubmissions());
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    void fetchSubmissions()
      .then((items) => {
        if (!active) return;
        setSubmissions(items);
      })
      .catch(() => {
        if (active) setError(t.error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [t.error]);

  const operationalSubmissions = useMemo(
    () => submissions.filter((item) => !isExplicitTestLead(item)),
    [submissions],
  );
  const resources = useMemo(() => Array.from(new Set([
    ...allowedResourceKeys.filter(isLeadResourceKey),
    ...operationalSubmissions.map((item) => item.resourceKey),
  ])), [allowedResourceKeys, operationalSubmissions]);
  const resourceLabel = (key: string) => key.startsWith("business:vila4u:") ? businessLabels(locale).vila4u : key === "market:il" ? t.israel : key === "market:ca:on" ? t.ontario : key === "market:ca:qc" ? t.quebec : key === "market:ca:national" ? (locale === "he" ? "קנדה" : "Canada") : t.global;
  const statusLabel = (status: DashboardStatus) => t[status];
  const selectedBusinessLeads = business === "all"
    ? operationalSubmissions
    : operationalSubmissions.filter((item) => leadBusiness(item) === business);
  const brandLeads = brandFilter === "all"
    ? selectedBusinessLeads
    : selectedBusinessLeads.filter((item) => leadBrand(item) === brandFilter);
  const resourceLeads = resource === "all"
    ? brandLeads
    : brandLeads.filter((item) => item.resourceKey === resource);
  const worldLeads = worldFilter === "all"
    ? resourceLeads
    : resourceLeads.filter((item) => leadWorld(item) === worldFilter);
  const periodLeads = useMemo(() => {
    if (datePeriod === "all") return worldLeads;
    if (datePeriod === "custom") {
      const start = customFrom ? new Date(`${customFrom}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
      const end = customTo ? new Date(`${customTo}T23:59:59.999`).getTime() : Number.POSITIVE_INFINITY;
      return worldLeads.filter((item) => {
        const createdAt = new Date(item.createdAt).getTime();
        return createdAt >= start && createdAt <= end;
      });
    }
    const now = periodReference;
    const duration = datePeriod === "today" ? 24 * 60 * 60 * 1000 : datePeriod === "week" ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    return worldLeads.filter((item) => now - new Date(item.createdAt).getTime() <= duration);
  }, [customFrom, customTo, datePeriod, periodReference, worldLeads]);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const sources = sourceLabels(locale);
  const businesses = businessLabels(locale);
  const brands = brandLabels(locale);
  const leadWorlds = worldLabels(locale);
  const periods = periodLabels(locale);
  const activity = activityLabels(locale);
  const availableBrands = (["spaplus", "vii", "roomsvip", "vila4u", "zimmercard"] as Exclude<BrandFilter, "all">[])
    .filter((brand) => selectedBusinessLeads.some((item) => leadBrand(item) === brand));
  const availableWorlds = (["vacation", "events", "spa", "hourly", "providers", "activities", "general", "owners"] as Exclude<WorldFilter, "all">[])
    .filter((world) => brandLeads.some((item) => leadWorld(item) === world));
  const periodSummary = datePeriod === "all"
    ? periods.all
    : datePeriod === "today"
      ? periods.today
      : datePeriod === "week"
        ? periods.week
        : datePeriod === "month"
          ? periods.month
          : [customFrom || periods.from, customTo || periods.to].join(" / ");
  const sourceCounts = Object.fromEntries(
    (["meta_paid", "google_paid", "organic", "direct", "other"] as SourceGroup[]).map((source) => [
      source,
      periodLeads.filter((item) => attribution(item).group === source).length,
    ]),
  ) as Record<SourceGroup, number>;
  const dashboardLeads = sourceFilter === "all"
    ? periodLeads
    : periodLeads.filter((item) => attribution(item).group === sourceFilter);
  const dashboardCounts = Object.fromEntries(
    dashboardStatuses.map((status) => [
      status,
      dashboardLeads.filter((item) => normalizeStatus(item.status) === status).length,
    ]),
  ) as Record<DashboardStatus, number>;
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
      await load();
    } else {
      setError(t.updateError);
    }
    setUpdatingId(null);
  }

  async function addNote(item: Submission) {
    const body = (noteDrafts[item.id] || "").trim();
    if (!body) return;
    setSavingNoteId(item.id);
    setError("");
    const response = await fetch("/api/cms/submissions/notes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: item.id, body, state: noteKinds[item.id] || "open" }),
    });
    if (response.ok) {
      setNoteDrafts((current) => ({ ...current, [item.id]: "" }));
      await load();
    } else setError(activity.noteError);
    setSavingNoteId(null);
  }

  async function updateNoteState(item: Submission, note: LeadNote, state: NoteState) {
    setSavingNoteId(item.id);
    setError("");
    const response = await fetch("/api/cms/submissions/notes", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: note.id, state }),
    });
    if (response.ok) await load();
    else setError(activity.noteError);
    setSavingNoteId(null);
  }

  return (
    <section className="cms-content lead-dashboard">
      <div className="cms-intro lead-dashboard-intro">
        <div><p>{t.eyebrow}</p><h1>{t.title}</h1><span>{t.subtitle}</span></div>
      </div>

      <nav className="lead-business-tabs" aria-label={businesses.all}>
        {allowedBusinesses.length > 1 ? <button className={business === "all" ? "is-active" : ""} type="button" onClick={() => { setBusiness("all"); setBrandFilter("all"); setWorldFilter("all"); setResource("all"); }}>{businesses.all} ({operationalSubmissions.length})</button> : null}
        {allowedBusinesses.includes("spaplus") ? <button className={business === "spaplus" ? "is-active" : ""} type="button" onClick={() => { setBusiness("spaplus"); setBrandFilter("all"); setWorldFilter("all"); setResource("all"); }}>{businesses.spaplus} ({operationalSubmissions.filter((item) => leadBusiness(item) === "spaplus").length})</button> : null}
        {allowedBusinesses.includes("vila4u") ? <button className={business === "vila4u" ? "is-active" : ""} type="button" onClick={() => { setBusiness("vila4u"); setBrandFilter("all"); setWorldFilter("all"); setResource("all"); }}>{businesses.vila4u} ({operationalSubmissions.filter((item) => leadBusiness(item) === "vila4u").length})</button> : null}
      </nav>

      {availableBrands.length > 1 ? (
        <nav className="lead-brand-tabs" aria-label={brands.title}>
          <button className={brandFilter === "all" ? "is-active" : ""} type="button" onClick={() => { setBrandFilter("all"); setWorldFilter("all"); }}>{brands.all} ({selectedBusinessLeads.length})</button>
          {availableBrands.map((brand) => <button className={brandFilter === brand ? "is-active" : ""} key={brand} type="button" onClick={() => { setBrandFilter(brand); setWorldFilter("all"); }}>{brands[brand]} ({selectedBusinessLeads.filter((item) => leadBrand(item) === brand).length})</button>)}
        </nav>
      ) : null}

      <section className="lead-status-overview" aria-label={t.update}>
        <div className="lead-status-heading">
          <p>{sourceFilter === "all" ? t.title : sources[sourceFilter]}</p>
          <span>{sourceFilter === "all" ? t.subtitle : `${sources[sourceFilter]} · ${periods.label}: ${periodSummary}`}</span>
        </div>
      <div className="lead-status-grid">
        <button
          className={`lead-status-card is-total${statusFilter === "all" ? " is-active" : ""}`}
          type="button"
          aria-pressed={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        >
          <span>{periods.total}</span>
          <strong>{dashboardLeads.length}</strong>
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
            <strong>{dashboardCounts[status]}</strong>
          </button>
        ))}
      </div>
      </section>

      <div className={`lead-filters${datePeriod === "custom" ? " has-custom-range" : ""}`}>
        <label>
          <span>{periods.label}</span>
          <select value={datePeriod} onChange={(event) => setDatePeriod(event.target.value as DatePeriod)}>
            <option value="all">{periods.all}</option>
            <option value="today">{periods.today}</option>
            <option value="week">{periods.week}</option>
            <option value="month">{periods.month}</option>
            <option value="custom">{periods.custom}</option>
          </select>
        </label>
        {datePeriod === "custom" ? (
          <div className="lead-date-range">
            <label>
              <span>{periods.from}</span>
              <input type="date" value={customFrom} max={customTo || undefined} onInput={(event) => setCustomFrom(event.currentTarget.value)} />
            </label>
            <label>
              <span>{periods.to}</span>
              <input type="date" value={customTo} min={customFrom || undefined} onInput={(event) => setCustomTo(event.currentTarget.value)} />
            </label>
          </div>
        ) : null}
        <label>
          <span>{t.allAreas}</span>
          <select value={resource} onChange={(event) => setResource(event.target.value)}>
            <option value="all">{t.allAreas}</option>
            {resources.filter((key) => business === "all" || leadBusiness({ resourceKey: key }) === business).map((key) => <option key={key} value={key}>{resourceLabel(key)}</option>)}
          </select>
        </label>
        <label>
          <span>{leadWorlds.title}</span>
          <select value={worldFilter} onChange={(event) => setWorldFilter(event.target.value as WorldFilter)}>
            <option value="all">{leadWorlds.all}</option>
            {availableWorlds.map((world) => <option key={world} value={world}>{leadWorlds[world]}</option>)}
          </select>
        </label>
        <label className="lead-search">
          <span>{t.search}</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} />
        </label>
        <button className={statusFilter === "all" ? "is-active" : ""} type="button" onClick={() => setStatusFilter("all")}>{t.allLeads} ({dashboardLeads.length})</button>
      </div>

      <nav className="lead-source-tabs" aria-label={sources.title}>
        <button className={sourceFilter === "all" ? "is-active" : ""} type="button" onClick={() => setSourceFilter("all")}>{sources.all} ({periodLeads.length})</button>
        {(["meta_paid", "google_paid", "organic", "direct", "other"] as SourceGroup[]).map((source) => (
          <button className={sourceFilter === source ? "is-active" : ""} key={source} type="button" onClick={() => setSourceFilter(source)}>{sources[source]} ({sourceCounts[source]})</button>
        ))}
      </nav>

      <section className="lead-source-dashboard" aria-label={sources.title}>
        {(["meta_paid", "google_paid", "organic", "direct", "other"] as SourceGroup[]).map((source) => {
          const sourceLeads = periodLeads.filter((item) => attribution(item).group === source);
          const sourceStatus = Object.fromEntries(
            dashboardStatuses.map((status) => [status, sourceLeads.filter((item) => normalizeStatus(item.status) === status).length]),
          ) as Record<DashboardStatus, number>;
          return (
            <button className={`lead-source-summary is-${source}${sourceFilter === source ? " is-active" : ""}`} key={source} type="button" onClick={() => setSourceFilter(source)}>
              <span>{sources[source]}</span>
              <strong>{sourceLeads.length}</strong>
              <small>{t.new}: {sourceStatus.new} · {t.in_progress}: {sourceStatus.in_progress} · {t.won}: {sourceStatus.won} · {t.irrelevant}: {sourceStatus.irrelevant} · {t.deleted}: {sourceStatus.deleted}</small>
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
          const location = leadLocation(item);
          const customerMessage = leadCustomerMessage(item);
          const infoIsOpen = Boolean(expandedInfo[item.id]);
          const treatmentIsOpen = Boolean(expandedTreatment[item.id]);
          const infoPanelId = `lead-information-${item.id}`;
          const treatmentPanelId = `lead-treatment-${item.id}`;
          const technicalItems = [
            { label: t.sourceLabel, value: item.source || sources[leadAttribution.group] },
            { label: t.formLabel, value: item.formType },
            { label: t.leadIdLabel, value: item.submissionId || String(item.id) },
            { label: t.languageLabel, value: item.locale },
            { label: t.allAreas, value: item.resourceKey },
            { label: brands.title, value: brands[leadBrand(item)] },
            { label: leadWorlds.title, value: leadWorlds[leadWorld(item)] },
            { label: t.utmSource, value: leadAttribution.utmSource },
            { label: t.utmMedium, value: leadAttribution.utmMedium },
            { label: t.utmCampaign, value: leadAttribution.utmCampaign },
            { label: t.utmContent, value: leadAttribution.utmContent },
          ].filter((detail) => detail.value);
          return (
            <article className={`lead-card is-${currentStatus}`} key={item.id}>
              <header>
                <div className="lead-card-summary">
                  <span className={`lead-status-badge is-${currentStatus}`}>{statusLabel(currentStatus)}</span>
                  <small>{resourceLabel(item.resourceKey)}</small>
                  <span className={`lead-source-badge is-${leadAttribution.group}`}>{sources[leadAttribution.group]}</span>
                </div>
                <time dateTime={item.createdAt}>{t.received}: {received.formatted} <span className="lead-time-zone">{received.zoneLabel}</span></time>
              </header>
              <div className="lead-card-grid">
                <section className="lead-customer-card">
                  <span>{t.contact}</span>
                  <h2>{item.name || item.organization || item.email || item.phone}</h2>
                  <dl className="lead-customer-facts">
                    {item.organization && item.organization !== item.name ? <div><dt>{t.business}</dt><dd>{item.organization}</dd></div> : null}
                    {location ? <div><dt>{t.location}</dt><dd>{location}</dd></div> : null}
                  </dl>
                  <div className="lead-contact-actions">
                    {item.phone ? <a className="is-primary" href={`tel:${item.phone}`}><span>{t.phoneLabel}</span><strong><bdi dir="ltr">{item.phone}</bdi></strong></a> : null}
                    {item.email ? <a href={`mailto:${item.email}`}><span>{t.emailLabel}</span><strong><bdi dir="ltr">{item.email}</bdi></strong></a> : null}
                  </div>
                </section>
                <section className="lead-customer-message">
                  <span>{t.customerMessage}</span>
                  {item.topic ? <h3>{item.topic}</h3> : null}
                  <div className={`lead-message-panel${customerMessage ? "" : " is-empty"}`}>
                    <p>{customerMessage || t.noCustomerMessage}</p>
                  </div>
                </section>
              </div>
              <footer className="lead-card-toolbar">
                <label>
                  <span>{t.update}</span>
                  <select
                    value={currentStatus}
                    disabled={updatingId === item.id}
                    onChange={(event) => void updateStatus(item, event.target.value as DashboardStatus)}
                  >
                    {dashboardStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                  </select>
                  {updatingId === item.id ? <span className="action-loading" role="status"><i aria-hidden="true" />{activity.saving}</span> : null}
                </label>
                <div className="lead-card-actions">
                  <button
                    className="lead-disclosure-button"
                    type="button"
                    aria-expanded={infoIsOpen}
                    aria-controls={infoPanelId}
                    onClick={() => setExpandedInfo((current) => ({ ...current, [item.id]: !infoIsOpen }))}
                  >
                    {infoIsOpen ? t.lessInfo : t.moreInfo}
                  </button>
                  <button
                    className="lead-disclosure-button is-treatment"
                    type="button"
                    aria-expanded={treatmentIsOpen}
                    aria-controls={treatmentPanelId}
                    onClick={() => setExpandedTreatment((current) => ({ ...current, [item.id]: !treatmentIsOpen }))}
                  >
                    {treatmentIsOpen ? t.hideTreatment : `${t.treatment} (${item.notes.length})`}
                  </button>
                </div>
              </footer>
              {infoIsOpen ? (
                <section className="lead-technical-panel" id={infoPanelId} aria-label={t.technicalInfo}>
                  <h3>{t.technicalInfo}</h3>
                  <dl>
                    {technicalItems.map((detail) => <div key={detail.label}><dt>{detail.label}</dt><dd dir="auto">{detail.value}</dd></div>)}
                  </dl>
                  {item.message && item.message.trim() !== customerMessage ? (
                    <div className="lead-raw-source">
                      <h4>{t.rawSourceData}</h4>
                      <p dir="auto">{item.message}</p>
                    </div>
                  ) : null}
                </section>
              ) : null}
              {treatmentIsOpen ? (
                <div className="lead-activity-grid" id={treatmentPanelId}>
                  <section className="lead-history">
                    <h3>{activity.activity}</h3>
                    <ol>
                      {item.statusEvents.map((event) => (
                        <li key={event.id}>
                          <strong>{event.actorName || event.actorEmail}</strong>
                          <span>{activity.changed}: {statusLabel(normalizeStatus(event.fromStatus))} → {statusLabel(normalizeStatus(event.toStatus))}</span>
                          <time dateTime={event.createdAt}>{new Intl.DateTimeFormat(locale === "he" ? "he-IL" : locale, { dateStyle: "short", timeStyle: "short" }).format(new Date(event.createdAt))}</time>
                        </li>
                      ))}
                      <li>
                        <strong>{activity.created}</strong>
                        <time dateTime={item.createdAt}>{received.formatted}</time>
                      </li>
                    </ol>
                  </section>
                  <section className="lead-notes">
                    <div className="lead-notes-heading">
                      <h3>{activity.notes}</h3>
                      <label><span>{activity.noteFilter}</span><select value={noteFilters[item.id] || "all"} onChange={(event) => setNoteFilters((current) => ({ ...current, [item.id]: event.target.value as NoteState | "all" }))}><option value="all">{activity.all}</option><option value="open">{activity.open}</option><option value="important">{activity.important}</option><option value="handled">{activity.handled}</option></select></label>
                    </div>
                    <div className="lead-note-list">
                      {item.notes.filter((note) => !noteFilters[item.id] || noteFilters[item.id] === "all" || note.state === noteFilters[item.id]).map((note) => (
                        <article className={`lead-note is-${note.state}`} key={note.id}>
                          <p>{note.body}</p>
                          <div><span>{activity.by} {note.actorName || note.actorEmail}</span><time dateTime={note.createdAt}>{new Intl.DateTimeFormat(locale === "he" ? "he-IL" : locale, { dateStyle: "short", timeStyle: "short" }).format(new Date(note.createdAt))}</time></div>
                          <select aria-label={activity.noteFilter} value={note.state} disabled={savingNoteId === item.id} onChange={(event) => void updateNoteState(item, note, event.target.value as NoteState)}><option value="open">{activity.open}</option><option value="important">{activity.important}</option><option value="handled">{activity.handled}</option></select>
                        </article>
                      ))}
                      {item.notes.length > 0 && item.notes.filter((note) => !noteFilters[item.id] || noteFilters[item.id] === "all" || note.state === noteFilters[item.id]).length === 0 ? <p>{activity.noNotes}</p> : null}
                    </div>
                    <div className="lead-note-form">
                      <label><span>{activity.add}</span><textarea value={noteDrafts[item.id] || ""} placeholder={activity.placeholder} maxLength={4000} onChange={(event) => setNoteDrafts((current) => ({ ...current, [item.id]: event.target.value }))} /></label>
                      <select aria-label={activity.noteFilter} value={noteKinds[item.id] || "open"} onChange={(event) => setNoteKinds((current) => ({ ...current, [item.id]: event.target.value as NoteState }))}><option value="open">{activity.open}</option><option value="important">{activity.important}</option><option value="handled">{activity.handled}</option></select>
                      <button className={savingNoteId === item.id ? "is-loading" : ""} type="button" disabled={savingNoteId === item.id || !(noteDrafts[item.id] || "").trim()} onClick={() => void addNote(item)}>{savingNoteId === item.id ? <><i className="action-spinner" aria-hidden="true" />{activity.saving}</> : activity.publish}</button>
                    </div>
                    {savingNoteId === item.id ? <span className="action-loading lead-note-loading" role="status"><i aria-hidden="true" />{activity.saving}</span> : null}
                  </section>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
