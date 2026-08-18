"use client";

import { useEffect, useMemo, useState } from "react";
import type { SpaPreview, SpaPackage, Treatment } from "../../spa-preview";

type Draft = Omit<SpaPreview, "id" | "createdAt" | "updatedAt"> & { id?: number };
const blankTreatment = (): Treatment => ({ name: "", description: "", duration: "", price: "" });
const blank = (): Draft => ({ slug: "", status: "shared", spaName: "", address: "", about: "", hours: "", treatments: [blankTreatment(), blankTreatment(), blankTreatment()], spaPackage: { name: "", description: "", price: "" }, logoUrl: "", photoUrls: ["", "", "", "", ""] });

export default function SpaPreviewManager({ canEdit, initialPreviews }: { canEdit: boolean; initialPreviews: SpaPreview[] }) {
  const [previews, setPreviews] = useState<SpaPreview[]>(initialPreviews);
  const [draft, setDraft] = useState<Draft>(blank);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const shareLink = useMemo(() => draft.slug ? `https://spaplus.co/ca/${draft.slug}` : "", [draft.slug]);

  async function load() {
    const response = await fetch("/api/cms/spa-previews");
    if (!response.ok) { setMessage("The profile list could not be refreshed. Reload the page and try again."); return; }
    const data = await response.json() as { previews: SpaPreview[] };
    setPreviews(data.previews);
  }
  useEffect(() => { void load(); }, []);
  function edit(preview: SpaPreview) { setDraft({ ...preview, treatments: [...preview.treatments, blankTreatment(), blankTreatment(), blankTreatment()].slice(0, 3), photoUrls: [...preview.photoUrls, "", "", "", "", ""].slice(0, 5) }); setMessage(""); }
  function treatment(index: number, field: keyof Treatment, value: string) { setDraft((current) => ({ ...current, treatments: current.treatments.map((item, position) => position === index ? { ...item, [field]: value } : item) })); }
  function photo(index: number, value: string) { setDraft((current) => ({ ...current, photoUrls: current.photoUrls.map((item, position) => position === index ? value : item) })); }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!canEdit) return;
    setBusy(true); setMessage("");
    const response = await fetch("/api/cms/spa-previews", { method: draft.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    const data = await response.json() as { preview?: SpaPreview; error?: string };
    setBusy(false);
    if (!response.ok || !data.preview) { setMessage(data.error || "The profile could not be saved."); return; }
    setDraft(data.preview); setMessage("Saved. The profile link is ready to share."); await load();
  }
  async function copyLink() { if (!shareLink) return; await navigator.clipboard.writeText(shareLink); setMessage("Preview link copied."); }
  return <section className="spa-cms-content">
    <header className="spa-cms-header"><div><a href="/admin" className="spa-cms-back">← Back to SpaPlus management</a><p>Partner acquisition</p><h1>Private spa profile previews</h1><span>Prepare a complete SpaPlus-style profile before a spa joins. Shared pages are noindex and never appear in the Canada marketplace.</span></div><a href="/" className="spa-cms-brand"><img src="/spaplus-mark.png" alt="" />SpaPlus</a></header>
    {message ? <div className="spa-cms-message" role="status">{message}</div> : null}
    <div className="spa-cms-layout">
      <form className="spa-cms-form" onSubmit={(event) => void save(event)}>
        <div className="spa-cms-card"><div className="spa-cms-card-heading"><div><p>1. Spa essentials</p><h2>The basics the spa will recognize</h2></div><span>Required</span></div>
          <label>Spa name<input required disabled={!canEdit || busy} value={draft.spaName} onChange={(event) => setDraft({ ...draft, spaName: event.target.value, slug: draft.slug || event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") })} /></label>
          <label>Profile link name<input required disabled={!canEdit || busy} value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} /><small>Lowercase English letters, numbers and hyphens only.</small></label>
          <label>Address<textarea required disabled={!canEdit || busy} value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} /></label>
          <label>About us<textarea required disabled={!canEdit || busy} value={draft.about} onChange={(event) => setDraft({ ...draft, about: event.target.value })} /></label>
          <label>Hours of operation<textarea disabled={!canEdit || busy} value={draft.hours} onChange={(event) => setDraft({ ...draft, hours: event.target.value })} placeholder="Monday to Friday, 9:00 AM to 8:00 PM" /></label>
          <label>Visibility<select disabled={!canEdit || busy} value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Draft["status"] })}><option value="shared">Shared, link works</option><option value="draft">Draft, link is disabled</option></select></label>
        </div>
        <div className="spa-cms-card"><div className="spa-cms-card-heading"><div><p>2. Treatments</p><h2>Three signature services</h2></div><span>3 required</span></div>{draft.treatments.map((item, index) => <fieldset key={index}><legend>Treatment {index + 1}</legend><label>Name<input required disabled={!canEdit || busy} value={item.name} onChange={(event) => treatment(index, "name", event.target.value)} /></label><label>Description<textarea required disabled={!canEdit || busy} value={item.description} onChange={(event) => treatment(index, "description", event.target.value)} /></label><div className="spa-cms-split"><label>Duration<input disabled={!canEdit || busy} value={item.duration} onChange={(event) => treatment(index, "duration", event.target.value)} placeholder="60 minutes" /></label><label>Price<input disabled={!canEdit || busy} value={item.price} onChange={(event) => treatment(index, "price", event.target.value)} placeholder="$150" /></label></div></fieldset>)}</div>
        <div className="spa-cms-card"><div className="spa-cms-card-heading"><div><p>3. Featured package</p><h2>One package to showcase</h2></div><span>Optional</span></div><label>Package name<input disabled={!canEdit || busy} value={draft.spaPackage.name} onChange={(event) => setDraft({ ...draft, spaPackage: { ...draft.spaPackage, name: event.target.value } })} /></label><label>Description<textarea disabled={!canEdit || busy} value={draft.spaPackage.description} onChange={(event) => setDraft({ ...draft, spaPackage: { ...draft.spaPackage, description: event.target.value } })} /></label><label>Package price<input disabled={!canEdit || busy} value={draft.spaPackage.price} onChange={(event) => setDraft({ ...draft, spaPackage: { ...draft.spaPackage, price: event.target.value } })} placeholder="$320" /></label></div>
        <div className="spa-cms-card"><div className="spa-cms-card-heading"><div><p>4. Brand and gallery</p><h2>Logo and five photos</h2></div><span>5 required</span></div><p className="spa-cms-help">Paste approved image URLs. Upload storage is deliberately separate from this first release, so no unapproved file is copied into production.</p><label>Logo URL<input type="url" disabled={!canEdit || busy} value={draft.logoUrl} onChange={(event) => setDraft({ ...draft, logoUrl: event.target.value })} placeholder="https://..." /></label>{draft.photoUrls.map((value, index) => <label key={index}>Photo {index + 1} URL<input type="url" required disabled={!canEdit || busy} value={value} onChange={(event) => photo(index, event.target.value)} placeholder="https://..." /></label>)}</div>
        {canEdit ? <button className="spa-cms-save" type="submit" disabled={busy}>{busy ? "Saving..." : draft.id ? "Save profile" : "Create shareable profile"}</button> : null}
      </form>
      <aside className="spa-cms-side"><section className="spa-cms-card spa-cms-link"><p>Shareable link</p><strong>{shareLink || "Create the link name first"}</strong><div>{shareLink && draft.status === "shared" ? <><a href={shareLink} target="_blank" rel="noreferrer">Open preview</a><button type="button" onClick={() => void copyLink()}>Copy link</button></> : <span>The link becomes active when this profile is shared.</span>}</div></section><section className="spa-cms-card"><p>Existing previews</p><div className="spa-cms-list">{previews.length ? previews.map((preview) => <button type="button" key={preview.id} onClick={() => edit(preview)}><span><strong>{preview.spaName}</strong><small>/ca/{preview.slug}</small></span><em>{preview.status}</em></button>) : <span>No preview created yet.</span>}</div></section></aside>
    </div>
  </section>;
}
