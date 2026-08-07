"use client";

import { FormEvent, useEffect, useState } from "react";

type ProjectOption = { id: number; name: string };
type Bug = {
  id: number;
  projectId: number | null;
  title: string;
  description: string;
  severity: string;
  status: string;
  pageUrl: string;
  reporterName: string;
  reporterEmail: string;
  driveSyncStatus: string;
  createdAt: string;
};

const severityLabels: Record<string, string> = {
  low: "נמוכה",
  medium: "בינונית",
  high: "גבוהה",
  critical: "קריטית",
};

const statusLabels: Record<string, string> = {
  new: "חדש",
  in_progress: "בטיפול",
  fixed: "תוקן",
  closed: "נסגר",
};

const syncLabels: Record<string, string> = {
  not_configured: "החיבור לדרייב טרם הוגדר",
  pending: "ממתין לסנכרון",
  synced: "נשמר גם בדרייב",
  failed: "הסנכרון לדרייב נכשל",
};

export default function BugsClient({ isOwner, sheetUrl, syncConfigured }: { isOwner: boolean; sheetUrl: string; syncConfigured: boolean }) {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const response = await fetch("/api/cms/bugs", { cache: "no-store" });
    if (!response.ok) {
      setError("לא ניתן לטעון את דיווחי הבאגים.");
      setLoading(false);
      return;
    }
    const data = await response.json() as { bugs: Bug[]; projects: ProjectOption[] };
    setBugs(data.bugs);
    setProjects(data.projects);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const form = event.currentTarget;
    const response = await fetch("/api/cms/bugs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const result = await response.json() as { driveSyncStatus?: string };
    setBusy(false);
    if (!response.ok) {
      setError("הבאג לא נשמר. בדקו את הפרטים ונסו שוב.");
      return;
    }
    form.reset();
    setMessage(result.driveSyncStatus === "synced" ? "הבאג נשמר במערכת ובטבלת הדרייב." : "הבאג נשמר במערכת. חיבור הדרייב עדיין ממתין להשלמה.");
    await load();
  }

  async function updateStatus(id: number, status: string) {
    const response = await fetch("/api/cms/bugs", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!response.ok) setError("המצב לא נשמר.");
    else await load();
  }

  async function deleteBug(id: number) {
    const response = await fetch("/api/cms/bugs", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) setError("הדיווח לא נמחק. אם הוא כבר סונכרן לדרייב, יש לבדוק את החיבור.");
    else await load();
  }

  const openBugs = bugs.filter((bug) => !["fixed", "closed"].includes(bug.status)).length;
  const critical = bugs.filter((bug) => bug.severity === "critical" && !["fixed", "closed"].includes(bug.status)).length;
  const synced = bugs.filter((bug) => bug.driveSyncStatus === "synced").length;

  return (
    <main className="bugs-shell" dir="rtl" lang="he">
      <header className="bugs-topbar">
        <a className="bugs-brand" href="/admin"><img src="/spaplus-mark.png" alt="" /><span>מרכז הניהול</span></a>
        <nav aria-label="ניווט מערכת"><a href="/tools">לידים</a>{isOwner ? <a href="/admin/projects">פרויקטים</a> : null}<a className="is-active" href="/admin/bugs">באגים</a><a href="/admin">ניהול</a></nav>
        {sheetUrl ? <a className="sheet-link" href={sheetUrl} target="_blank" rel="noreferrer">פתיחת טבלת הבאגים בדרייב</a> : null}
      </header>

      <section className="bugs-hero">
        <div><p>דיווח מסודר שמגיע למקום הנכון</p><h1>דיווחי באגים</h1><span>כל דיווח נשמר במערכת, משויך לפרויקט ומוכן לסנכרון אוטומטי לטבלת הדרייב.</span></div>
        <div className={syncConfigured && sheetUrl ? "sync-state is-ready" : "sync-state"}><i />{syncConfigured && sheetUrl ? "החיבור לדרייב מוגדר" : "ממתין לקישור ולהגדרת החיבור"}</div>
      </section>

      <section className="bugs-metrics" aria-label="סיכום באגים">
        <article><span>פתוחים</span><strong>{openBugs}</strong></article>
        <article><span>קריטיים</span><strong>{critical}</strong></article>
        <article><span>נשמרו בדרייב</span><strong>{synced}</strong></article>
        <article><span>כל הדיווחים</span><strong>{bugs.length}</strong></article>
      </section>

      <section className="bugs-layout">
        <form className="bug-form" onSubmit={submit}>
          <div><p>דיווח חדש</p><h2>מה לא עובד?</h2></div>
          <label><span>כותרת קצרה</span><input name="title" required placeholder="למשל, כפתור השמירה לא מגיב" /></label>
          <div className="bug-form-row">
            <label><span>פרויקט</span><select name="projectId"><option value="">ללא שיוך</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
            <label><span>חומרה</span><select name="severity"><option value="medium">בינונית</option><option value="low">נמוכה</option><option value="high">גבוהה</option><option value="critical">קריטית</option></select></label>
          </div>
          <label><span>תיאור הבעיה</span><textarea name="description" required rows={4} /></label>
          <label><span>כתובת העמוד</span><input name="pageUrl" type="url" dir="ltr" placeholder="https://" /></label>
          <label><span>איך משחזרים את הבעיה?</span><textarea name="steps" rows={3} placeholder="שלב ראשון, שלב שני, ואז מה קורה" /></label>
          <div className="bug-form-row">
            <label><span>מה היה אמור לקרות?</span><textarea name="expected" rows={3} /></label>
            <label><span>מה קרה בפועל?</span><textarea name="actual" rows={3} /></label>
          </div>
          <button disabled={busy}>{busy ? "שומר..." : "שמירת הדיווח"}</button>
          {message ? <p className="form-message is-success">{message}</p> : null}
          {error ? <p className="form-message is-error">{error}</p> : null}
        </form>

        <section className="bugs-list">
          <div className="bugs-list-head"><div><p>מעקב</p><h2>הדיווחים האחרונים</h2></div>{sheetUrl ? <a href={sheetUrl} target="_blank" rel="noreferrer">קישור מהיר לדרייב</a> : null}</div>
          {loading ? <p className="empty-bugs">טוען דיווחים...</p> : null}
          {!loading && bugs.length === 0 ? <p className="empty-bugs">עדיין אין דיווחים.</p> : null}
          {bugs.map((bug) => {
            const project = projects.find((item) => item.id === bug.projectId);
            return <article className={`bug-card severity-${bug.severity}`} key={bug.id}>
              <div className="bug-card-title"><div><span>{project?.name || "ללא פרויקט"}</span><h3>{bug.title}</h3></div><b>{severityLabels[bug.severity]}</b></div>
              <p>{bug.description}</p>
              {bug.pageUrl ? <a href={bug.pageUrl} target="_blank" rel="noreferrer" dir="ltr">{bug.pageUrl}</a> : null}
              <footer>
                <span>{bug.reporterName || bug.reporterEmail}</span>
                <time>{new Date(bug.createdAt).toLocaleString("he-IL")}</time>
                <em className={`sync-${bug.driveSyncStatus}`}>{syncLabels[bug.driveSyncStatus]}</em>
                {isOwner ? <><select value={bug.status} onChange={(event) => void updateStatus(bug.id, event.target.value)}>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><button className="bug-delete" type="button" aria-label={`מחיקת ${bug.title}`} onClick={() => void deleteBug(bug.id)}>מחיקה</button></> : <strong>{statusLabels[bug.status]}</strong>}
              </footer>
            </article>;
          })}
        </section>
      </section>
    </main>
  );
}
