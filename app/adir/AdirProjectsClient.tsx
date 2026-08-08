"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";

type Project = {
  id: number;
  name: string;
  description: string;
  area: string;
  status: string;
  progress: number | null;
  progressSource: string;
  currentPhase: string;
  nextAction: string;
  targetDate: string | null;
  tags: string[];
  siteUrl: string;
  totalTasks: number;
  completedTasks: number;
};

const statusLabels: Record<string, string> = {
  planned: "הבא בתור",
  in_progress: "בבנייה עכשיו",
  waiting: "ממתין לשלב הבא",
  review: "בבדיקה ושיפור",
  nearly_done: "ממש לקראת סיום",
  done: "הושלם",
  archived: "מהארכיון",
};

const areaLabels: Record<string, string> = {
  website: "אתרים",
  product: "מוצרים",
  automation: "אוטומציה",
  growth: "צמיחה",
  development: "פיתוח",
};

const filters = [
  ["all", "כל הפרויקטים"],
  ["active", "בבנייה"],
  ["nearly_done", "לקראת סיום"],
  ["done", "הושלמו"],
  ["planned", "הבא בתור"],
] as const;

export default function AdirProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function loadProjects() {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/projects", { cache: "no-store" });
      if (!response.ok) throw new Error("load");
      const payload = await response.json() as { projects: Project[]; updatedAt: string };
      setProjects(payload.projects);
      setUpdatedAt(payload.updatedAt);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadProjects(); }, []);

  const visible = useMemo(() => projects.filter((project) => {
    if (filter === "all") return true;
    if (filter === "active") return !["planned", "done", "archived"].includes(project.status);
    return project.status === filter;
  }), [projects, filter]);

  const counts = useMemo(() => ({
    active: projects.filter((project) => !["planned", "done", "archived"].includes(project.status)).length,
    done: projects.filter((project) => project.status === "done").length,
    planned: projects.filter((project) => project.status === "planned").length,
  }), [projects]);

  return (
    <main className="adir-showcase" dir="rtl" lang="he">
      <a className="adir-skip" href="#projects">דילוג לפרויקטים</a>
      <header className="adir-nav">
        <a className="adir-identity" href="#top" aria-label="חזרה לראש העמוד">
          <img src="/adir-ai-empire-icon.png" alt="" />
          <span><strong>אדיר נאור</strong><small>פרויקטים, מוצרים ומהלכים</small></span>
        </a>
        <nav aria-label="ניווט ראשי">
          <a href="#projects">הפרויקטים</a>
          <a href="#about">איך אני בונה</a>
          <a className="adir-empire-link" href="https://adir-ai-empire.adir-naor-7510.chatgpt.site" target="_blank" rel="noreferrer">אימפריית אדיר</a>
        </nav>
      </header>

      <section className="adir-hero" id="top">
        <div className="adir-hero-copy">
          <p className="adir-eyebrow"><i />בונה עסקים, מוצרים ומערכות</p>
          <h1>מה כבר בניתי.<br />מה אני בונה עכשיו.<br /><em>ומה מגיע אחר כך.</em></h1>
          <p className="adir-intro">זה המקום שבו אני מרכז את הפרויקטים שמעסיקים אותי באמת. אתרים, מערכות ניהול, אוטומציות, מותגים ורעיונות שהופכים מתכנון למוצר עובד.</p>
          <div className="adir-hero-actions">
            <a href="#projects">לראות על מה אני עובד</a>
            <a href="https://adir-ai-empire.adir-naor-7510.chatgpt.site" target="_blank" rel="noreferrer">להכיר את האימפריה</a>
          </div>
        </div>
        <div className="adir-emblem" aria-label="הסמל של אימפריית אדיר">
          <span className="adir-orbit orbit-one" />
          <span className="adir-orbit orbit-two" />
          <img src="/adir-ai-empire-icon.png" alt="הסמל של אימפריית אדיר" />
          <p>חזון. בנייה. תנועה.</p>
        </div>
      </section>

      <section className="adir-numbers" aria-label="תמונת מצב">
        <article><strong>{projects.length || "—"}</strong><span>פרויקטים בתצוגה</span></article>
        <article><strong>{counts.active || "—"}</strong><span>נבנים עכשיו</span></article>
        <article><strong>{counts.done || "—"}</strong><span>כבר הושלמו</span></article>
        <article><strong>{counts.planned || "—"}</strong><span>מחכים לתורם</span></article>
      </section>

      <section className="adir-projects-section" id="projects">
        <div className="adir-section-head">
          <div><p className="adir-eyebrow"><i />תיק העבודות החי שלי</p><h2>הפרויקטים</h2><p>הרשימה משתנה יחד איתי. מה שמופיע ראשון הוא מה שאני רוצה לשים עליו את הזרקור עכשיו.</p></div>
          {updatedAt ? <time dateTime={updatedAt}>עודכן לאחרונה {new Date(updatedAt).toLocaleDateString("he-IL")}</time> : null}
        </div>

        <div className="adir-filters" role="group" aria-label="סינון פרויקטים">
          {filters.map(([value, label]) => <button type="button" className={filter === value ? "is-active" : ""} key={value} onClick={() => setFilter(value)}>{label}</button>)}
        </div>

        {loading ? <div className="adir-loading" role="status"><i /><span>טוען את הפרויקטים...</span></div> : null}
        {error ? <div className="adir-error" role="alert"><h2>הפרויקטים לא נטענו כרגע</h2><p>אפשר לנסות שוב בעוד רגע.</p><button type="button" onClick={() => void loadProjects()}>ניסיון נוסף</button></div> : null}
        {!loading && !error && visible.length === 0 ? <div className="adir-empty">אין כרגע פרויקטים בקטגוריה הזאת.</div> : null}

        <div className="adir-project-list" aria-live="polite">
          {visible.map((project, index) => {
            const progress = project.progress ?? 0;
            return (
              <article className={`adir-project ${index === 0 && filter === "all" ? "is-featured" : ""}`} key={project.id}>
                <div className="adir-project-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
                <div className="adir-project-main">
                  <div className="adir-project-meta">
                    <span className={`status-${project.status}`}>{statusLabels[project.status] || project.status}</span>
                    <span>{areaLabels[project.area] || project.area}</span>
                  </div>
                  <h3>{project.name}</h3>
                  <p className="adir-project-description">{project.description}</p>
                  <div className="adir-project-details">
                    <div><span>איפה זה עומד</span><strong>{project.currentPhase || "הפרויקט בתכנון"}</strong></div>
                    <div><span>הצעד הבא</span><strong>{project.nextAction || "השלב הבא יוגדר בקרוב"}</strong></div>
                  </div>
                  <footer>
                    <div className="adir-tags">{project.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
                    {project.siteUrl ? <a href={project.siteUrl} target="_blank" rel="noreferrer">לצפייה בפרויקט <span aria-hidden="true">↗</span></a> : null}
                  </footer>
                </div>
                <aside className="adir-project-progress">
                  <div className="adir-progress-ring" style={{ "--progress": `${progress * 3.6}deg` } as CSSProperties}>
                    <strong>{project.progress === null ? "?" : `${project.progress}%`}</strong>
                  </div>
                  <span>{project.progress === null ? "המצב מתעדכן" : project.progressSource === "confirmed" ? "התקדמות מעודכנת" : "הערכת התקדמות"}</span>
                  {project.totalTasks ? <small>{project.completedTasks} מתוך {project.totalTasks} אבני דרך הושלמו</small> : null}
                </aside>
              </article>
            );
          })}
        </div>
      </section>

      <section className="adir-manifesto" id="about">
        <div><img src="/adir-ai-empire-icon.png" alt="" /><p className="adir-eyebrow"><i />איך אני עובד</p><h2>אני אוהב לקחת רעיון גדול ולבנות לו את כל הדרך.</h2></div>
        <p>לא רק מסך יפה ולא רק קוד. אני מחבר בין המוצר, העסק, השיווק, התפעול והאנשים שצריכים לגרום לדבר הזה לעבוד בעולם האמיתי. הרשימה כאן היא תיעוד חי של הדרך הזאת.</p>
      </section>

      <footer className="adir-footer">
        <a href="#top"><img src="/adir-ai-empire-icon.png" alt="" /><span><strong>הפרויקטים של אדיר</strong><small>נבנה ומנוהל מתוך אימפריית אדיר</small></span></a>
        <p>© {new Date().getFullYear()} אדיר נאור</p>
      </footer>
    </main>
  );
}
