"use client";

import { useEffect, useState } from "react";

type Project = {
  id: number;
  name: string;
  progress: number | null;
  siteUrl: string;
};

function projectLogo(siteUrl: string) {
  if (!siteUrl) return "";
  try {
    const origin = new URL(siteUrl).origin;
    return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(origin)}&sz=128`;
  } catch {
    return "";
  }
}

export default function AdirProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function loadProjects() {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/projects", { cache: "no-store" });
      if (!response.ok) throw new Error("load");
      const payload = await response.json() as { projects: Project[] };
      setProjects(payload.projects);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadProjects(); }, []);

  return (
    <main className="adir-project-page" dir="rtl" lang="he">
      <div className="adir-project-wrap">
        <header className="adir-project-header">
          <img src="/adir-ai-empire-icon.png" alt="הלוגו של אימפריית אדיר" />
          <h1>הפרויקטים של אדיר</h1>
          <p>הפרויקטים שאני עובד עליהם, לפי הסדר וההתקדמות שלהם.</p>
        </header>

        {loading ? <div className="adir-project-state" role="status">טוען פרויקטים...</div> : null}
        {error ? <div className="adir-project-state" role="alert"><span>לא הצלחתי לטעון את הפרויקטים.</span><button type="button" onClick={() => void loadProjects()}>לנסות שוב</button></div> : null}
        {!loading && !error && projects.length === 0 ? <div className="adir-project-state">אין כרגע פרויקטים להצגה.</div> : null}

        <section className="adir-project-list" aria-label="רשימת הפרויקטים">
          {projects.map((project, index) => {
            const logo = projectLogo(project.siteUrl);
            const progress = project.progress ?? 0;
            return (
              <article className="adir-project-row" key={project.id}>
                <span className="adir-project-number" aria-label={`פרויקט ${index + 1}`}>{index + 1}</span>
                <div className="adir-project-logo" aria-hidden="true">
                  {logo ? <img src={logo} alt="" /> : <span>{project.name.trim().charAt(0)}</span>}
                </div>
                <div className="adir-project-info">
                  <h2>{project.name}</h2>
                  <div className="adir-progress" aria-label={`${progress} אחוזי התקדמות`}>
                    <span><i style={{ width: `${progress}%` }} /></span>
                    <strong>{project.progress === null ? "טרם נקבע" : `${project.progress}%`}</strong>
                  </div>
                </div>
                {project.siteUrl ? <a className="adir-project-link" href={project.siteUrl} target="_blank" rel="noreferrer">כניסה לפרויקט</a> : <span className="adir-project-no-link">הקישור יתווסף בהמשך</span>}
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
