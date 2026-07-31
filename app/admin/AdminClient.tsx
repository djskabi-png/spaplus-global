"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { localeOptions, translations, type Locale } from "../i18n";
import companyData from "../company-data.json";

type AdminRole = "owner" | "editor" | "viewer";
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
  lastLoginAt: string | null;
};

const fields = {
  translation: [
    ["heroTitle", "כותרת ראשית"],
    ["heroTitleAccent", "הדגשה בכותרת"],
    ["heroIntro", "פתיח"],
    ["visionTitle", "כותרת החזון"],
    ["visionBodyOne", "פסקת חזון ראשונה"],
    ["visionBodyTwo", "פסקת חזון שנייה"],
    ["productsTitle", "כותרת המוצרים"],
    ["productsIntro", "פתיח המוצרים"],
    ["growthTitle", "כותרת הצמיחה"],
    ["growthBody", "תיאור הצמיחה"],
    ["storyTitle", "כותרת הסיפור"],
    ["storyBodyOne", "סיפור ההקמה"],
    ["storyBodyTwo", "המשך הסיפור"],
    ["aboutTitle", "כותרת אודות"],
    ["aboutBody", "תוכן אודות"],
    ["footerTagline", "שורת הפוטר"],
  ],
  company: [
    ["technologyTitle", "כותרת הטכנולוגיה"],
    ["technologyBody", "תיאור הטכנולוגיה"],
    ["technologyStatement", "משפט המותג"],
    ["teamTitle", "כותרת הצוות"],
    ["teamIntro", "פתיח הצוות"],
    ["contactTitle", "כותרת יצירת קשר"],
    ["contactBody", "תיאור יצירת קשר"],
    ["directEmail", "כתובת מייל"],
  ],
} as const;

export default function AdminClient({ role, defaultLocale }: { role: AdminRole; defaultLocale: string }) {
  const [tab, setTab] = useState<"content" | "users">("content");
  const [locale, setLocale] = useState<Locale>(
    localeOptions.some((option) => option.code === defaultLocale) ? defaultLocale as Locale : "en",
  );
  const [rows, setRows] = useState<CmsRow[]>([]);
  const [users, setUsers] = useState<CmsUser[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [newUser, setNewUser] = useState({
    email: "",
    displayName: "",
    role: "editor",
    defaultLocale: "en" as Locale,
  });

  const loadContent = useCallback(async () => {
    const response = await fetch(`/api/cms/content?locale=${encodeURIComponent(locale)}`);
    if (!response.ok) return;
    const data = (await response.json()) as { rows: CmsRow[] };
    setRows(data.rows);
    setDrafts({});
  }, [locale]);

  const loadUsers = useCallback(async () => {
    const response = await fetch("/api/cms/users");
    if (!response.ok) return;
    const data = (await response.json()) as { users: CmsUser[] };
    setUsers(data.users);
  }, []);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  useEffect(() => {
    if (tab === "users") void loadUsers();
  }, [tab, loadUsers]);

  const existing = useMemo(() => {
    const map: Record<string, string> = {};
    for (const row of rows) map[`${row.section}.${row.field}`] = row.value;
    return map;
  }, [rows]);

  function defaultValue(section: "translation" | "company", field: string) {
    const source =
      section === "translation"
        ? (translations[locale] as unknown as Record<string, string>)
        : (companyData.copy[locale] as unknown as Record<string, string>);
    return source[field] || "";
  }

  async function save(section: "translation" | "company", field: string) {
    const key = `${section}.${field}`;
    const value = drafts[key] ?? existing[key] ?? defaultValue(section, field);
    setStatus("שומר...");
    const response = await fetch("/api/cms/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, section, field, value }),
    });
    setStatus(response.ok ? "נשמר בהצלחה" : "השמירה נכשלה");
    if (response.ok) await loadContent();
  }

  async function addUser() {
    setStatus("שומר משתמש...");
    const response = await fetch("/api/cms/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    setStatus(response.ok ? "המשתמש נשמר" : "לא ניתן לשמור את המשתמש");
    if (response.ok) {
      setNewUser({ email: "", displayName: "", role: "editor", defaultLocale: "en" });
      await loadUsers();
    }
  }

  async function toggleUser(user: CmsUser) {
    await fetch("/api/cms/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        status: user.status === "active" ? "inactive" : "active",
      }),
    });
    await loadUsers();
  }

  async function updateUser(user: CmsUser, changes: Partial<Pick<CmsUser, "role" | "defaultLocale">>) {
    setStatus("שומר הגדרות משתמש...");
    const response = await fetch("/api/cms/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, ...changes }),
    });
    setStatus(response.ok ? "הגדרות המשתמש נשמרו" : "לא ניתן לשמור את הגדרות המשתמש");
    if (response.ok) await loadUsers();
  }

  return (
    <section className="cms-content">
      <div className="cms-intro">
        <div>
          <p>מערכת הניהול של האתר העולמי</p>
          <h1>תוכן ברור. שליטה פשוטה.</h1>
        </div>
        <a className="cms-preview" href="/" target="_blank" rel="noreferrer">
          צפייה באתר
        </a>
      </div>

      <nav className="cms-tabs" aria-label="אזורי ניהול">
        <button className={tab === "content" ? "active" : ""} onClick={() => setTab("content")}>
          תוכן האתר
        </button>
        <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>
          משתמשים והרשאות
        </button>
        <a href="/tools">פניות וטפסים</a>
      </nav>

      {status ? <div className="cms-status" role="status">{status}</div> : null}

      {tab === "content" ? (
        <>
          <div className="cms-toolbar">
            <label>
              שפה
              <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
                {localeOptions.map((option) => (
                  <option key={option.code} value={option.code}>{option.label}</option>
                ))}
              </select>
            </label>
            <span>השינויים נשמרים לשפה שנבחרה בלבד.</span>
          </div>
          {(["translation", "company"] as const).map((section) => (
            <div className="cms-card" key={section}>
              <h2>{section === "translation" ? "עמוד הבית" : "אודות, צוות ויצירת קשר"}</h2>
              <div className="cms-fields">
                {fields[section].map(([field, label]) => {
                  const key = `${section}.${field}`;
                  const value = drafts[key] ?? existing[key] ?? defaultValue(section, field);
                  return (
                    <label key={key}>
                      <span>{label}</span>
                      <textarea
                        value={value}
                        rows={value.length > 130 ? 5 : 2}
                        disabled={role === "viewer"}
                        onChange={(event) =>
                          setDrafts((current) => ({ ...current, [key]: event.target.value }))
                        }
                      />
                      {role !== "viewer" ? (
                        <button type="button" onClick={() => void save(section, field)}>
                          שמירה
                        </button>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="cms-card">
          <h2>משתמשים והרשאות</h2>
          <p className="cms-security-note">
            סיסמאות אינן נשמרות ואינן מוצגות. הכניסה מאובטחת דרך החשבון האישי של כל משתמש.
          </p>
          {role === "owner" ? (
            <div className="cms-add-user">
              <input
                placeholder="שם מלא"
                value={newUser.displayName}
                onChange={(event) => setNewUser({ ...newUser, displayName: event.target.value })}
              />
              <input
                type="email"
                placeholder="כתובת מייל"
                dir="ltr"
                value={newUser.email}
                onChange={(event) => setNewUser({ ...newUser, email: event.target.value })}
              />
              <select
                value={newUser.role}
                onChange={(event) => setNewUser({ ...newUser, role: event.target.value })}
              >
                <option value="editor">עורך</option>
                <option value="viewer">צפייה בלבד</option>
                <option value="owner">בעלים</option>
              </select>
              <select
                aria-label="שפת ברירת מחדל"
                value={newUser.defaultLocale}
                onChange={(event) => setNewUser({ ...newUser, defaultLocale: event.target.value as Locale })}
              >
                {localeOptions.map((option) => (
                  <option key={option.code} value={option.code}>{option.label}</option>
                ))}
              </select>
              <button onClick={() => void addUser()}>הוספת משתמש</button>
            </div>
          ) : null}
          <div className="cms-user-list">
            {users.map((user) => (
              <article key={user.id}>
                <div>
                  <strong>{user.displayName || user.email}</strong>
                  <span dir="ltr">{user.email}</span>
                </div>
                {role === "owner" ? (
                  <select
                    aria-label={`הרשאה עבור ${user.displayName || user.email}`}
                    value={user.role}
                    onChange={(event) => void updateUser(user, { role: event.target.value as AdminRole })}
                  >
                    <option value="owner">בעלים</option>
                    <option value="editor">עורך</option>
                    <option value="viewer">צפייה בלבד</option>
                  </select>
                ) : <span>{user.role}</span>}
                {role === "owner" ? (
                  <select
                    aria-label={`שפת ברירת מחדל עבור ${user.displayName || user.email}`}
                    value={user.defaultLocale}
                    onChange={(event) => void updateUser(user, { defaultLocale: event.target.value as Locale })}
                  >
                    {localeOptions.map((option) => (
                      <option key={option.code} value={option.code}>{option.label}</option>
                    ))}
                  </select>
                ) : <span>{user.defaultLocale}</span>}
                <span>{user.status === "active" ? "פעיל" : "לא פעיל"}</span>
                {role === "owner" ? (
                  <button onClick={() => void toggleUser(user)}>
                    {user.status === "active" ? "השבתה" : "הפעלה"}
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
