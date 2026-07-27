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
  useEffect(() => {
    fetch("/api/cms/submissions")
      .then((response) => response.json())
      .then((data) => setSubmissions(data.submissions || []))
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
        {!loading && submissions.length === 0 ? <p>עדיין אין פניות שמורות.</p> : null}
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
