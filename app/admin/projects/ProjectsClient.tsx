"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Task = {
  id: number;
  title: string;
  status: string;
  progress: number | null;
  owner: string;
};

type Note = {
  id: number;
  body: string;
  state: string;
  actorName: string;
  actorEmail: string;
  createdAt: string;
};

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
  publicVisible: boolean;
  tasks: Task[];
  notes: Note[];
};

const statusLabels: Record<string, string> = {
  planned: "מתוכנן",
  in_progress: "בעבודה",
  waiting: "ממתין",
  review: "בבדיקה",
  nearly_done: "לקראת סיום",
  done: "הושלם",
  archived: "בארכיון",
};

const priorityLabels: Record<string, string> = {
  critical: "קריטית",
  high: "גבוהה",
  medium: "בינונית",
  low: "נמוכה",
};

const areaLabels: Record<string, string> = {
  website: "אתר",
  product: "מוצר",
  automation: "אוטומציה",
  growth: "צמיחה",
  development: "פיתוח",
};

const filters = [
  ["active", "פעילים"],
  ["in_progress", "בעבודה"],
  ["review", "בבדיקה"],
  ["nearly_done", "לקראת סיום"],
  ["waiting", "ממתינים"],
  ["planned", "עתידיים"],
  ["done", "הושלמו"],
  ["all", "הכול"],
] as const;

export default function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");
  const [showAdd, setShowAdd] = useState(false);
  const [busyKey, setBusyKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [accessConfigured, setAccessConfigured] = useState(false);
  const [accessMessage, setAccessMessage] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/cms/projects", { cache: "no-store" });
      if (!response.ok) throw new Error("load");
      const payload = await response.json() as { projects: Project[]; accessConfigured: boolean };
      setProjects(payload.projects);
      setAccessConfigured(payload.accessConfigured);
    } catch {
      setError("לא ניתן לטעון כרגע את הפרויקטים. נסו לרענן את העמוד.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const savedView = window.localStorage.getItem("projects-view-mode");
    if (savedView === "list" || savedView === "grid") setViewMode(savedView);
    void load();
  }, []);

  function changeView(mode: "grid" | "list") {
    setViewMode(mode);
    window.localStorage.setItem("projects-view-mode", mode);
  }

  async function request(method: "POST" | "PATCH" | "DELETE", body: Record<string, unknown>, key: string) {
    setBusyKey(key);
    setSavedKey("");
    setError("");
    try {
      const response = await fetch("/api/cms/projects", {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
      if (!response.ok) throw new Error("save");
      setSavedKey(key);
      window.setTimeout(() => setSavedKey((current) => current === key ? "" : current), 1800);
      return payload;
    } catch {
      setError("השינוי לא נשמר. נסו שוב.");
      return null;
    } finally {
      setBusyKey("");
    }
  }

  async function update(kind: "project" | "task" | "note", id: number, changes: Record<string, unknown>) {
    const snapshot = projects;
    setProjects((items) => items.map((project) => {
      if (kind === "project" && project.id === id) return { ...project, ...changes } as Project;
      if (kind === "task") return { ...project, tasks: project.tasks.map((task) => task.id === id ? { ...task, ...changes } : task) };
      if (kind === "note") return { ...project, notes: project.notes.map((note) => note.id === id ? { ...note, ...changes } : note) };
      return project;
    }));
    const result = await request("PATCH", { kind, id, changes }, `${kind}:${id}`);
    if (!result) setProjects(snapshot);
    return Boolean(result);
  }

  async function addProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const saved = await request("POST", Object.fromEntries(data), "project:new");
    const project = saved?.project as Project | undefined;
    if (project) {
      setProjects((items) => [...items, project]);
      setShowAdd(false);
      form.reset();
    }
  }

  async function saveAccessPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = String(new FormData(form).get("password") || "");
    const saved = await request("POST", { kind: "access_password", password }, "access:password");
    if (saved) {
      setAccessConfigured(true);
      setAccessMessage("קוד הגישה נשמר. הדף הפרטי מוכן לאדיר ולרועי.");
      form.reset();
      window.setTimeout(() => setAccessMessage(""), 4000);
    }
  }

  async function addTask(event: FormEvent<HTMLFormElement>, projectId: number) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const saved = await request("POST", {
      kind: "task",
      projectId,
      title: data.get("title"),
      owner: data.get("owner") || "אדיר",
    }, `task:new:${projectId}`);
    const task = saved?.task as Task | undefined;
    if (task) {
      setProjects((items) => items.map((project) => project.id === projectId ? { ...project, tasks: [...project.tasks, task] } : project));
      form.reset();
    }
  }

  async function addNote(event: FormEvent<HTMLFormElement>, projectId: number) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const saved = await request("POST", {
      kind: "note",
      projectId,
      body: data.get("body"),
      state: data.get("state"),
    }, `note:new:${projectId}`);
    const note = saved?.note as Note | undefined;
    if (note) {
      setProjects((items) => items.map((project) => project.id === projectId ? { ...project, notes: [note, ...project.notes] } : project));
      form.reset();
    }
  }

  async function deleteItem(kind: "task" | "note", id: number) {
    const snapshot = projects;
    setProjects((items) => items.map((project) => kind === "task"
      ? { ...project, tasks: project.tasks.filter((task) => task.id !== id) }
      : { ...project, notes: project.notes.filter((note) => note.id !== id) }));
    const result = await request("DELETE", { kind, id }, `${kind}:${id}`);
    if (!result) setProjects(snapshot);
  }

  const visible = useMemo(() => projects.filter((project) => {
    const haystack = `${project.name} ${project.description} ${project.currentPhase} ${project.nextAction} ${project.tags.join(" ")}`.toLocaleLowerCase();
    const matchesSearch = haystack.includes(search.trim().toLocaleLowerCase());
    const matchesFilter = filter === "all"
      || (filter === "active" && !["done", "archived", "planned"].includes(project.status))
      || project.status === filter;
    return matchesSearch && matchesFilter;
  }), [projects, search, filter]);

  const counts = useMemo(() => {
    const active = projects.filter((project) => !["done", "archived", "planned"].includes(project.status));
    const done = projects.filter((project) => project.status === "done");
    const planned = projects.filter((project) => project.status === "planned");
    const waiting = projects.filter((project) => project.status === "waiting");
    const known = projects.filter((project) => project.progress !== null);
    const tasks = projects.flatMap((project) => project.tasks);
    return {
      active: active.length,
      done: done.length,
      planned: planned.length,
      waiting: waiting.length,
      knownAverage: known.length ? Math.round(known.reduce((sum, project) => sum + Number(project.progress), 0) / known.length) : 0,
      doneTasks: tasks.filter((task) => task.status === "done").length,
      totalTasks: tasks.length,
    };
  }, [projects]);

  return (
    <main className="projects-shell" dir="rtl" lang="he">
      <header className="projects-topbar">
        <a className="projects-brand" href="/admin"><img src="/spaplus-mark.png" alt="" /><span>מרכז הניהול</span></a>
        <nav aria-label="ניווט מערכת">
          <a href="/tools">לידים</a>
          <a className="is-active" href="/admin/projects">פרויקטים</a>
          <a href="/admin/bugs">באגים</a>
          <a href="/admin">ניהול</a>
        </nav>
        <a className="projects-logout" href="/auth/logout?return_to=/">יציאה</a>
      </header>

      <section className="projects-hero">
        <div>
          <p className="projects-kicker">תמונת מצב אחת, בלי לחפש בין משימות</p>
          <h1>הפרויקטים של אדיר</h1>
          <p>פרויקטים, משימות, הערות, חסמים ותכנון עתידי במקום אחד.</p>
        </div>
        <div className="projects-hero-actions"><a href="https://adir.spaplus.co" target="_blank" rel="noreferrer">צפייה בדף הפרטי</a><button type="button" onClick={() => setShowAdd(true)}>פרויקט חדש</button></div>
      </section>

      <section className="projects-metrics" aria-label="סיכום פרויקטים">
        <button type="button" onClick={() => setFilter("active")}><span>פעילים</span><strong>{counts.active}</strong><small>בעבודה כרגע</small></button>
        <button type="button" onClick={() => setFilter("done")}><span>הושלמו</span><strong>{counts.done}</strong><small>פרויקטים שנסגרו</small></button>
        <button type="button" onClick={() => setFilter("planned")}><span>עתידיים</span><strong>{counts.planned}</strong><small>מתוכננים להמשך</small></button>
        <button type="button" onClick={() => setFilter("waiting")}><span>ממתינים</span><strong>{counts.waiting}</strong><small>חסומים או תלויים</small></button>
        <article><span>משימות שהושלמו</span><strong>{counts.doneTasks}/{counts.totalTasks}</strong><small>בכל הפרויקטים</small></article>
        <article><span>התקדמות מאומתת</span><strong>{counts.knownAverage}%</strong><small>רק מפרויקטים עם אחוז</small></article>
      </section>

      <section className="projects-access-panel" aria-labelledby="projects-access-title">
        <div><p>גישה משותפת</p><h2 id="projects-access-title">הדף הפרטי של אדיר ורועי</h2><span>{accessConfigured ? "קוד גישה פעיל. אפשר להחליף אותו בכל עת." : "עדיין לא הוגדר קוד גישה לדף."}</span></div>
        <form onSubmit={saveAccessPassword}><label><span>{accessConfigured ? "קוד גישה חדש" : "הגדרת קוד גישה"}</span><input name="password" type="password" minLength={8} maxLength={128} autoComplete="new-password" required placeholder="לפחות שמונה תווים" /></label><button disabled={busyKey === "access:password"}>{busyKey === "access:password" ? "שומר..." : accessConfigured ? "החלפת הקוד" : "שמירת הקוד"}</button></form>
        {accessMessage ? <p className="projects-access-message" role="status">{accessMessage}</p> : null}
      </section>

      <section className="portfolio-line" aria-label="מצב תיק הפרויקטים">
        {["in_progress", "review", "nearly_done", "waiting", "planned", "done"].map((status) => {
          const count = projects.filter((project) => project.status === status).length;
          return <button key={status} type="button" onClick={() => setFilter(status)}><i className={`dot status-${status}`} />{statusLabels[status]} <b>{count}</b></button>;
        })}
      </section>

      <section className="projects-toolbar">
        <label><span>חיפוש</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="שם פרויקט, שלב, משימה או תגית" /></label>
        <div className="projects-filters" role="group" aria-label="סינון לפי מצב">
          {filters.map(([value, label]) => <button className={filter === value ? "is-active" : ""} key={value} type="button" onClick={() => setFilter(value)}>{label}</button>)}
        </div>
        <div className="view-switch" role="group" aria-label="סוג תצוגה">
          <button className={viewMode === "grid" ? "is-active" : ""} type="button" onClick={() => changeView("grid")}>כרטיסים</button>
          <button className={viewMode === "list" ? "is-active" : ""} type="button" onClick={() => changeView("list")}>רשימה</button>
        </div>
      </section>

      {error ? <p className="projects-message is-error" role="alert">{error}</p> : null}
      {loading ? <section className="projects-loading" aria-label="טוען את תמונת המצב" aria-busy="true"><article /><article /><article /><article /></section> : null}
      {!loading && visible.length === 0 ? <p className="projects-message">לא נמצאו פרויקטים שמתאימים לסינון.</p> : null}

      <section className={`projects-grid is-${viewMode}`} aria-busy={loading}>
        {visible.map((project) => {
          const doneTasks = project.tasks.filter((task) => task.status === "done").length;
          const projectKey = `project:${project.id}`;
          return (
            <article className={`project-card priority-${project.priority}`} key={project.id}>
              <div className={`project-save-state ${busyKey === projectKey ? "is-saving" : savedKey === projectKey ? "is-saved" : ""}`} role="status" aria-live="polite">
                {busyKey === projectKey ? <><i />שומר...</> : savedKey === projectKey ? "נשמר" : null}
              </div>
              <div className="project-card-head">
                <div>
                  <div className="project-badges">
                    <span className={`status-${project.status}`}>{statusLabels[project.status]}</span>
                    <span>{areaLabels[project.area] || project.area}</span>
                    <span>עדיפות {priorityLabels[project.priority]}</span>
                  </div>
                  <h2>{project.name}</h2>
                  <p>{project.description}</p>
                </div>
                <div className="project-progress" aria-label={project.progress === null ? "התקדמות לא אומתה" : `${project.progress} אחוז`}>
                  <strong>{project.progress === null ? "?" : `${project.progress}%`}</strong>
                  <span>{project.progressSource === "confirmed" ? "אושר על ידך" : project.progress === null ? "דורש אימות" : "הערכה"}</span>
                </div>
              </div>

              <div className="progress-track"><i style={{ width: `${project.progress || 0}%` }} /></div>

              <div className="project-detail-grid">
                <label><span>השלב הנוכחי</span><textarea defaultValue={project.currentPhase} onBlur={(event) => { if (event.target.value !== project.currentPhase) void update("project", project.id, { currentPhase: event.target.value }); }} /></label>
                <label><span>הצעד הבא</span><textarea defaultValue={project.nextAction} onBlur={(event) => { if (event.target.value !== project.nextAction) void update("project", project.id, { nextAction: event.target.value }); }} /></label>
              </div>

              <label className="project-blocker">
                <span>חסם או תלות</span>
                <textarea defaultValue={project.blockers} placeholder="אין חסם כרגע" onBlur={(event) => { if (event.target.value !== project.blockers) void update("project", project.id, { blockers: event.target.value }); }} />
              </label>

              <div className="project-people">
                <span>אחריות: {project.owner}</span>
                {project.collaborators.length ? <span>שותפים: {project.collaborators.join(", ")}</span> : null}
              </div>

              <div className="project-public-settings">
                <label><span>קישור כניסה לאתר</span><input type="url" defaultValue={project.siteUrl} placeholder="https://" onBlur={(event) => { if (event.target.value !== project.siteUrl) void update("project", project.id, { siteUrl: event.target.value }); }} /></label>
                <label className="project-visible-toggle"><input type="checkbox" checked={project.publicVisible} onChange={(event) => void update("project", project.id, { publicVisible: event.target.checked })} /><span>הצגה בדף הפרטי</span></label>
              </div>

              <details className="project-section" open={project.name.startsWith("BizOnline")}>
                <summary>משימות <b>{doneTasks}/{project.tasks.length}</b></summary>
                <div className="task-list">
                  {project.tasks.map((task) => (
                    <div className="task-row" key={task.id}>
                      <input aria-label={`סימון ${task.title}`} type="checkbox" disabled={busyKey === `task:${task.id}`} checked={task.status === "done"} onChange={() => void update("task", task.id, { status: task.status === "done" ? "planned" : "done", progress: task.status === "done" ? null : 100 })} />
                      <span className={task.status === "done" ? "is-done" : ""}>{task.title}</span>
                      <small>{task.owner}</small>
                      <button type="button" disabled={busyKey === `task:${task.id}`} onClick={() => void deleteItem("task", task.id)} aria-label={`מחיקת ${task.title}`}>מחיקה</button>
                    </div>
                  ))}
                </div>
                <form className="inline-add" onSubmit={(event) => void addTask(event, project.id)}>
                  <input name="title" required placeholder="משימה חדשה" />
                  <input name="owner" placeholder="אחראי, ברירת מחדל אדיר" />
                  <button disabled={busyKey === `task:new:${project.id}`}>{busyKey === `task:new:${project.id}` ? "מוסיף..." : "הוספת משימה"}</button>
                </form>
              </details>

              <details className="project-section notes-section">
                <summary>הערות <b>{project.notes.length}</b></summary>
                <div className="notes-list">
                  {project.notes.length === 0 ? <p>עדיין אין הערות בפרויקט.</p> : project.notes.map((note) => (
                    <article className={note.state === "important" ? "is-important" : ""} key={note.id}>
                      <p>{note.body}</p>
                      <footer><span>{note.actorName || note.actorEmail}</span><time>{new Date(note.createdAt).toLocaleString("he-IL")}</time><button type="button" disabled={busyKey === `note:${note.id}`} onClick={() => void deleteItem("note", note.id)}>מחיקה</button></footer>
                    </article>
                  ))}
                </div>
                <form className="note-add" onSubmit={(event) => void addNote(event, project.id)}>
                  <textarea name="body" required placeholder="כתיבת הערה לפרויקט" />
                  <label><input type="checkbox" name="state" value="important" />הערה חשובה</label>
                  <button disabled={busyKey === `note:new:${project.id}`}>{busyKey === `note:new:${project.id}` ? "שומר..." : "שמירת הערה"}</button>
                </form>
              </details>

              <div className="project-actions">
                <label><span>מצב</span><select disabled={busyKey === projectKey} value={project.status} onChange={(event) => void update("project", project.id, { status: event.target.value })}>{Object.entries(statusLabels).filter(([key]) => key !== "archived").map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
                <label><span>התקדמות</span><input disabled={busyKey === projectKey} min="0" max="100" type="number" value={project.progress ?? ""} placeholder="לא ידוע" onBlur={(event) => void update("project", project.id, { progress: event.target.value, progressSource: event.target.value ? "confirmed" : "unknown" })} onChange={(event) => setProjects((items) => items.map((item) => item.id === project.id ? { ...item, progress: event.target.value === "" ? null : Number(event.target.value) } : item))} /></label>
                <label><span>תאריך יעד</span><input disabled={busyKey === projectKey} type="date" value={project.targetDate || ""} onChange={(event) => void update("project", project.id, { targetDate: event.target.value || null })} /></label>
              </div>
            </article>
          );
        })}
      </section>

      {showAdd ? (
        <div className="project-modal" role="dialog" aria-modal="true" aria-labelledby="new-project-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAdd(false); }}>
          <form onSubmit={addProject}>
            <button className="modal-close" type="button" onClick={() => setShowAdd(false)} aria-label="סגירה">×</button>
            <p>הוספה מהירה</p>
            <h2 id="new-project-title">פרויקט חדש</h2>
            <label><span>שם הפרויקט</span><input name="name" required autoFocus /></label>
            <label><span>תיאור קצר</span><textarea name="description" rows={3} /></label>
            <div className="modal-row">
              <label><span>תחום</span><select name="area"><option value="development">פיתוח</option><option value="website">אתר</option><option value="product">מוצר</option><option value="automation">אוטומציה</option><option value="growth">צמיחה</option></select></label>
              <label><span>עדיפות</span><select name="priority"><option value="medium">בינונית</option><option value="high">גבוהה</option><option value="critical">קריטית</option><option value="low">נמוכה</option></select></label>
            </div>
            <label><span>הצעד הראשון</span><input name="nextAction" /></label>
            <label><span>קישור כניסה לאתר</span><input name="siteUrl" type="url" placeholder="https://" /></label>
            <button className="modal-submit" type="submit" disabled={busyKey === "project:new"}>{busyKey === "project:new" ? "מוסיף..." : "הוספת הפרויקט"}</button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
