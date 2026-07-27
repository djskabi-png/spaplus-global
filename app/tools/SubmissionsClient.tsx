"use client";

import { useEffect, useState } from "react";

type Submission = {
  id: number;
  formType: string;
  name: string;
  email: string;
  organization: string;
  topic: string;
  message: string;
  locale: string;
  source: string;
  status: string;
  createdAt: string;
};

export default function SubmissionsClient() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/cms/submissions")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load submissions");
        return response.json();
      })
      .then((data) => setSubmissions(data.submissions || []))
      .catch(() => setError("לא ניתן לטעון את הפניות כרגע. נסו לרענן את העמוד."))
      .finally(() => setLoading(false));
  }, []);
  return (
    <section className="cms-content">
      <div className="cms-intro">
        <div>
          <p>כל הטפסים במקום אחד</p>
          <h1>פניות חדשות</h1>
        </div>
      </div>
      <div className="cms-card">
        {loading ? <p>טוען פניות...</p> : null}
        {error ? <p role="alert">{error}</p> : null}
        {!loading && !error && submissions.length === 0 ? <p>עדיין אין פניות שמורות.</p> : null}
        <div className="cms-user-list">
          {submissions.map((item) => (
            <article key={item.id} style={{gridTemplateColumns:"1fr"}}>
              <div>
                <strong>{item.name} · {item.organization}</strong>
                <span dir="ltr">{item.email}</span>
              </div>
              <p>{item.topic}</p>
              <p>{item.message}</p>
              <small>{new Date(item.createdAt).toLocaleString("he-IL")}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
