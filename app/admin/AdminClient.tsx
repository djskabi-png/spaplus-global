"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { localeOptions, translations, type Locale } from "../i18n";
import companyData from "../company-data.json";
import marketCopyManifest from "../market-launch/generated-market-copy.json";
import { quebecCopyOverrides } from "../market-launch/markets";
import "./business-permissions.css";

type AdminRole = "owner" | "editor" | "viewer";
type Permission = {
  resourceKey: string;
  canViewContent: boolean;
  canEditContent: boolean;
  canViewLeads: boolean;
  canManageLeads: boolean;
};
type Resource = {
  key: string;
  type: string;
  business: string;
  topic: string;
  labels: { en: string; he: string; "fr-CA": string };
};
type CmsRow = {
  id: number;
  locale: string;
  section: string;
  field: string;
  value: string;
  updatedAt: string;
};
type CmsUser = {
  id: number;
  email: string;
  displayName: string;
  role: AdminRole;
  status: "active" | "inactive";
  defaultLocale: Locale;
  systemLocale: "en" | "he" | "fr-CA";
  canReportBugs: boolean;
  lastLoginAt: string | null;
  permissions: Permission[];
};

const globalFields = {
  translation: [
    ["heroTitle", "Main headline"], ["heroTitleAccent", "Headline accent"],
    ["heroIntro", "Introduction"], ["visionTitle", "Vision headline"],
    ["visionBodyOne", "First vision paragraph"], ["visionBodyTwo", "Second vision paragraph"],
    ["productsTitle", "Products headline"], ["productsIntro", "Products introduction"],
    ["growthTitle", "Growth headline"], ["growthBody", "Growth description"],
    ["storyTitle", "Story headline"], ["storyBodyOne", "Founding story"],
    ["storyBodyTwo", "Story continuation"], ["aboutTitle", "About headline"],
    ["aboutBody", "About content"], ["footerTagline", "Footer tagline"],
  ],
  company: [
    ["technologyTitle", "Technology headline"], ["technologyBody", "Technology description"],
    ["technologyStatement", "Brand statement"], ["teamTitle", "Team headline"],
    ["teamIntro", "Team introduction"], ["contactTitle", "Contact headline"],
    ["contactBody", "Contact description"], ["directEmail", "Email address"],
  ],
} as const;

type MarketCopyEntry = {
  field: string;
  label: string;
  group: string;
  en: string;
  fr: string;
};

const marketCopyEntries = marketCopyManifest as MarketCopyEntry[];

const uiCopy = {
  en: {
    title: "Clear content. Precise access.", eyebrow: "SpaPlus management",
    preview: "View website", global: "Global website", market: "Ontario page", quebec: "Québec page", canada: "Canada page", spaPreviews: "Spa profile previews",
    users: "Users and permissions", leads: "Leads and forms", bugs: "Bug reports", contentLanguage: "Content language",
    languageNote: "Changes apply only to the selected content language.", save: "Save",
    saving: "Saving...", saved: "Saved successfully", failed: "Unable to save",
    usersTitle: "Users and permissions", security: "Passwords are never stored here. Each user signs in with their own Google account.",
    fullName: "Full name", email: "Email address", add: "Add user", editor: "Editor",
    viewer: "View only", owner: "Owner", systemLanguage: "System language",
    defaultContentLanguage: "Default content language", active: "Active", inactive: "Inactive",
    disable: "Disable", enable: "Enable", contentAccess: "Page access", leadAccess: "Lead access",
    none: "No access", view: "View", edit: "Edit", manage: "Manage", inherited: "Legacy access",
    bugAccess: "Can report bugs", allowed: "Allowed", notAllowed: "Not allowed",
    homeSection: "Homepage", companySection: "About, team and contact", marketSection: "Ontario campaign page",
    searchContent: "Search page text", saveAll: "Save all changes", fields: "editable fields",
  },
  he: {
    title: "תוכן ברור. הרשאות מדויקות.", eyebrow: "מערכת הניהול של ספא פלוס",
    preview: "צפייה באתר", global: "האתר העולמי", market: "עמוד אונטריו", quebec: "עמוד קוויבק", canada: "עמוד קנדה", spaPreviews: "תצוגות מקדימות לספא",
    users: "משתמשים והרשאות", leads: "פניות וטפסים", bugs: "דיווחי באגים", contentLanguage: "שפת התוכן",
    languageNote: "השינויים יחולו רק על שפת התוכן שנבחרה.", save: "שמירה",
    saving: "שומר...", saved: "נשמר בהצלחה", failed: "לא ניתן לשמור",
    usersTitle: "משתמשים והרשאות", security: "סיסמאות אינן נשמרות כאן. כל משתמש נכנס באמצעות חשבון גוגל האישי שלו.",
    fullName: "שם מלא", email: "כתובת מייל", add: "הוספת משתמש", editor: "עורך",
    viewer: "צפייה בלבד", owner: "בעלים", systemLanguage: "שפת המערכת",
    defaultContentLanguage: "שפת תוכן בברירת מחדל", active: "פעיל", inactive: "לא פעיל",
    disable: "השבתה", enable: "הפעלה", contentAccess: "הרשאת עמוד", leadAccess: "הרשאת פניות",
    none: "ללא גישה", view: "צפייה", edit: "עריכה", manage: "ניהול", inherited: "גישה קיימת",
    bugAccess: "אפשרות לדווח על באגים", allowed: "מורשה", notAllowed: "ללא הרשאה",
    homeSection: "עמוד הבית", companySection: "אודות, צוות ויצירת קשר", marketSection: "עמוד הקמפיין של אונטריו",
    searchContent: "חיפוש טקסט בעמוד", saveAll: "שמירת כל השינויים", fields: "שדות לעריכה",
  },
  "fr-CA": {
    title: "Un contenu clair. Des accès précis.", eyebrow: "Gestion SpaPlus",
    preview: "Voir le site", global: "Site mondial", market: "Page Ontario", quebec: "Page Québec", canada: "Page Canada", spaPreviews: "Aperçus de profils spa",
    users: "Utilisateurs et autorisations", leads: "Demandes et formulaires", bugs: "Signalements de bogues", contentLanguage: "Langue du contenu",
    languageNote: "Les changements s’appliquent uniquement à la langue de contenu choisie.", save: "Enregistrer",
    saving: "Enregistrement...", saved: "Enregistré", failed: "Enregistrement impossible",
    usersTitle: "Utilisateurs et autorisations", security: "Aucun mot de passe n’est conservé ici. Chaque personne se connecte avec son propre compte Google.",
    fullName: "Nom complet", email: "Adresse courriel", add: "Ajouter", editor: "Éditeur",
    viewer: "Lecture seule", owner: "Propriétaire", systemLanguage: "Langue du système",
    defaultContentLanguage: "Langue de contenu par défaut", active: "Actif", inactive: "Inactif",
    disable: "Désactiver", enable: "Activer", contentAccess: "Accès à la page", leadAccess: "Accès aux demandes",
    none: "Aucun accès", view: "Consulter", edit: "Modifier", manage: "Gérer", inherited: "Accès existant",
    bugAccess: "Peut signaler des bogues", allowed: "Autorisé", notAllowed: "Non autorisé",
    homeSection: "Page d’accueil", companySection: "À propos, équipe et contact", marketSection: "Page de campagne Ontario",
    searchContent: "Rechercher dans le contenu", saveAll: "Enregistrer toutes les modifications", fields: "champs modifiables",
  },
} as const;

const systemLanguageOptions = [
  { code: "he", label: "עברית" },
  { code: "en", label: "English" },
  { code: "fr-CA", label: "Français canadien" },
] as const;

const marketGroupLabels: Record<string, { en: string; he: string; "fr-CA": string }> = {
  "Search and sharing": { en: "Search and sharing", he: "חיפוש ושיתוף", "fr-CA": "Recherche et partage" },
  "Navigation and accessibility": { en: "Navigation and accessibility", he: "ניווט ונגישות", "fr-CA": "Navigation et accessibilité" },
  "Hero and launch status": { en: "Hero and launch status", he: "פתיח וסטטוס השקה", "fr-CA": "En-tête et état du lancement" },
  "Growth and founding partner offer": { en: "Growth and founding partner offer", he: "צמיחה והצעת שותף מייסד", "fr-CA": "Croissance et offre de partenaire fondateur" },
  "Platform preview": { en: "Platform preview", he: "המחשת הפלטפורמה", "fr-CA": "Aperçu de la plateforme" },
  "Proof and guest experiences": { en: "Proof and guest experiences", he: "המחשות וחוויות אורחים", "fr-CA": "Preuves et expériences clients" },
  "Partner fit and launch areas": { en: "Partner fit and launch areas", he: "התאמת שותפים ואזורי השקה", "fr-CA": "Profil des partenaires et zones de lancement" },
  "Commercial model and process": { en: "Commercial model and process", he: "מודל מסחרי ותהליך", "fr-CA": "Modèle commercial et processus" },
  "Registration form": { en: "Registration form", he: "טופס הרשמה", "fr-CA": "Formulaire d’inscription" },
  "Registration form settings": { en: "Registration form settings", he: "הגדרות טופס ההרשמה", "fr-CA": "Réglages du formulaire d’inscription" },
  "Email messages and delivery": { en: "Email messages and delivery", he: "הודעות מייל ושליחה", "fr-CA": "Courriels et livraison" },
  "Frequently asked questions": { en: "Frequently asked questions", he: "שאלות נפוצות", "fr-CA": "Questions fréquentes" },
  "Final call to action and footer": { en: "Final call to action and footer", he: "קריאה אחרונה לפעולה ופוטר", "fr-CA": "Appel final et pied de page" },
  "Messages, cookies and page controls": { en: "Messages, cookies and page controls", he: "הודעות, קוקיז וכלי עמוד", "fr-CA": "Messages, témoins et contrôles" },
};

function permissionFor(user: CmsUser, resourceKey: string): Permission {
  return user.permissions.find((item) => item.resourceKey === resourceKey) || {
    resourceKey,
    canViewContent: false,
    canEditContent: false,
    canViewLeads: false,
    canManageLeads: false,
  };
}

export default function AdminClient({
  role,
  defaultLocale,
  systemLocale,
  canReportBugs,
  permissions,
  resources,
}: {
  role: AdminRole;
  defaultLocale: string;
  systemLocale: string;
  canReportBugs: boolean;
  permissions: Permission[];
  resources: Resource[];
}) {
  const uiLocale = systemLocale === "he" || systemLocale === "fr-CA" ? systemLocale : "en";
  const t = uiCopy[uiLocale];
  const direction = uiLocale === "he" ? "rtl" : "ltr";
  const can = (resourceKey: string, capability: keyof Omit<Permission, "resourceKey">) =>
    role === "owner" || permissions.some((item) => item.resourceKey === resourceKey && (item[capability] || (capability === "canViewContent" && item.canEditContent) || (capability === "canViewLeads" && item.canManageLeads)));
  const canViewGlobalContent = can("site:global", "canViewContent");
  const canViewSpaPreviews = can("site:global:spa-previews", "canViewContent");
  const canViewMarketContent = can("market:ca:on", "canViewContent");
  const canViewQuebecContent = can("market:ca:qc", "canViewContent");
  const canViewCanadaContent = can("market:ca:national", "canViewContent");
  const hasContentAccess = canViewGlobalContent || canViewSpaPreviews || canViewMarketContent || canViewQuebecContent || canViewCanadaContent;
  const hasLeadAccess = resources.some((resource) => can(resource.key, "canViewLeads"));
  const hasVila4uLeadAccess = can("business:vila4u:leads", "canViewLeads");
  const hasOtherLeadAccess = resources.some((resource) =>
    resource.key !== "business:vila4u:leads" && can(resource.key, "canViewLeads"),
  );
  const leadsOnlyHref = hasVila4uLeadAccess && !hasOtherLeadAccess ? "/vila4u" : "/tools";
  const initialTab = canViewGlobalContent ? "global" : canViewCanadaContent ? "canada" : canViewQuebecContent ? "quebec" : "market";
  const [tab, setTab] = useState<"global" | "market" | "quebec" | "canada" | "users">(initialTab);
  const [locale, setLocale] = useState<string>(defaultLocale);
  const [rows, setRows] = useState<CmsRow[]>([]);
  const [users, setUsers] = useState<CmsUser[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [contentSearch, setContentSearch] = useState("");
  const [contentLoading, setContentLoading] = useState(false);
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const contentRequestId = useRef(0);
  const emptyPermissions = resources.map((resource) => ({
    resourceKey: resource.key,
    canViewContent: false,
    canEditContent: false,
    canViewLeads: false,
    canManageLeads: false,
  }));
  const [newUser, setNewUser] = useState({
    email: "", displayName: "", role: "editor", defaultLocale: "en" as Locale,
    systemLocale: "en" as "en" | "he" | "fr-CA", canReportBugs: false, permissions: emptyPermissions,
  });
  const resourceKey = tab === "market" ? "market:ca:on" : tab === "quebec" ? "market:ca:qc" : tab === "canada" ? "market:ca:national" : "site:global";
  const canViewSelectedContent = tab === "market" ? canViewMarketContent : tab === "quebec" ? canViewQuebecContent : tab === "canada" ? canViewCanadaContent : canViewGlobalContent;
  const contentLocaleOptions = tab === "market" || tab === "quebec" || tab === "canada"
    ? [{ code: "en-CA", label: "English, Canada" }, { code: "fr-CA", label: "Français canadien" }]
    : localeOptions;

  useEffect(() => {
    document.documentElement.lang = uiLocale;
    document.documentElement.dir = direction;
  }, [direction, uiLocale]);

  useEffect(() => {
    if (!contentLocaleOptions.some((option) => option.code === locale)) {
      setLocale(contentLocaleOptions[0].code);
    }
  }, [tab]);

  const loadContent = useCallback(async () => {
    if (tab === "users" || !canViewSelectedContent) return;
    const requestId = ++contentRequestId.current;
    setContentLoading(true);
    setRows([]);
    setDrafts({});
    try {
      const response = await fetch(`/api/cms/content?locale=${encodeURIComponent(locale)}&resource=${encodeURIComponent(resourceKey)}`);
      if (!response.ok || requestId !== contentRequestId.current) return;
      const data = (await response.json()) as { rows: CmsRow[] };
      if (requestId === contentRequestId.current) setRows(data.rows);
    } finally {
      if (requestId === contentRequestId.current) setContentLoading(false);
    }
  }, [canViewSelectedContent, locale, resourceKey, tab]);

  const loadUsers = useCallback(async () => {
    const response = await fetch(`/api/cms/users?fresh=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return false;
    const data = (await response.json()) as { users: CmsUser[] };
    setUsers(data.users);
    return true;
  }, []);

  useEffect(() => { void loadContent(); }, [loadContent]);
  useEffect(() => { if (tab === "users") void loadUsers(); }, [tab, loadUsers]);
  useEffect(() => {
    if (role !== "owner" && !hasContentAccess && hasLeadAccess) {
      window.location.replace(leadsOnlyHref);
    }
  }, [hasContentAccess, hasLeadAccess, leadsOnlyHref, role]);

  const existing = useMemo(() => Object.fromEntries(rows.map((row) => [`${row.section}.${row.field}`, row.value])), [rows]);

  function defaultValue(section: string, field: string) {
    if (section === "market.ca-on" || section === "market.ca-qc" || section === "market.ca") {
      const entry = marketCopyEntries.find((item) => item.field === field);
      if (section === "market.ca-qc") {
        const configured = quebecCopyOverrides[field] || (entry ? quebecCopyOverrides[entry.en] : undefined);
        if (configured) return locale === "fr-CA" ? configured.fr : configured.en;
      }
      return locale === "fr-CA" ? entry?.fr || "" : entry?.en || "";
    }
    const source = section === "translation"
      ? (translations[locale as Locale] as unknown as Record<string, string>)
      : (companyData.copy[locale as Locale] as unknown as Record<string, string>);
    return source?.[field] || "";
  }

  async function save(section: string, field: string) {
    if (contentLoading) return;
    const key = `${section}.${field}`;
    const value = drafts[key] ?? existing[key] ?? defaultValue(section, field);
    setStatus(t.saving);
    setSavingAction(`content:${section}.${field}`);
    const response = await fetch("/api/cms/content", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, section, field, value }),
    });
    setStatus(response.ok ? t.saved : t.failed);
    if (response.ok) await loadContent();
    setSavingAction(null);
  }

  async function saveAllMarketChanges() {
    if (contentLoading) return;
    const section = tab === "canada" ? "market.ca" : tab === "quebec" ? "market.ca-qc" : "market.ca-on";
    const changes = Object.entries(drafts).filter(([key]) => key.startsWith(`${section}.`));
    if (!changes.length) return;
    setStatus(t.saving);
    setSavingAction("content:all");
    for (const [key, value] of changes) {
      const field = key.slice(`${section}.`.length);
      const response = await fetch("/api/cms/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, section, field, value }),
      });
      if (!response.ok) {
        setStatus(t.failed);
        setSavingAction(null);
        return;
      }
    }
    setStatus(t.saved);
    await loadContent();
    setSavingAction(null);
  }

  async function addUser() {
    setStatus(t.saving);
    setSavingAction("user:new");
    const response = await fetch("/api/cms/users", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newUser),
    });
    const data = await response.json() as { user?: CmsUser; error?: string };
    setStatus(response.ok && data.user ? t.saved : data.error || t.failed);
    if (response.ok) {
      setNewUser({ email: "", displayName: "", role: "editor", defaultLocale: "en", systemLocale: "en", canReportBugs: false, permissions: emptyPermissions });
      if (data.user) setUsers((current) => [...current.filter((item) => item.id !== data.user!.id), data.user!]);
      await loadUsers();
    }
    setSavingAction(null);
  }

  async function updateUser(user: CmsUser, changes: Partial<CmsUser>, action = "settings") {
    setStatus(t.saving);
    setSavingAction(`user:${user.id}:${action}`);
    const response = await fetch("/api/cms/users", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id, ...changes }),
    });
    const data = await response.json() as { user?: CmsUser; error?: string };
    if (!response.ok || !data.user) {
      setStatus(data.error || t.failed);
      await loadUsers();
      setSavingAction(null);
      return;
    }
    setUsers((current) => current.map((item) => item.id === data.user!.id ? data.user! : item));
    const refreshed = await loadUsers();
    setStatus(refreshed ? t.saved : t.failed);
    setSavingAction(null);
  }

  function setUserPermission(user: CmsUser, resourceKey: string, kind: "content" | "leads", level: string) {
    const permissions = resources.map((resource) => {
      const current = permissionFor(user, resource.key);
      if (resource.key !== resourceKey) return current;
      return kind === "content"
        ? { ...current, canViewContent: level === "view" || level === "edit", canEditContent: level === "edit" }
        : { ...current, canViewLeads: level === "view" || level === "manage", canManageLeads: level === "manage" };
    });
    void updateUser(user, { permissions } as Partial<CmsUser>, `permission:${resourceKey}:${kind}`);
  }

  const normalizedSearch = contentSearch.trim().toLocaleLowerCase();
  const visibleMarketEntries = marketCopyEntries.filter((entry) =>
    !normalizedSearch ||
    entry.label.toLocaleLowerCase().includes(normalizedSearch) ||
    entry.en.toLocaleLowerCase().includes(normalizedSearch) ||
    entry.fr.toLocaleLowerCase().includes(normalizedSearch)
  );
  const marketGroups = Object.keys(marketGroupLabels).filter((group) =>
    visibleMarketEntries.some((entry) => entry.group === group)
  );
  const currentMarketSection = tab === "canada" ? "market.ca" : tab === "quebec" ? "market.ca-qc" : "market.ca-on";
  const marketDraftCount = Object.keys(drafts).filter((key) => key.startsWith(`${currentMarketSection}.`)).length;
  const sectionGroups = tab === "market" || tab === "quebec" || tab === "canada"
    ? marketGroups.map((group) => ({
        section: currentMarketSection,
        label: marketGroupLabels[group]?.[uiLocale] || group,
        fields: visibleMarketEntries
          .filter((entry) => entry.group === group)
          .map((entry) => [
            entry.field,
            locale === "fr-CA" ? entry.fr : entry.en,
            entry.label,
          ] as const),
      }))
    : [
        { section: "translation", label: t.homeSection, fields: globalFields.translation },
        { section: "company", label: t.companySection, fields: globalFields.company },
      ];

  const businessLabels = {
    "spaplus-global": { en: "SpaPlus Global", he: "ספא פלוס העולמית", "fr-CA": "SpaPlus Global" },
    vila4u: { en: "Vila4U Group", he: "קבוצת וילה פור יו", "fr-CA": "Groupe Vila4U" },
  } as const;
  const resourceBusinesses = Array.from(new Set(resources.map((resource) => resource.business)));

  if (role !== "owner" && !hasContentAccess) {
    return (
      <section className="cms-content" dir={direction} lang={uiLocale}>
        <div className="cms-status" role="status">
          <a href={hasLeadAccess ? leadsOnlyHref : "/access-denied"}>
            {uiLocale === "he" ? "מעבר לאזור המורשה" : uiLocale === "fr-CA" ? "Accéder à la zone autorisée" : "Continue to your authorized area"}
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="cms-content" dir={direction} lang={uiLocale} data-release="2026-08-01-b">
      <div className="cms-intro">
        <div><p>{t.eyebrow}</p><h1>{t.title}</h1></div>
        <a className="cms-preview" href={tab === "canada" ? "/en-ca/canada/" : tab === "quebec" ? "/en-ca/quebec/" : tab === "market" ? "/en-ca/ontario/" : "https://spaplus.co/"} target="_blank" rel="noreferrer">{t.preview}</a>
      </div>
      <nav className="cms-tabs" aria-label={t.eyebrow}>
        {canViewGlobalContent ? <button className={tab === "global" ? "active" : ""} onClick={() => setTab("global")}>{t.global}</button> : null}
        {canViewCanadaContent ? <button className={tab === "canada" ? "active" : ""} onClick={() => setTab("canada")}>{t.canada}</button> : null}
        {canViewQuebecContent ? <button className={tab === "quebec" ? "active" : ""} onClick={() => setTab("quebec")}>{t.quebec}</button> : null}
        {canViewMarketContent ? <button className={tab === "market" ? "active" : ""} onClick={() => setTab("market")}>{t.market}</button> : null}
        {canViewSpaPreviews ? <a href="/admin/spa-previews">{t.spaPreviews}</a> : null}
        {role === "owner" ? <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>{t.users}</button> : null}
        {resources.some((resource) => can(resource.key, "canViewLeads")) ? <a href="/tools">{t.leads}</a> : null}
        {role === "owner" || canReportBugs ? <a href="/admin/bugs">{t.bugs}</a> : null}
        {role === "owner" ? <a href="/admin/projects">{uiLocale === "he" ? "הפרויקטים של אדיר" : uiLocale === "fr-CA" ? "Projets d’Adir" : "Adir’s projects"}</a> : null}
        {role === "owner" || resources.some((resource) => resource.type === "operations" && can(resource.key, "canViewContent")) ? <a className="cms-operations-link" href="/admin/operations">{uiLocale === "he" ? "ניהול בתי ספא" : uiLocale === "fr-CA" ? "Gestion des spas" : "Spa operations"}</a> : null}
      </nav>
      {status ? <div className={`cms-status${savingAction ? " is-saving" : ""}`} role="status" aria-live="polite">{savingAction ? <i className="cms-spinner" aria-hidden="true" /> : null}{status}</div> : null}

      {tab !== "users" ? (
        <>
          <div className="cms-toolbar">
            <label>{t.contentLanguage}<select value={locale} onChange={(event) => setLocale(event.target.value)}>{contentLocaleOptions.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select></label>
            <span>{t.languageNote}</span>
          </div>
          {tab === "market" || tab === "quebec" || tab === "canada" ? <div className="cms-market-tools">
            <input type="search" value={contentSearch} onChange={(event) => setContentSearch(event.target.value)} placeholder={t.searchContent} aria-label={t.searchContent} />
            <strong>{visibleMarketEntries.length} {t.fields}</strong>
            {can(resourceKey, "canEditContent") ? <button className={savingAction === "content:all" ? "is-loading" : ""} type="button" disabled={contentLoading || !marketDraftCount || Boolean(savingAction)} onClick={() => void saveAllMarketChanges()}>{savingAction === "content:all" ? <><i className="cms-spinner" aria-hidden="true" />{t.saving}</> : <>{t.saveAll}{marketDraftCount ? ` (${marketDraftCount})` : ""}</>}</button> : null}
          </div> : null}
          {sectionGroups.map((group, index) => {
            const fields = <div className="cms-fields">
              {group.fields.map(([field, label, description]) => {
                const key = `${group.section}.${field}`;
                const value = drafts[key] ?? existing[key] ?? defaultValue(group.section, field);
                const showDescription = Boolean(description && description !== label);
                const isToggle = /(?:Visible|Required|Enabled)$/.test(field);
                return <label key={key}><span>{showDescription ? description : label}</span>{showDescription ? <small>{label}</small> : null}{isToggle ? <input type="checkbox" checked={value === "true"} disabled={contentLoading || !can(resourceKey, "canEditContent")} onChange={(event) => setDrafts((current) => ({ ...current, [key]: event.target.checked ? "true" : "false" }))} /> : <textarea value={value} rows={value.length > 130 ? 5 : 2} disabled={contentLoading || !can(resourceKey, "canEditContent")} onChange={(event) => setDrafts((current) => ({ ...current, [key]: event.target.value }))} />}
                  {can(resourceKey, "canEditContent") ? <button className={savingAction === `content:${key}` ? "is-loading" : ""} type="button" disabled={contentLoading || Boolean(savingAction)} onClick={() => void save(group.section, field)}>{savingAction === `content:${key}` ? <><i className="cms-spinner" aria-hidden="true" />{t.saving}</> : t.save}</button> : null}
                </label>;
              })}
            </div>;
            const heading = <h2>{group.label} <small>{group.fields.length}</small></h2>;
            return tab === "market" || tab === "quebec" || tab === "canada"
              ? <details className="cms-card cms-copy-group" key={`${group.section}-${group.label}`} open={Boolean(normalizedSearch) || index === 0}><summary>{heading}</summary>{fields}</details>
              : <div className="cms-card" key={`${group.section}-${group.label}`}>{heading}{fields}</div>;
          })}
        </>
      ) : (
        <div className="cms-card">
          <h2>{t.usersTitle}</h2><p className="cms-security-note">{t.security}</p>
          <div className="cms-add-user">
            <input placeholder={t.fullName} value={newUser.displayName} onChange={(event) => setNewUser({ ...newUser, displayName: event.target.value })} />
            <input type="email" placeholder={t.email} dir="ltr" value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} />
            <select value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value })}><option value="editor">{t.editor}</option><option value="viewer">{t.viewer}</option><option value="owner">{t.owner}</option></select>
            <select aria-label={t.systemLanguage} value={newUser.systemLocale} onChange={(event) => setNewUser({ ...newUser, systemLocale: event.target.value as "en" | "he" | "fr-CA" })}>{systemLanguageOptions.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select>
            <select aria-label={t.defaultContentLanguage} value={newUser.defaultLocale} onChange={(event) => setNewUser({ ...newUser, defaultLocale: event.target.value as Locale })}>{localeOptions.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select>
            <label className="cms-bug-permission"><input type="checkbox" checked={newUser.canReportBugs} onChange={(event) => setNewUser({ ...newUser, canReportBugs: event.target.checked })} />{t.bugAccess}</label>
            <button className={savingAction === "user:new" ? "is-loading" : ""} disabled={Boolean(savingAction)} onClick={() => void addUser()}>{savingAction === "user:new" ? <><i className="cms-spinner" aria-hidden="true" />{t.saving}</> : t.add}</button>
          </div>
          <div className="cms-user-list">
            {users.map((user) => <article className={`cms-user-card${savingAction?.startsWith(`user:${user.id}:`) ? " is-saving" : ""}`} aria-busy={savingAction?.startsWith(`user:${user.id}:`) || undefined} key={user.id}>
              <div className="cms-user-identity"><strong>{user.displayName || user.email}</strong><span dir="ltr">{user.email}</span></div>
              <div className="cms-user-settings">
                <label>{t.systemLanguage}<select disabled={Boolean(savingAction)} value={user.systemLocale} onChange={(event) => void updateUser(user, { systemLocale: event.target.value as CmsUser["systemLocale"] }, "system-language")}>{systemLanguageOptions.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select></label>
                <label>{t.defaultContentLanguage}<select disabled={Boolean(savingAction)} value={user.defaultLocale} onChange={(event) => void updateUser(user, { defaultLocale: event.target.value as Locale }, "content-language")}>{localeOptions.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select></label>
                <label>{t.users}<select disabled={Boolean(savingAction)} value={user.role} onChange={(event) => void updateUser(user, { role: event.target.value as AdminRole }, "role") }><option value="owner">{t.owner}</option><option value="editor">{t.editor}</option><option value="viewer">{t.viewer}</option></select></label>
                <label>{t.bugAccess}<select disabled={Boolean(savingAction)} value={user.canReportBugs ? "yes" : "no"} onChange={(event) => void updateUser(user, { canReportBugs: event.target.value === "yes" }, "bugs")}><option value="yes">{t.allowed}</option><option value="no">{t.notAllowed}</option></select></label>
              </div>
              <div className="cms-permission-grid">
                {resourceBusinesses.map((business) => <section className="cms-business-permissions" key={business}>
                  <h3>{businessLabels[business as keyof typeof businessLabels]?.[uiLocale] || business}</h3>
                  {resources.filter((resource) => resource.business === business).map((resource) => {
                  const permission = permissionFor(user, resource.key);
                  const contentLevel = permission.canEditContent ? "edit" : permission.canViewContent ? "view" : "none";
                  const leadLevel = permission.canManageLeads ? "manage" : permission.canViewLeads ? "view" : "none";
                  return <div className="cms-permission-row" key={resource.key}>
                    <strong>{resource.labels[uiLocale]}</strong>
                    {resource.type === "site" || resource.type === "market" || resource.type === "operations" ? <label>{resource.type === "operations" ? (uiLocale === "he" ? "הרשאת דשבורד" : uiLocale === "fr-CA" ? "Accès au tableau" : "Dashboard access") : t.contentAccess}<select disabled={Boolean(savingAction)} value={contentLevel} onChange={(event) => setUserPermission(user, resource.key, "content", event.target.value)}><option value="none">{t.none}</option><option value="view">{t.view}</option><option value="edit">{t.edit}</option></select></label> : null}
                    <label>{t.leadAccess}<select disabled={Boolean(savingAction)} value={leadLevel} onChange={(event) => setUserPermission(user, resource.key, "leads", event.target.value)}><option value="none">{t.none}</option><option value="view">{t.view}</option><option value="manage">{t.manage}</option></select></label>
                  </div>;
                })}</section>)}
              </div>
              {savingAction?.startsWith(`user:${user.id}:`) ? <div className="cms-user-saving" role="status"><i className="cms-spinner" aria-hidden="true" />{t.saving}</div> : null}
              <div className="cms-user-actions"><span>{user.status === "active" ? t.active : t.inactive}</span><button disabled={Boolean(savingAction)} onClick={() => void updateUser(user, { status: user.status === "active" ? "inactive" : "active" }, "status")}>{user.status === "active" ? t.disable : t.enable}</button></div>
            </article>)}
          </div>
        </div>
      )}
    </section>
  );
}
