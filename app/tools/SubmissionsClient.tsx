"use client";

import { useEffect, useMemo, useState } from "react";

type Submission = {
  id: number;
  formType: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  topic: string;
  message: string;
  locale: string;
  source: string;
  resourceKey: string;
  status: "new" | "in_progress" | "closed";
  createdAt: string;
};

const copy = {
  en: { eyebrow: "Leads available to you", title: "Enquiries", loading: "Loading enquiries...", error: "Unable to load enquiries. Please refresh the page.", empty: "No enquiries have arrived in your areas yet.", all: "All areas", new: "New", progress: "In progress", closed: "Closed", update: "Update status", global: "Global website", ontario: "Ontario" },
  he: { eyebrow: "הפניות באזורים שלך", title: "פניות נכנסות", loading: "טוען פניות...", error: "לא ניתן לטעון את הפניות. נסו לרענן את העמוד.", empty: "עדיין לא התקבלו פניות באזורים שלך.", all: "כל האזורים", new: "חדש", progress: "בטיפול", closed: "נסגר", update: "עדכון סטטוס", global: "האתר העולמי", ontario: "אונטריו" },
  "fr-CA": { eyebrow: "Demandes dans vos secteurs", title: "Demandes reçues", loading: "Chargement des demandes...", error: "Impossible de charger les demandes. Actualisez la page.", empty: "Aucune demande n’a encore été reçue dans vos secteurs.", all: "Tous les secteurs", new: "Nouvelle", progress: "En traitement", closed: "Fermée", update: "Mettre à jour", global: "Site mondial", ontario: "Ontario" },
} as const;

export default function SubmissionsClient({ systemLocale }: { systemLocale: string }) {
  const locale = systemLocale === "he" || systemLocale === "fr-CA" ? systemLocale : "en";
  const t = copy[locale];
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resource, setResource] = useState("all");

  async function load() {
    try {
      const response = await fetch("/api/cms/submissions");
      if (!response.ok) throw new Error("Unable to load submissions");
      const data = (await response.json()) as { submissions: Submission[] };
      setSubmissions(data.submissions || []);
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void load(); }, []);

  const resources = useMemo(() => Array.from(new Set(submissions.map((item) => item.resourceKey))), [submissions]);
  const visible = resource === "all" ? submissions : submissions.filter((item) => item.resourceKey === resource);
  const resourceLabel = (key: string) => key === "market:ca:on" ? t.ontario : t.global;
  const statusLabel = (status: Submission["status"]) => status === "new" ? t.new : status === "in_progress" ? t.progress : t.closed;

  async function updateStatus(item: Submission, status: Submission["status"]) {
    const response = await fetch("/api/cms/submissions", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, status }),
    });
    if (response.ok) await load();
  }

  return (
    <section className="cms-content">
      <div className="cms-intro"><div><p>{t.eyebrow}</p><h1>{t.title}</h1></div></div>
      <div className="cms-toolbar">
        <label>{t.all}<select value={resource} onChange={(event) => setResource(event.target.value)}><option value="all">{t.all}</option>{resources.map((key) => <option key={key} value={key}>{resourceLabel(key)}</option>)}</select></label>
      </div>
      <div className="cms-card">
        {loading ? <p>{t.loading}</p> : null}
        {error ? <p role="alert">{error}</p> : null}
        {!loading && !error && visible.length === 0 ? <p>{t.empty}</p> : null}
        <div className="cms-user-list">
          {visible.map((item) => <article className="cms-user-card" key={item.id}>
            <div className="cms-user-identity"><strong>{item.name}{item.organization ? ` · ${item.organization}` : ""}</strong><span dir="ltr">{item.email}</span>{item.phone ? <span dir="ltr">{item.phone}</span> : null}</div>
            <div><strong>{resourceLabel(item.resourceKey)}</strong><p>{item.topic}</p><p style={{ whiteSpace: "pre-wrap" }}>{item.message}</p></div>
            <div className="cms-user-actions"><small>{new Date(item.createdAt).toLocaleString(locale === "he" ? "he-IL" : locale)}</small><label>{t.update}<select value={item.status} onChange={(event) => void updateStatus(item, event.target.value as Submission["status"])}><option value="new">{statusLabel("new")}</option><option value="in_progress">{statusLabel("in_progress")}</option><option value="closed">{statusLabel("closed")}</option></select></label></div>
          </article>)}
        </div>
      </div>
    </section>
  );
}
