"use client";

import { useEffect, useMemo, useState } from "react";
import type { SpaPackage, SpaPreview, Treatment } from "../../spa-preview";

type Language = "en" | "fr-CA";
type Draft = Omit<SpaPreview, "id" | "createdAt" | "updatedAt"> & { id?: number };
type MediaItem = { id: number; url: string; filename: string; contentType: string; createdAt: string };

const stableMediaUrl = (url: string) => url.replace(
  "https://app.spaplus.co/spa-preview-media/",
  "https://spaplus-global-brand.adir-naor-7510.chatgpt.site/spa-preview-media/",
);

const normalizeMedia = (items: MediaItem[]) => items.map((item) => ({ ...item, url: stableMediaUrl(item.url) }));

const blankTreatment = (): Treatment => ({ name: "", description: "", duration: "", price: "" });
const hoursFor = (language: Language) => language === "fr-CA" ? "Lundi au dimanche : 9 h à 18 h" : "Monday to Sunday: 9:00 AM to 6:00 PM";
const blank = (language: Language = "en"): Draft => ({
  slug: "",
  status: "shared",
  language,
  spaName: "",
  address: "",
  about: "",
  hours: hoursFor(language),
  treatments: [blankTreatment(), blankTreatment(), blankTreatment()],
  spaPackage: { name: "", description: "", price: "" },
  logoUrl: "",
  photoUrls: [],
});

const templates: Record<Language, Pick<Draft, "about" | "hours" | "treatments" | "spaPackage">> = {
  en: {
    about: "Discover a welcoming spa experience designed around relaxation, thoughtful care and time for yourself. Our team creates personalized treatments in a calm setting, helping every guest leave feeling refreshed and renewed.",
    hours: hoursFor("en"),
    treatments: [
      { name: "Relaxation Massage", description: "A soothing full-body massage designed to release tension and restore a sense of balance.", duration: "60 minutes", price: "Price to confirm" },
      { name: "Signature Facial", description: "A customized facial that cleanses, hydrates and revives the skin for a fresh, healthy glow.", duration: "60 minutes", price: "Price to confirm" },
      { name: "Body Ritual", description: "A restorative body treatment combining gentle exfoliation, nourishment and deep relaxation.", duration: "75 minutes", price: "Price to confirm" },
    ],
    spaPackage: { name: "Spa Escape", description: "A relaxing spa experience combining signature care with time to unwind.", price: "Price to confirm" },
  },
  "fr-CA": {
    about: "Découvrez une expérience spa chaleureuse axée sur la détente, les soins attentionnés et un moment rien qu’à vous. Notre équipe propose des soins personnalisés dans un environnement paisible afin que chaque personne reparte reposée et revitalisée.",
    hours: hoursFor("fr-CA"),
    treatments: [
      { name: "Massage de relaxation", description: "Un massage apaisant du corps conçu pour relâcher les tensions et retrouver une sensation d’équilibre.", duration: "60 minutes", price: "Prix à confirmer" },
      { name: "Soin du visage signature", description: "Un soin personnalisé qui nettoie, hydrate et ravive la peau pour lui redonner tout son éclat.", duration: "60 minutes", price: "Prix à confirmer" },
      { name: "Rituel corporel", description: "Un soin réparateur qui combine exfoliation douce, hydratation et relaxation profonde.", duration: "75 minutes", price: "Prix à confirmer" },
    ],
    spaPackage: { name: "Escapade spa", description: "Une expérience de détente qui combine des soins signature et un moment pour décrocher.", price: "Prix à confirmer" },
  },
};

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
}

export default function SpaPreviewManager({ canEdit, initialPreviews }: { canEdit: boolean; initialPreviews: SpaPreview[] }) {
  const [previews, setPreviews] = useState<SpaPreview[]>(initialPreviews);
  const [draft, setDraft] = useState<Draft>(blank);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const shareLink = useMemo(() => draft.slug ? `https://spaplus.co/ca/${draft.slug}` : "", [draft.slug]);

  async function load() {
    const response = await fetch("/admin/spa-previews/records");
    if (!response.ok) { setMessage("The profile list could not be refreshed. Reload the page and try again."); return; }
    const data = await response.json() as { previews: SpaPreview[] };
    setPreviews(data.previews);
  }

  async function loadMedia() {
    const response = await fetch("/admin/spa-previews/media");
    if (!response.ok) { setMessage("The media library could not be loaded."); return; }
    const data = await response.json() as { media: MediaItem[] };
    setMedia(normalizeMedia(data.media));
  }

  useEffect(() => { void load(); void loadMedia(); }, []);

  function edit(preview: SpaPreview) {
    setDraft({ ...preview, treatments: [...preview.treatments, blankTreatment(), blankTreatment(), blankTreatment()].slice(0, 3), photoUrls: preview.photoUrls.slice(0, 10) });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew() {
    setDraft(blank(draft.language));
    setMessage("");
  }

  function changeLanguage(language: Language) {
    setDraft((current) => ({ ...current, language, hours: current.id ? current.hours : hoursFor(language) }));
  }

  function applyTemplate() {
    const template = templates[draft.language];
    setDraft((current) => ({ ...current, about: template.about, hours: template.hours, treatments: template.treatments.map((item) => ({ ...item })), spaPackage: { ...template.spaPackage } }));
    setMessage(draft.language === "fr-CA" ? "Le modèle complet a été appliqué. Ajoutez le nom, l’adresse et les images." : "The complete template is ready. Add the spa name, address and images.");
  }

  function treatment(index: number, field: keyof Treatment, value: string) {
    setDraft((current) => ({ ...current, treatments: current.treatments.map((item, position) => position === index ? { ...item, [field]: value } : item) }));
  }

  function toggleGallery(url: string) {
    setDraft((current) => {
      if (current.photoUrls.includes(url)) return { ...current, photoUrls: current.photoUrls.filter((item) => item !== url) };
      if (current.photoUrls.length >= 10) { setMessage("You can select up to 10 gallery images."); return current; }
      return { ...current, photoUrls: [...current.photoUrls, url] };
    });
  }

  async function upload(files: FileList | null, destination: "logo" | "gallery") {
    if (!files?.length || !canEdit) return;
    const selected = Array.from(files).slice(0, destination === "logo" ? 1 : 10);
    if (destination === "gallery" && draft.photoUrls.length + selected.length > 10) { setMessage("A profile can have up to 10 gallery images."); return; }
    setUploading(true); setMessage("");
    const body = new FormData();
    selected.forEach((file) => body.append("files", file));
    const response = await fetch("/admin/spa-previews/media", { method: "POST", body });
    const data = await response.json() as { media?: MediaItem[]; error?: string };
    setUploading(false);
    if (!response.ok || !data.media?.length) { setMessage(data.error || "The images could not be uploaded."); return; }
    const uploadedMedia = normalizeMedia(data.media);
    setMedia((current) => [...uploadedMedia, ...current]);
    setDraft((current) => destination === "logo"
      ? { ...current, logoUrl: uploadedMedia[0].url }
      : { ...current, photoUrls: [...current.photoUrls, ...uploadedMedia.map((item) => item.url)].slice(0, 10) });
    setMessage(`${data.media.length} image${data.media.length === 1 ? "" : "s"} uploaded and added to this profile.`);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!canEdit) return;
    setBusy(true); setMessage("");
    const response = await fetch("/admin/spa-previews/records", { method: draft.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    const data = await response.json() as { preview?: SpaPreview; error?: string };
    setBusy(false);
    if (!response.ok || !data.preview) { setMessage(data.error || "The profile could not be saved."); return; }
    setDraft(data.preview); setMessage("Saved. The profile link is ready to share."); await load();
  }

  async function remove(preview: SpaPreview) {
    if (!canEdit || !window.confirm(`Delete ${preview.spaName}? Uploaded images will remain in the media library.`)) return;
    setBusy(true); setMessage("");
    const response = await fetch("/admin/spa-previews/records", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: preview.id }) });
    const data = await response.json() as { deleted?: boolean; error?: string };
    setBusy(false);
    if (!response.ok || !data.deleted) { setMessage(data.error || "The profile could not be deleted."); return; }
    if (draft.id === preview.id) setDraft(blank(draft.language));
    setMessage("Profile deleted. Its images are still available in the media library."); await load();
  }

  async function copyLink() { if (!shareLink) return; await navigator.clipboard.writeText(shareLink); setMessage("Preview link copied."); }

  return <section className="spa-cms-content">
    <header className="spa-cms-header"><div><a href="/admin" className="spa-cms-back">← Back to SpaPlus management</a><p>Partner acquisition</p><h1>Build a complete spa preview in minutes</h1><span>Use a ready-made English or Canadian French profile, upload media once, and share a private SpaPlus link.</span></div><a href="/" className="spa-cms-brand"><img src="/spaplus-mark.png" alt="" />SpaPlus</a></header>
    {message ? <div className="spa-cms-message" role="status">{message}</div> : null}
    <section className="spa-cms-quickbar">
      <label>Profile language<select disabled={!canEdit || busy} value={draft.language} onChange={(event) => changeLanguage(event.target.value as Language)}><option value="en">English</option><option value="fr-CA">Français canadien</option></select></label>
      <button type="button" onClick={applyTemplate} disabled={!canEdit || busy}>Apply complete template</button>
      <button type="button" className="spa-cms-secondary" onClick={startNew} disabled={!canEdit || busy}>Start a new profile</button>
    </section>
    <div className="spa-cms-layout">
      <form className="spa-cms-form" onSubmit={(event) => void save(event)}>
        <div className="spa-cms-card"><div className="spa-cms-card-heading"><div><p>1. Spa essentials</p><h2>Only the spa-specific details</h2></div><span>Required</span></div>
          <label>Spa name<input required disabled={!canEdit || busy} value={draft.spaName} onChange={(event) => setDraft({ ...draft, spaName: event.target.value, slug: slugify(event.target.value) })} /></label>
          <label>Public profile link<input readOnly value={shareLink} placeholder="The link is created from the spa name" /><small>The link name updates automatically when you type the spa name.</small></label>
          <label>Address<textarea required disabled={!canEdit || busy} value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} /></label>
          <label>About us<textarea required disabled={!canEdit || busy} value={draft.about} onChange={(event) => setDraft({ ...draft, about: event.target.value })} /></label>
          <label>Hours of operation<textarea disabled={!canEdit || busy} value={draft.hours} onChange={(event) => setDraft({ ...draft, hours: event.target.value })} /></label>
          <label>Visibility<select disabled={!canEdit || busy} value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Draft["status"] })}><option value="shared">Shared, link works</option><option value="draft">Draft, link is disabled</option></select></label>
        </div>
        <div className="spa-cms-card"><div className="spa-cms-card-heading"><div><p>2. Treatments</p><h2>Three signature services</h2></div><span>3 required</span></div>{draft.treatments.map((item, index) => <fieldset key={index}><legend>Treatment {index + 1}</legend><label>Name<input required disabled={!canEdit || busy} value={item.name} onChange={(event) => treatment(index, "name", event.target.value)} /></label><label>Description<textarea required disabled={!canEdit || busy} value={item.description} onChange={(event) => treatment(index, "description", event.target.value)} /></label><div className="spa-cms-split"><label>Duration<input disabled={!canEdit || busy} value={item.duration} onChange={(event) => treatment(index, "duration", event.target.value)} /></label><label>Price<input disabled={!canEdit || busy} value={item.price} onChange={(event) => treatment(index, "price", event.target.value)} /></label></div></fieldset>)}</div>
        <div className="spa-cms-card"><div className="spa-cms-card-heading"><div><p>3. Featured package</p><h2>One package to showcase</h2></div><span>Included</span></div><label>Package name<input disabled={!canEdit || busy} value={draft.spaPackage.name} onChange={(event) => setDraft({ ...draft, spaPackage: { ...draft.spaPackage, name: event.target.value } })} /></label><label>Description<textarea disabled={!canEdit || busy} value={draft.spaPackage.description} onChange={(event) => setDraft({ ...draft, spaPackage: { ...draft.spaPackage, description: event.target.value } })} /></label><label>Package price<input disabled={!canEdit || busy} value={draft.spaPackage.price} onChange={(event) => setDraft({ ...draft, spaPackage: { ...draft.spaPackage, price: event.target.value } })} /></label></div>
        <div className="spa-cms-card"><div className="spa-cms-card-heading"><div><p>4. Brand and gallery</p><h2>Upload now or reuse existing images</h2></div><span>Up to 10</span></div>
          <p className="spa-cms-help">JPG, PNG, WebP or AVIF, up to 8 MB per image. Uploaded media stays in this library for future profiles.</p>
          <div className="spa-cms-upload-row"><label className="spa-cms-upload">Upload logo<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={!canEdit || uploading} onChange={(event) => void upload(event.target.files, "logo")} /></label><label className="spa-cms-upload">Upload gallery images<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" disabled={!canEdit || uploading} onChange={(event) => void upload(event.target.files, "gallery")} /></label></div>
          {uploading ? <p className="spa-cms-help" role="status">Uploading images...</p> : null}
          <div className="spa-cms-selected-media">
            <div><strong>Selected logo</strong>{draft.logoUrl ? <button type="button" onClick={() => setDraft({ ...draft, logoUrl: "" })}><img src={draft.logoUrl} alt="Selected logo" /><span>Remove</span></button> : <span>No logo selected</span>}</div>
            <div><strong>Selected gallery ({draft.photoUrls.length}/10)</strong><div>{draft.photoUrls.map((url, index) => <button type="button" key={`${url}-${index}`} onClick={() => toggleGallery(url)}><img src={url} alt={`Selected gallery image ${index + 1}`} /><span>Remove</span></button>)}</div></div>
          </div>
          <div className="spa-cms-library-title"><strong>Previously uploaded images</strong><span>Select “Logo” or “Gallery” on any image.</span></div>
          <div className="spa-cms-media-library">{media.length ? media.map((item) => <article key={item.id} className={draft.logoUrl === item.url || draft.photoUrls.includes(item.url) ? "is-selected" : ""}><img src={item.url} alt={item.filename} /><small title={item.filename}>{item.filename}</small><div><button type="button" onClick={() => setDraft({ ...draft, logoUrl: item.url })}>Logo</button><button type="button" onClick={() => toggleGallery(item.url)}>{draft.photoUrls.includes(item.url) ? "Remove" : "Gallery"}</button></div></article>) : <p className="spa-cms-help">No uploaded images yet. Your first upload will appear here.</p>}</div>
        </div>
        {canEdit ? <button className="spa-cms-save" type="submit" disabled={busy || uploading}>{busy ? "Saving..." : draft.id ? "Save profile" : "Create shareable profile"}</button> : null}
      </form>
      <aside className="spa-cms-side"><section className="spa-cms-card spa-cms-link"><p>Shareable link</p><strong>{shareLink || "Type the spa name to create the link"}</strong><div>{draft.id && shareLink && draft.status === "shared" ? <><a href={shareLink} target="_blank" rel="noreferrer">Open profile</a><button type="button" onClick={() => void copyLink()}>Copy link</button></> : <span>Save the profile once to activate this link.</span>}</div></section><section className="spa-cms-card"><p>Created profiles</p><div className="spa-cms-list">{previews.length ? previews.map((preview) => <article key={preview.id}><button className="spa-cms-edit" type="button" onClick={() => edit(preview)}><span><strong>{preview.spaName}</strong><small>{preview.language} · /ca/{preview.slug}</small></span><em>{preview.status}</em></button><div><a href={`https://spaplus.co/ca/${preview.slug}`} target="_blank" rel="noreferrer">Open</a>{canEdit ? <button className="spa-cms-delete" type="button" onClick={() => void remove(preview)}>Delete</button> : null}</div></article>) : <span>No preview created yet.</span>}</div></section></aside>
    </div>
  </section>;
}
