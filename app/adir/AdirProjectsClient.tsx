"use client";

import { type CSSProperties, FormEvent, useEffect, useMemo, useState } from "react";

type Project = {
  id: number;
  name: string;
  description: string;
  area: string;
  status: string;
  progress: number | null;
  progressSource: string;
  priority: string;
  owner: string;
  collaborators: string[];
  currentPhase: string;
  nextAction: string;
  blockers: string;
  targetDate: string | null;
  tags: string[];
  siteUrl: string;
  tasks: Array<{ id: number; title: string; status: string }>;
};

const statusLabels: Record<string, string> = {
  planned: "מתוכנן", in_progress: "בעבודה", waiting: "ממתין", review: "בבדיקה",
  nearly_done: "לקראת סיום", done: "הושלם", archived: "בארכיון",
};

const filters = [["all", "כל הפרויקטים"], ["active", "פעילים"], ["nearly_done", "לקראת סיום"], ["planned", "עתידיים"], ["done", "הושלמו"]] as const;

export default function AdirProjectsClient() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadProjects() {
    const response = await fetch("/api/projects", { cache: "no-store" });
    if (response.status === 401) { setAuthenticated(false); return; }
    if (!response.ok) throw new Error("load");
    const payload = await response.json() as { projects: Project[]; updatedAt: string };
    setProjects(payload.projects);
    setUpdatedAt(payload.updatedAt);
    setAuthenticated(true);
  }

  useEffect(() => { void loadProjects().catch(() => { setAuthenticated(false); setError("לא ניתן לטעון את הפרויקטים כרגע."); }); }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = event.currentTarget;
    const password = String(new FormData(form).get("password") || "");
    try {
      const response = await fetch("/api/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
      if (!response.ok) throw new Error("login");
      form.reset(); await loadProjects();
    } catch { setError("קוד הגישה אינו נכון. נסו שוב."); }
    finally { setBusy(false); }
  }

  async function logout() {
    await fetch("/api/session", { method: "DELETE" });
    setProjects([]); setAuthenticated(false);
  }

  const visible = useMemo(() => projects.filter((project) => {
    const active = !["planned", "done", "archived"].includes(project.status);
    const matchesFilter = filter === "all" || (filter === "active" ? active : project.status === filter);
    const text = `${project.name} ${project.description} ${project.currentPhase} ${project.tags.join(" ")}`.toLocaleLowerCase("he");
    return matchesFilter && text.includes(search.trim().toLocaleLowerCase("he"));
  }), [projects, filter, search]);

  const counts = useMemo(() => ({
    active: projects.filter((project) => !["planned", "done", "archived"].includes(project.status)).length,
    nearlyDone: projects.filter((project) => project.status === "nearly_done").length,
    planned: projects.filter((project) => project.status === "planned").length,
    done: projects.filter((project) => project.status === "done").length,
  }), [projects]);

  if (authenticated === null) return <main className="adir-portal adir-state" dir="rtl" lang="he"><div className="adir-spinner" /><p>טוען את תמונת המצב...</p></main>;

  if (!authenticated) return (
    <main className="adir-portal adir-login" dir="rtl" lang="he">
      <section className="adir-login-card">
        <img src="/spaplus-mark.png" alt="" />
        <p className="adir-kicker">אזור פרטי</p>
        <h1>הפרויקטים של אדיר</h1>
        <p>תמונת מצב אחת של כל הפרויקטים, האחוזים והשלב הבא.</p>
        <form onSubmit={login}>
          <label htmlFor="project-password">קוד גישה</label>
          <input id="project-password" name="password" type="password" autoComplete="current-password" required autoFocus />
          <button disabled={busy}>{busy ? "בודק..." : "כניסה לפרויקטים"}</button>
        </form>
        {error ? <p className="adir-error" role="alert">{error}</p> : null}
        <small>הגישה מיועדת לאדיר ולרועי בלבד.</small>
      </section>
    </main>
  );

  return (
    <main className="adir-portal" dir="rtl" lang="he">
      <header className="adir-header">
        <a href="/" className="adir-brand"><img src="/spaplus-mark.png" alt="" /><span>הפרויקטים של אדיר</span></a>
        <button type="button" onClick={logout}>יציאה</button>
      </header>
      <section className="adir-hero">
        <div><p className="adir-kicker">תמונת מצב חיה</p><h1>כל הפרויקטים, בעמוד אחד.</h1><p>מה פעיל, מה לקראת סיום, מה מתוכנן ומה הצעד הבא בכל פרויקט.</p></div>
        <div className="adir-total"><strong>{projects.length}</strong><span>פרויקטים במערכת</span>{updatedAt ? <small>עודכן {new Date(updatedAt).toLocaleDateString("he-IL")}</small> : null}</div>
      </section>
      <section className="adir-metrics" aria-label="סיכום פרויקטים">
        <button onClick={() => setFilter("active")}><span>פעילים</span><strong>{counts.active}</strong></button>
        <button onClick={() => setFilter("nearly_done")}><span>לקראת סיום</span><strong>{counts.nearlyDone}</strong></button>
        <button onClick={() => setFilter("planned")}><span>עתידיים</span><strong>{counts.planned}</strong></button>
        <button onClick={() => setFilter("done")}><span>הושלמו</span><strong>{counts.done}</strong></button>
      </section>
      <section className="adir-toolbar">
        <label><span>חיפוש</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="שם פרויקט או שלב" /></label>
        <div role="group" aria-label="סינון פרויקטים">{filters.map(([value, label]) => <button className={filter === value ? "is-active" : ""} key={value} onClick={() => setFilter(value)}>{label}</button>)}</div>
      </section>
      {visible.length === 0 ? <p className="adir-empty">לא נמצאו פרויקטים שמתאימים לחיפוש.</p> : null}
      <section className="adir-grid" aria-live="polite">
        {visible.map((project) => {
          const doneTasks = project.tasks.filter((task) => task.status === "done").length;
          const progress = project.progress ?? 0;
          return <article className={`adir-card priority-${project.priority}`} key={project.id}>
            <div className="adir-card-head"><div><span className={`adir-status status-${project.status}`}>{statusLabels[project.status] || project.status}</span><h2>{project.name}</h2><p>{project.description}</p></div><div className="adir-progress" style={{ "--progress": `${progress * 3.6}deg` } as CSSProperties}><strong>{project.progress === null ? "?" : `${project.progress}%`}</strong><span>{project.progressSource === "confirmed" ? "מאומת" : project.progress === null ? "טרם אומת" : "הערכה"}</span></div></div>
            <div className="adir-phase"><span>השלב הנוכחי</span><strong>{project.currentPhase || "טרם עודכן"}</strong></div>
            <div className="adir-next"><span>הצעד הבא</span><p>{project.nextAction || "טרם הוגדר"}</p></div>
            {project.blockers ? <div className="adir-blocker"><span>חסם או תלות</span><p>{project.blockers}</p></div> : null}
            <footer><div><span>משימות {doneTasks}/{project.tasks.length}</span><span>אחריות: {project.owner}</span></div>{project.siteUrl ? <a href={project.siteUrl} target="_blank" rel="noreferrer">כניסה לאתר</a> : <span className="adir-no-link">הקישור טרם הוגדר</span>}</footer>
          </article>;
        })}
      </section>
    </main>
  );
}
