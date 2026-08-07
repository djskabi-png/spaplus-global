"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Task = { id: number; title: string; status: string; progress: number | null; owner: string };
type Project = {
  id: number; name: string; description: string; area: string; status: string; progress: number | null;
  progressSource: string; priority: string; owner: string; collaborators: string[]; currentPhase: string;
  nextAction: string; blockers: string; targetDate: string | null; tags: string[]; tasks: Task[];
};

const statusLabels: Record<string, string> = { planned: "מתוכנן", in_progress: "בעבודה", waiting: "ממתין", review: "בבדיקה", nearly_done: "לקראת סיום", done: "הושלם", archived: "בארכיון" };
const priorityLabels: Record<string, string> = { critical: "קריטי", high: "גבוה", medium: "בינוני", low: "נמוך" };
const areaLabels: Record<string, string> = { website: "אתר", product: "מוצר", automation: "אוטומציה", growth: "צמיחה", development: "פיתוח" };

export default function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/cms/projects", { cache: "no-store" });
      if (!response.ok) throw new Error("load");
      const payload = await response.json() as { projects: Project[] };
      setProjects(payload.projects);
    } catch { setError("לא ניתן לטעון כרגע את הפרויקטים. נסו לרענן את העמוד."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function update(kind: "project" | "task", id: number, changes: Record<string, unknown>) {
    const response = await fetch("/api/cms/projects", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind, id, changes }) });
    if (!response.ok) { setError("השינוי לא נשמר. נסו שוב."); return; }
    await load();
  }

  async function addProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const response = await fetch("/api/cms/projects", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(data)) });
    if (!response.ok) { setError("הפרויקט לא נוסף. בדקו את שם הפרויקט."); return; }
    setShowAdd(false); event.currentTarget.reset(); await load();
  }

  const visible = useMemo(() => projects.filter((project) => {
    const matchesSearch = `${project.name} ${project.description} ${project.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "active" && !["done", "archived"].includes(project.status)) || project.status === filter;
    return matchesSearch && matchesFilter;
  }), [projects, search, filter]);
  const active = projects.filter((project) => !["done", "archived"].includes(project.status));
  const known = active.filter((project) => project.progress !== null);
  const average = known.length ? Math.round(known.reduce((sum, project) => sum + Number(project.progress), 0) / known.length) : 0;
  const waiting = active.filter((project) => project.status === "waiting" || project.blockers).length;
  const nearDone = active.filter((project) => project.status === "nearly_done" || Number(project.progress) >= 85).length;

  return (
    <main className="projects-shell" dir="rtl" lang="he">
      <header className="projects-topbar">
        <a className="projects-brand" href="/admin"><img src="/spaplus-mark.png" alt="" /><span>מרכז הניהול</span></a>
        <nav aria-label="ניווט מערכת"><a href="/tools">לידים</a><a className="is-active" href="/admin/projects">הפרויקטים של אדיר</a><a href="/admin">ניהול</a></nav>
        <a className="projects-logout" href="/auth/logout?return_to=/">יציאה</a>
      </header>

      <section className="projects-hero">
        <div><p className="projects-kicker">תמונת מצב אחת, בלי לחפש בין משימות</p><h1>הפרויקטים של אדיר</h1><p>כל הפיתוחים, השלבים, התלויות והצעדים הבאים במקום אחד.</p></div>
        <button type="button" onClick={() => setShowAdd(true)}>פרויקט חדש</button>
      </section>

      <section className="projects-metrics" aria-label="סיכום פרויקטים">
        <article><span>פרויקטים פעילים</span><strong>{active.length}</strong><small>מתוך {projects.length} פרויקטים</small></article>
        <article><span>התקדמות מדווחת</span><strong>{average}%</strong><small>ממוצע של פרויקטים עם נתון מאומת</small></article>
        <article><span>לקראת סיום</span><strong>{nearDone}</strong><small>מוכנים למיקוד וסגירה</small></article>
        <article><span>חסמים ותלויות</span><strong>{waiting}</strong><small>דורשים טיפול או גורם נוסף</small></article>
      </section>

      <section className="projects-toolbar">
        <label><span>חיפוש</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="שם פרויקט, תחום או תגית" /></label>
        <div className="projects-filters" role="group" aria-label="סינון לפי מצב">
          {["active", "nearly_done", "waiting", "planned", "done", "all"].map((value) => <button className={filter === value ? "is-active" : ""} key={value} type="button" onClick={() => setFilter(value)}>{value === "active" ? "פעילים" : value === "all" ? "הכול" : statusLabels[value]}</button>)}
        </div>
      </section>

      {error ? <p className="projects-message is-error" role="alert">{error}</p> : null}
      {loading ? <p className="projects-message">טוען את תמונת המצב...</p> : null}
      {!loading && visible.length === 0 ? <p className="projects-message">לא נמצאו פרויקטים שמתאימים לסינון.</p> : null}

      <section className="projects-grid">
        {visible.map((project) => {
          const doneTasks = project.tasks.filter((task) => task.status === "done").length;
          return <article className={`project-card priority-${project.priority}`} key={project.id}>
            <div className="project-card-head"><div><div className="project-badges"><span className={`status-${project.status}`}>{statusLabels[project.status]}</span><span>{areaLabels[project.area] || project.area}</span><span>עדיפות {priorityLabels[project.priority]}</span></div><h2>{project.name}</h2><p>{project.description}</p></div><div className="project-progress" aria-label={project.progress === null ? "התקדמות לא אומתה" : `${project.progress} אחוז`}><strong>{project.progress === null ? "?" : `${project.progress}%`}</strong><span>{project.progressSource === "confirmed" ? "אושר על ידך" : project.progress === null ? "נדרש אימות" : "הערכה"}</span></div></div>
            <div className="progress-track"><i style={{ width: `${project.progress || 0}%` }} /></div>
            <div className="project-detail-grid"><div><span>השלב הנוכחי</span><strong>{project.currentPhase || "נדרש עדכון"}</strong></div><div><span>הצעד הבא</span><strong>{project.nextAction || "נדרש עדכון"}</strong></div></div>
            {project.blockers ? <div className="project-blocker"><span>חסם או תלות</span><p>{project.blockers}</p></div> : null}
            <div className="project-people"><span>אחריות: {project.owner}</span>{project.collaborators.length ? <span>שותפים: {project.collaborators.join(", ")}</span> : null}</div>
            {project.tasks.length ? <details><summary>תתי משימות <b>{doneTasks}/{project.tasks.length}</b></summary><div className="task-list">{project.tasks.map((task) => <label key={task.id}><input type="checkbox" checked={task.status === "done"} onChange={() => void update("task", task.id, { status: task.status === "done" ? "planned" : "done", progress: task.status === "done" ? null : 100 })} /><span>{task.title}</span><small>{task.owner}</small></label>)}</div></details> : null}
            <div className="project-actions"><label><span>מצב</span><select value={project.status} onChange={(event) => void update("project", project.id, { status: event.target.value })}>{Object.entries(statusLabels).filter(([key]) => key !== "archived").map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label><span>התקדמות</span><input min="0" max="100" type="number" value={project.progress ?? ""} placeholder="לא ידוע" onBlur={(event) => void update("project", project.id, { progress: event.target.value, progressSource: event.target.value ? "confirmed" : "unknown" })} onChange={(event) => setProjects((items) => items.map((item) => item.id === project.id ? { ...item, progress: event.target.value === "" ? null : Number(event.target.value) } : item))} /></label></div>
          </article>;
        })}
      </section>

      {showAdd ? <div className="project-modal" role="dialog" aria-modal="true" aria-labelledby="new-project-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAdd(false); }}><form onSubmit={addProject}><button className="modal-close" type="button" onClick={() => setShowAdd(false)} aria-label="סגירה">×</button><p>הוספה מהירה</p><h2 id="new-project-title">פרויקט חדש</h2><label><span>שם הפרויקט</span><input name="name" required autoFocus /></label><label><span>תיאור קצר</span><textarea name="description" rows={3} /></label><div className="modal-row"><label><span>תחום</span><select name="area"><option value="development">פיתוח</option><option value="website">אתר</option><option value="product">מוצר</option><option value="automation">אוטומציה</option><option value="growth">צמיחה</option></select></label><label><span>עדיפות</span><select name="priority"><option value="medium">בינונית</option><option value="high">גבוהה</option><option value="critical">קריטית</option><option value="low">נמוכה</option></select></label></div><label><span>הצעד הראשון</span><input name="nextAction" /></label><button className="modal-submit" type="submit">הוספת הפרויקט</button></form></div> : null}
    </main>
  );
}
