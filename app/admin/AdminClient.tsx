"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { localeOptions, translations, type Locale } from "../i18n";
import companyData from "../company-data.json";
import marketCopyManifest from "../market-launch/generated-market-copy.json";

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
    preview: "View website", global: "Global website", market: "Ontario page",
    users: "Users and permissions", leads: "Leads and forms", contentLanguage: "Content language",
    languageNote: "Changes apply only to the selected content language.", save: "Save",
    saving: "Saving...", saved: "Saved successfully", failed: "Unable to save",
    usersTitle: "Users and permissions", security: "Passwords are never stored here. Each user signs in with their own Google account.",
    fullName: "Full name", email: "Email address", add: "Add user", editor: "Editor",
    viewer: "View only", owner: "Owner", systemLanguage: "System language",
    defaultContentLanguage: "Default content language", active: "Active", inactive: "Inactive",
    disable: "Disable", enable: "Enable", contentAccess: "Page access", leadAccess: "Lead access",
    none: "No access", view: "View", edit: "Edit", manage: "Manage", inherited: "Legacy access",
    homeSection: "Homepage", companySection: "About, team and contact", marketSection: "Ontario campaign page",
    searchContent: "Search page text", saveAll: "Save all changes", fields: "editable fields",
  },
  he: {
    title: "תוכן ברור. הרשאות מדויקות.", eyebrow: "מערכת הניהול של ספא פלוס",
    preview: "צפייה באתר", global: "האתר העולמי", market: "עמוד אונטריו",
    users: "משתמשים והרשאות", leads: "פניות וטפסים", contentLanguage: "שפת התוכן",
    languageNote: "השינויים יחולו רק על שפת התוכן שנבחרה.", save: "שמירה",
    saving: "שומר...", saved: "נשמר בהצלחה", failed: "לא ניתן לשמור",
    usersTitle: "משתמשים והרשאות", security: "סיסמאות אינן נשמרות כאן. כל משתמש נכנס באמצעות חשבון גוגל האישי שלו.",
    fullName: "שם מלא", email: "כתובת מייל", add: "הוספת משתמש", editor: "עורך",
    viewer: "צפייה בלבד", owner: "בעלים", systemLanguage: "שפת המערכת",
    defaultContentLanguage: "שפת תוכן בברירת מחדל", active: "פעיל", inactive: "לא פעיל",
    disable: "השבתה", enable: "הפעלה", contentAccess: "הרשאת עמוד", leadAccess: "הרשאת פניות",
    none: "ללא גישה", view: "צפייה", edit: "עריכה", manage: "ניהול", inherited: "גישה קיימת",
    homeSection: "עמוד הבית", companySection: "אודות, צוות ויצירת קשר", marketSection: "עמוד הקמפיין של אונטריו",
    searchContent: "חיפוש טקסט בעמוד", saveAll: "שמירת כל השינויים", fields: "שדות לעריכה",
  },
  "fr-CA": {
    title: "Un contenu clair. Des accès précis.", eyebrow: "Gestion SpaPlus",
    preview: "Voir le site", global: "Site mondial", market: "Page Ontario",
    users: "Utilisateurs et autorisations", leads: "Demandes et formulaires", contentLanguage: "Langue du contenu",
    languageNote: "Les changements s’appliquent uniquement à la langue de contenu choisie.", save: "Enregistrer",
    saving: "Enregistrement...", saved: "Enregistré", failed: "Enregistrement impossible",
    usersTitle: "Utilisateurs et autorisations", security: "Aucun mot de passe n’est conservé ici. Chaque personne se connecte avec son propre compte Google.",
    fullName: "Nom complet", email: "Adresse courriel", add: "Ajouter", editor: "Éditeur",
    viewer: "Lecture seule", owner: "Propriétaire", systemLanguage: "Langue du système",
    defaultContentLanguage: "Langue de contenu par défaut", active: "Actif", inactive: "Inactif",
    disable: "Désactiver", enable: "Activer", contentAccess: "Accès à la page", leadAccess: "Accès aux demandes",
    none: "Aucun accès", view: "Consulter", edit: "Modifier", manage: "Gérer", inherited: "Accès existant",
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
  permissions,
  resources,
}: {
  role: AdminRole;
  defaultLocale: string;
  systemLocale: string;
  permissions: Permission[];
  resources: Resource[];
}) {
  const uiLocale = systemLocale === "he" || systemLocale === "fr-CA" ? systemLocale : "en";
  const t = uiCopy[uiLocale];
  const direction = uiLocale === "he" ? "rtl" : "ltr";
  const can = (resourceKey: string, capability: keyof Omit<Permission, "resourceKey">) =>
    role === "owner" || permissions.some((item) => item.resourceKey === resourceKey && (item[capability] || (capability === "canViewContent" && item.canEditContent) || (capability === "canViewLeads" && item.canManageLeads)));
  const initialTab = can("site:global", "canViewContent") ? "global" : "market";
  const [tab, setTab] = useState<"global" | "market" | "users">(initialTab);
  const [locale, setLocale] = useState<string>(defaultLocale);
  const [rows, setRows] = useState<CmsRow[]>([]);
  const [users, setUsers] = useState<CmsUser[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [contentSearch, setContentSearch] = useState("");
  const emptyPermissions = resources.map((resource) => ({
    resourceKey: resource.key,
    canViewContent: false,
    canEditContent: false,
    canViewLeads: false,
    canManageLeads: false,
  }));
  const [newUser, setNewUser] = useState({
    email: "", displayName: "", role: "editor", defaultLocale: "en" as Locale,
    systemLocale: "en" as "en" | "he" | "fr-CA", permissions: emptyPermissions,
  });
  const resourceKey = tab === "market" ? "market:ca:on" : "site:global";
  const contentLocaleOptions = tab === "market"
    ? [{ code: "en-CA", label: "English, Canada" }, { code: "fr-CA", label: "Français canadien" }]
    : localeOptions;

  useEffect(() => {
    if (!contentLocaleOptions.some((option) => option.code === locale)) {
      setLocale(contentLocaleOptions[0].code);
    }
  }, [tab]);

  const loadContent = useCallback(async () => {
    if (tab === "users") return;
    const response = await fetch(`/api/cms/content?locale=${encodeURIComponent(locale)}&resource=${encodeURIComponent(resourceKey)}`);
    if (!response.ok) return;
    const data = (await response.json()) as { rows: CmsRow[] };
    setRows(data.rows);
    setDrafts({});
  }, [locale, resourceKey, tab]);

  const loadUsers = useCallback(async () => {
    const response = await fetch("/api/cms/users");
    if (!response.ok) return;
    const data = (await response.json()) as { users: CmsUser[] };
    setUsers(data.users);
  }, []);

  useEffect(() => { void loadContent(); }, [loadContent]);
  useEffect(() => { if (tab === "users") void loadUsers(); }, [tab, loadUsers]);

  const existing = useMemo(() => Object.fromEntries(rows.map((row) => [`${row.section}.${row.field}`, row.value])), [rows]);

  function defaultValue(section: string, field: string) {
    if (section === "market.ca-on") {
      const entry = marketCopyEntries.find((item) => item.field === field);
      return locale === "fr-CA" ? entry?.fr || "" : entry?.en || "";
    }
    const source = section === "translation"
      ? (translations[locale as Locale] as unknown as Record<string, string>)
      : (companyData.copy[locale as Locale] as unknown as Record<string, string>);
    return source?.[field] || "";
  }

  async function save(section: string, field: string) {
    const key = `${section}.${field}`;
    const value = drafts[key] ?? existing[key] ?? defaultValue(section, field);
    setStatus(t.saving);
    const response = await fetch("/api/cms/content", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, section, field, value }),
    });
    setStatus(response.ok ? t.saved : t.failed);
    if (response.ok) await loadContent();
  }

  async function saveAllMarketChanges() {
    const changes = Object.entries(drafts).filter(([key]) => key.startsWith("market.ca-on."));
    if (!changes.length) return;
    setStatus(t.saving);
    for (const [key, value] of changes) {
      const field = key.slice("market.ca-on.".length);
      const response = await fetch("/api/cms/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, section: "market.ca-on", field, value }),
      });
      if (!response.ok) {
        setStatus(t.failed);
        return;
      }
    }
    setStatus(t.saved);
    await loadContent();
  }

  async function addUser() {
    setStatus(t.saving);
    const response = await fetch("/api/cms/users", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newUser),
    });
    setStatus(response.ok ? t.saved : t.failed);
    if (response.ok) {
      setNewUser({ email: "", displayName: "", role: "editor", defaultLocale: "en", systemLocale: "en", permissions: emptyPermissions });
      await loadUsers();
    }
  }

  async function updateUser(user: CmsUser, changes: Partial<CmsUser>) {
    setStatus(t.saving);
    const response = await fetch("/api/cms/users", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id, ...changes }),
    });
    setStatus(response.ok ? t.saved : t.failed);
    if (response.ok) await loadUsers();
  }

  function setUserPermission(user: CmsUser, resourceKey: string, kind: "content" | "leads", level: string) {
    const permissions = resources.map((resource) => {
      const current = permissionFor(user, resource.key);
      if (resource.key !== resourceKey) return current;
      return kind === "content"
        ? { ...current, canViewContent: level === "view" || level === "edit", canEditContent: level === "edit" }
        : { ...current, canViewLeads: level === "view" || level === "manage", canManageLeads: level === "manage" };
    });
    void updateUser(user, { permissions } as Partial<CmsUser>);
  }

  const normalizedSearch = contentSearch.trim().toLocaleLowerCase();
  const visibleMarketEntries = marketCopyEntries.filter((entry) =>
    !normalizedSearch ||
    entry.label.toLocaleLowerCase().includes(normalizedSearch) ||
    entry.en.toLocaleLowerCase().includes(normalizedSearch) ||
    entry.fr.toLocaleLowerCase().includes(normalizedSearch)
  );
  const marketGroups = [...new Set(visibleMarketEntries.map((entry) => entry.group))];
  const marketDraftCount = Object.keys(drafts).filter((key) => key.startsWith("market.ca-on.")).length;
  const sectionGroups = tab === "market"
    ? marketGroups.map((group) => ({
        section: "market.ca-on",
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

  return (
    <section className="cms-content" dir={direction} lang={uiLocale} data-release="2026-08-01-b">
      <div className="cms-intro">
        <div><p>{t.eyebrow}</p><h1>{t.title}</h1></div>
        <a className="cms-preview" href="/" target="_blank" rel="noreferrer">{t.preview}</a>
      </div>
      <nav className="cms-tabs" aria-label={t.eyebrow}>
        {can("site:global", "canViewContent") ? <button className={tab === "global" ? "active" : ""} onClick={() => setTab("global")}>{t.global}</button> : null}
        {can("market:ca:on", "canViewContent") ? <button className={tab === "market" ? "active" : ""} onClick={() => setTab("market")}>{t.market}</button> : null}
        {role === "owner" ? <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>{t.users}</button> : null}
        {resources.some((resource) => can(resource.key, "canViewLeads")) ? <a href="/tools">{t.leads}</a> : null}
      </nav>
      {status ? <div className="cms-status" role="status">{status}</div> : null}

      {tab !== "users" ? (
        <>
          <div className="cms-toolbar">
            <label>{t.contentLanguage}<select value={locale} onChange={(event) => setLocale(event.target.value)}>{contentLocaleOptions.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select></label>
            <span>{t.languageNote}</span>
          </div>
          {tab === "market" ? <div className="cms-market-tools">
            <input type="search" value={contentSearch} onChange={(event) => setContentSearch(event.target.value)} placeholder={t.searchContent} aria-label={t.searchContent} />
            <strong>{visibleMarketEntries.length} {t.fields}</strong>
            {can(resourceKey, "canEditContent") ? <button type="button" disabled={!marketDraftCount} onClick={() => void saveAllMarketChanges()}>{t.saveAll}{marketDraftCount ? ` (${marketDraftCount})` : ""}</button> : null}
          </div> : null}
          {sectionGroups.map((group) => <div className="cms-card" key={`${group.section}-${group.label}`}>
            <h2>{group.label} <small>{group.fields.length}</small></h2>
            <div className="cms-fields">
              {group.fields.map(([field, label, description]) => {
                const key = `${group.section}.${field}`;
                const value = drafts[key] ?? existing[key] ?? defaultValue(group.section, field);
                return <label key={key}><span>{description || label}</span>{description ? <small>{label}</small> : null}<textarea value={value} rows={value.length > 130 ? 5 : 2} disabled={!can(resourceKey, "canEditContent")} onChange={(event) => setDrafts((current) => ({ ...current, [key]: event.target.value }))} />
                  {can(resourceKey, "canEditContent") ? <button type="button" onClick={() => void save(group.section, field)}>{t.save}</button> : null}
                </label>;
              })}
            </div>
          </div>)}
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
            <button onClick={() => void addUser()}>{t.add}</button>
          </div>
          <div className="cms-user-list">
            {users.map((user) => <article className="cms-user-card" key={user.id}>
              <div className="cms-user-identity"><strong>{user.displayName || user.email}</strong><span dir="ltr">{user.email}</span></div>
              <div className="cms-user-settings">
                <label>{t.systemLanguage}<select value={user.systemLocale} onChange={(event) => void updateUser(user, { systemLocale: event.target.value as CmsUser["systemLocale"] })}>{systemLanguageOptions.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select></label>
                <label>{t.defaultContentLanguage}<select value={user.defaultLocale} onChange={(event) => void updateUser(user, { defaultLocale: event.target.value as Locale })}>{localeOptions.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select></label>
                <label>{t.users}<select value={user.role} onChange={(event) => void updateUser(user, { role: event.target.value as AdminRole })}><option value="owner">{t.owner}</option><option value="editor">{t.editor}</option><option value="viewer">{t.viewer}</option></select></label>
              </div>
              <div className="cms-permission-grid">
                {resources.map((resource) => {
                  const permission = permissionFor(user, resource.key);
                  const contentLevel = permission.canEditContent ? "edit" : permission.canViewContent ? "view" : "none";
                  const leadLevel = permission.canManageLeads ? "manage" : permission.canViewLeads ? "view" : "none";
                  return <div className="cms-permission-row" key={resource.key}>
                    <strong>{resource.labels[uiLocale]}</strong>
                    <label>{t.contentAccess}<select value={contentLevel} onChange={(event) => setUserPermission(user, resource.key, "content", event.target.value)}><option value="none">{t.none}</option><option value="view">{t.view}</option><option value="edit">{t.edit}</option></select></label>
                    <label>{t.leadAccess}<select value={leadLevel} onChange={(event) => setUserPermission(user, resource.key, "leads", event.target.value)}><option value="none">{t.none}</option><option value="view">{t.view}</option><option value="manage">{t.manage}</option></select></label>
                  </div>;
                })}
              </div>
              <div className="cms-user-actions"><span>{user.status === "active" ? t.active : t.inactive}</span><button onClick={() => void updateUser(user, { status: user.status === "active" ? "inactive" : "active" })}>{user.status === "active" ? t.disable : t.enable}</button></div>
            </article>)}
          </div>
        </div>
      )}
    </section>
  );
}
