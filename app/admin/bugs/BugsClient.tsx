"use client";

import { FormEvent, useEffect, useState } from "react";

type ProjectOption = { id: number; name: string };
type Bug = {
  id: number;
  projectId: number | null;
  customProject: string;
  targetKey: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  pageUrl: string;
  reporterName: string;
  reporterEmail: string;
  driveSyncStatus: string;
  driveRowId: string;
  driveError: string;
  attachmentName: string;
  attachmentUrl: string;
  createdAt: string;
};

const severityLabels: Record<string, string> = { low: "נמוכה", medium: "בינונית", high: "גבוהה", critical: "קריטית" };
const statusLabels: Record<string, string> = { new: "חדש", in_progress: "בטיפול", fixed: "תוקן", closed: "נסגר" };
const syncLabels: Record<string, string> = {
  not_configured: "החיבור לדרייב טרם הוגדר",
  pending: "ממתין לסנכרון",
  synced: "נשמר גם בדרייב",
  failed: "הסנכרון לדרייב נכשל",
};
const targetLabels: Record<string, string> = {
  gal_website: "גל, אתר",
  gal_system: "גל, מערכת",
  sergey_maxim: "סרגיי ומקסים",
  maxim_roy: "מקסים ורועי",
  maor_shlomi: "מאור ושלומי",
  roy: "רועי",
  adir: "אדיר",
  galia: "גליה",
  review: "לבדיקה של אדיר",
};

function driveRowUrl(raw: string) {
  try { return String((JSON.parse(raw || "{}") as { spreadsheetUrl?: string }).spreadsheetUrl || ""); }
  catch { return ""; }
}

async function attachmentPayload(file: File | null) {
  if (!file) return null;
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  return { name: file.name, mimeType: file.type, base64: dataUrl.split(",")[1] || "" };
}

export default function BugsClient({ isOwner, sheetUrl, syncConfigured }: { isOwner: boolean; sheetUrl: string; syncConfigured: boolean }) {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
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

  useEffect(() => { void load(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProject) { setError("יש לבחור פרויקט או להזין פרויקט אחר."); return; }
    if (attachment && attachment.size > 4 * 1024 * 1024) { setError("התמונה גדולה מדי. ניתן לצרף תמונה עד ארבעה מגה."); return; }
    setBusy(true);
    setError("");
    setMessage("");
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    delete fields.attachment;
    try {
      const response = await fetch("/api/cms/bugs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...fields, projectId: selectedProject === "other" ? "" : selectedProject, attachment: await attachmentPayload(attachment) }),
      });
      const result = await response.json() as { driveSyncStatus?: string };
      if (!response.ok) { setError("הדיווח לא נשמר. בדקו שכל שדות החובה מלאים ונסו שוב."); return; }
      form.reset();
      setSelectedProject("");
      setAttachment(null);
      setMessage(result.driveSyncStatus === "synced" ? "הדיווח נשמר במערכת ונוסף ללשונית הנכונה בדרייב." : "הדיווח נשמר במערכת, אך הסנכרון לדרייב עדיין לא הושלם.");
      await load();
    } catch {
      setError("הדיווח לא נשמר. נסו שוב בעוד רגע.");
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(id: number, status: string) {
    setError("");
    const response = await fetch("/api/cms/bugs", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (!response.ok) setError("המצב לא נשמר במערכת ובדרייב.");
    else await load();
  }

  async function deleteBug(id: number) {
    setDeletingId(id);
    setError("");
    const response = await fetch("/api/cms/bugs", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    setDeletingId(null);
    if (!response.ok) setError("הדיווח לא נמחק. המחיקה נעצרה כדי למנוע חוסר התאמה מול הדרייב.");
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
        {sheetUrl ? <a className="sheet-link" href={sheetUrl} target="_blank" rel="noreferrer">פתיחת קובץ המשימות</a> : null}
      </header>

      <section className="bugs-hero">
        <div><p>דיווח מסודר שמגיע לאדם הנכון</p><h1>דיווחי באגים</h1><span>הדיווח נשמר כאן, והתוכן המלא עובר אוטומטית ללשונית שבחרתם בקובץ המשימות.</span></div>
        <div className={syncConfigured && sheetUrl ? "sync-state is-ready" : "sync-state"}><i />{syncConfigured && sheetUrl ? "מחובר לקובץ המשימות" : "החיבור לקובץ עדיין לא פעיל"}</div>
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
          <label><span>כותרת קצרה</span><input name="title" required maxLength={180} placeholder="למשל, כפתור השמירה לא מגיב" /></label>
          <div className="bug-form-row">
            <label><span>פרויקט</span><select name="projectChoice" required value={selectedProject} onChange={(event) => setSelectedProject(event.target.value)}><option value="">בחירת פרויקט</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}<option value="other">פרויקט אחר</option></select></label>
            <label><span>למי להעביר</span><select name="targetKey" required defaultValue=""><option value="">בחירת אחראי או צוות</option>{Object.entries(targetLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          </div>
          {selectedProject === "other" ? <label className="custom-project"><span>שם הפרויקט האחר</span><input name="customProject" required maxLength={180} placeholder="כתבו את שם הפרויקט" /></label> : null}
          <label><span>חומרה</span><select name="severity" defaultValue="medium"><option value="medium">בינונית</option><option value="low">נמוכה</option><option value="high">גבוהה</option><option value="critical">קריטית</option></select></label>
          <label><span>תיאור הבעיה</span><textarea name="description" required rows={4} maxLength={5000} /></label>
          <label><span>כתובת העמוד</span><input name="pageUrl" type="url" dir="ltr" placeholder="https://" /></label>
          <label><span>איך משחזרים את הבעיה?</span><textarea name="steps" rows={3} placeholder="שלב ראשון, שלב שני, ואז מה קורה" /></label>
          <div className="bug-form-row">
            <label><span>מה היה אמור לקרות?</span><textarea name="expected" rows={3} /></label>
            <label><span>מה קרה בפועל?</span><textarea name="actual" rows={3} /></label>
          </div>
          <label className="attachment-field"><span>צילום מסך</span><input name="attachment" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setAttachment(event.target.files?.[0] || null)} /><small>{attachment ? `${attachment.name}, ${Math.ceil(attachment.size / 1024)} קילובייט` : "קובץ תמונה אחד, עד ארבעה מגה"}</small></label>
          <button disabled={busy}>{busy ? "שומר ומעביר לדרייב..." : "שמירת הדיווח והעברה לאחראי"}</button>
          {message ? <p className="form-message is-success">{message}</p> : null}
          {error ? <p className="form-message is-error">{error}</p> : null}
        </form>

        <section className="bugs-list">
          <div className="bugs-list-head"><div><p>מעקב</p><h2>הדיווחים האחרונים</h2></div>{sheetUrl ? <a href={sheetUrl} target="_blank" rel="noreferrer">קישור מהיר לקובץ</a> : null}</div>
          {loading ? <p className="empty-bugs">טוען דיווחים...</p> : null}
          {!loading && bugs.length === 0 ? <p className="empty-bugs">עדיין אין דיווחים.</p> : null}
          {bugs.map((bug) => {
            const project = projects.find((item) => item.id === bug.projectId);
            const rowUrl = driveRowUrl(bug.driveRowId);
            return <article className={`bug-card severity-${bug.severity}`} key={bug.id}>
              <div className="bug-card-title"><div><span>{project?.name || bug.customProject}</span><h3>{bug.title}</h3></div><b>{severityLabels[bug.severity]}</b></div>
              <p>{bug.description}</p>
              <div className="bug-routing"><span>הועבר אל</span><strong>{targetLabels[bug.targetKey] || bug.targetKey}</strong></div>
              <div className="bug-links">{bug.pageUrl ? <a href={bug.pageUrl} target="_blank" rel="noreferrer">פתיחת העמוד</a> : null}{bug.attachmentUrl ? <a href={bug.attachmentUrl} target="_blank" rel="noreferrer">פתיחת צילום המסך</a> : null}{rowUrl ? <a href={rowUrl} target="_blank" rel="noreferrer">פתיחת השורה בדרייב</a> : null}</div>
              <footer>
                <span>{bug.reporterName || bug.reporterEmail}</span>
                <time>{new Date(bug.createdAt).toLocaleString("he-IL")}</time>
                <em className={`sync-${bug.driveSyncStatus}`} title={bug.driveError}>{syncLabels[bug.driveSyncStatus]}</em>
                {isOwner ? <><select aria-label={`מצב הדיווח ${bug.title}`} value={bug.status} onChange={(event) => void updateStatus(bug.id, event.target.value)}>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><button disabled={deletingId === bug.id} className="bug-delete" type="button" aria-label={`מחיקת ${bug.title}`} onClick={() => void deleteBug(bug.id)}>{deletingId === bug.id ? "מוחק..." : "מחיקה"}</button></> : <strong>{statusLabels[bug.status]}</strong>}
              </footer>
            </article>;
          })}
        </section>
      </section>
    </main>
  );
}
