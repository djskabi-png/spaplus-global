"use client";

import { useMemo, useState } from "react";
import type { SpaPreview } from "../../spa-preview";

const icon = (name: "search" | "filter" | "globe" | "share" | "heart" | "camera" | "menu" | "back" | "person") => {
  const paths = {
    search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
    filter: <><path d="M4 7h16M7 12h10M10 17h4" /><circle cx="8" cy="7" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="12" cy="17" r="1" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
    share: <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5M8 13l8 5" /></>,
    heart: <path d="M20 8.5c0 5-8 10-8 10s-8-5-8-10A4.5 4.5 0 0 1 12 5a4.5 4.5 0 0 1 8 3.5Z" />,
    camera: <><path d="M4 8h3l1.5-2h7L17 8h3v11H4Z" /><circle cx="12" cy="13" r="3" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    back: <path d="m14 6-6 6 6 6M8 12h12" />,
    person: <><circle cx="12" cy="8" r="3" /><path d="M6 20c.5-4 2.5-6 6-6s5.5 2 6 6" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

function priceLabel(value: string, french: boolean) {
  if (!value) return french ? "Prix à confirmer" : "Price to confirm";
  const trimmed = value.trim();
  if (/^\$/.test(trimmed) || /confirm|confirmer/i.test(trimmed)) return trimmed;
  return trimmed;
}

function hoursRows(value: string, french: boolean) {
  const normalized = value.trim();
  const defaultTime = french ? "9 h à 18 h" : "9:00 AM - 6:00 PM";
  const time = normalized.includes(":") ? normalized.split(":").slice(1).join(":").trim() || defaultTime : normalized || defaultTime;
  return (french
    ? ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
    : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  ).map((day) => ({ day, time }));
}

export default function CanadaSpaProfile({ preview }: { preview: SpaPreview }) {
  const french = preview.language === "fr-CA";
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [packageFilter, setPackageFilter] = useState("all");
  const [treatmentFilter, setTreatmentFilter] = useState("solo");
  const photos = preview.photoUrls.filter(Boolean);
  const treatments = preview.treatments.filter((item) => item.name);
  const hours = useMemo(() => hoursRows(preview.hours, french), [preview.hours, french]);
  const copy = french ? {
    where: "Où allez-vous?", guests: "Combien de personnes?", when: "Quand?", search: "Rechercher",
    book: "Réserver en ligne", images: "Photos supplémentaires", packages: "Forfaits spa", treatments: "Soins et services",
    all: "Tous", solo: "Solo", couple: "Couple", aboutTab: "à propos", reviews: "Avis", from: "à partir de",
    bookNow: "Réserver", about: "À propos du spa", hours: "Heures d’ouverture", contact: "Nous joindre",
    map: "Itinéraire", navigate: "Naviguer maintenant!", features: "Caractéristiques de l’endroit",
    packageFallback: "Forfait spa", close: "Fermer", previous: "Image précédente", next: "Image suivante",
  } : {
    where: "Where to?", guests: "How many guests?", when: "When?", search: "Search",
    book: "Book Online", images: "Additional Images", packages: "Spa Packages", treatments: "Treatments & Services",
    all: "All", solo: "Solo", couple: "Couple", aboutTab: "about", reviews: "Reviews", from: "from",
    bookNow: "Book now", about: "About the Spa", hours: "Spa Hours", contact: "Contact Us",
    map: "Arrival Map", navigate: "Navigate now!", features: "Characteristics of the place",
    packageFallback: "Spa package", close: "Close", previous: "Previous image", next: "Next image",
  };

  const openGallery = (index: number) => { setActiveImage(index); setGalleryOpen(true); };
  const moveGallery = (direction: number) => setActiveImage((current) => (current + direction + photos.length) % photos.length);
  const share = async () => {
    const data = { title: preview.spaName, url: window.location.href };
    if (navigator.share) await navigator.share(data).catch(() => undefined);
    else await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
  };

  return (
    <main className="canada-spa-page" lang={preview.language}>
      <header className="canada-site-header">
        <div className="canada-header-inner">
          <a className="canada-wordmark" href="https://spaplus.ca/" aria-label="SpaPlus Canada">
            <img className="canada-wordmark-full" src="/ontario/spaplus-canada-logo.png" alt="SpaPlus Canada" />
            <img className="canada-wordmark-mark" src="/spaplus-mark.png" alt="SpaPlus" />
          </a>
          <div className="canada-search-bar" aria-label={copy.search}>
            <span>{copy.where}</span><span>{copy.guests}</span><span>{copy.when}</span>
            <button type="button" aria-label="Filters">{icon("filter")}</button>
            <a href="#packages" aria-label={copy.search}>{icon("search")}</a>
          </div>
          <nav className="canada-header-tools" aria-label="SpaPlus">
            <a className="canada-tool-map" href="#contact" aria-label={copy.map}>⌖</a>
            <a className="canada-tool-language" href={`https://spaplus.ca/${french ? "fr" : "en"}/`} aria-label="Language">{icon("globe")}</a>
            <button className="canada-tool-share" type="button" aria-label="Share" onClick={share}>{icon("share")}</button>
            <a className="canada-tool-account" href={`https://spaplus.ca/${french ? "fr" : "en"}/`} aria-label="Account">{icon("person")}</a>
            <a className="canada-tool-search" href="#packages" aria-label={copy.search}>{icon("search")}</a>
            <button className="canada-tool-menu" type="button" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>{icon("menu")}</button>
            {menuOpen ? <div className="canada-header-menu"><a href="#packages" onClick={() => setMenuOpen(false)}>{copy.packages}</a><a href="#treatments" onClick={() => setMenuOpen(false)}>{copy.treatments}</a><a href="#about" onClick={() => setMenuOpen(false)}>{copy.about}</a><a href="#contact" onClick={() => setMenuOpen(false)}>{copy.contact}</a></div> : null}
          </nav>
        </div>
      </header>

      <section className="canada-profile-shell">
        <div className="canada-mobile-hero-tools">
          <button type="button" aria-label="Back" onClick={() => history.back()}>{icon("back")}</button>
        </div>

        <div className="canada-profile-heading">
          <div className="canada-profile-identity">
            <div><h1>{preview.spaName}</h1><p>{preview.address}</p></div>
          </div>
          <div className="canada-profile-actions">
            <a className="canada-book-primary" href="#packages">{copy.book}</a>
            <button type="button" className={saved ? "is-saved" : ""} aria-label="Save" aria-pressed={saved} onClick={() => setSaved((value) => !value)}>{icon("heart")}</button>
            <button type="button" aria-label="Share" onClick={share}>{icon("share")}</button>
          </div>
        </div>

        {photos.length ? <div className="canada-gallery">
          <button type="button" className="canada-gallery-main" onClick={() => openGallery(0)}><img src={photos[0]} alt={preview.spaName} /></button>
          <div className="canada-gallery-grid">
            {photos.slice(1, 5).map((photo, index) => <button type="button" key={photo} onClick={() => openGallery(index + 1)}><img src={photo} alt={`${preview.spaName} ${index + 2}`} /></button>)}
          </div>
          {photos.length > 1 ? <button type="button" className="canada-additional-images" onClick={() => openGallery(1)}>{icon("camera")}<span>{copy.images}</span></button> : null}
          {photos.length > 1 ? <button type="button" className="canada-mobile-next" aria-label={copy.next} onClick={() => openGallery(1)}>›</button> : null}
          <div className="canada-mobile-name"><strong>{preview.spaName}</strong></div>
        </div> : null}

        <div className="canada-mobile-actions">
          {photos.length > 1 ? <button type="button" aria-label={copy.images} onClick={() => openGallery(0)}>{icon("camera")}</button> : <span />}
          <button type="button" className={saved ? "is-saved" : ""} aria-label="Save" aria-pressed={saved} onClick={() => setSaved((value) => !value)}>{icon("heart")}</button>
          <button type="button" aria-label="Share" onClick={share}>{icon("share")}</button>
        </div>

        <nav className="canada-mobile-tabs" aria-label="Profile sections">
          {preview.spaPackage.name ? <a href="#packages">{french ? "Forfaits" : "Packages"}</a> : null}
          {treatments.length ? <a href="#treatments">{french ? "Soins" : "Treatments"}</a> : null}
          <a href="#about">{copy.aboutTab}</a>
          <a href="#contact">{french ? "Contact" : "Contact"}</a>
        </nav>

        <div className="canada-profile-content">
          <div className="canada-profile-main">
            {preview.spaPackage.name ? <section className="canada-section" id="packages">
              <h2>{copy.packages}</h2>
              <div className="canada-filter-tabs"><button type="button" className={packageFilter === "all" ? "active" : ""} aria-pressed={packageFilter === "all"} onClick={() => setPackageFilter("all")}>{copy.all}</button><button type="button" className={packageFilter === "solo" ? "active" : ""} aria-pressed={packageFilter === "solo"} onClick={() => setPackageFilter("solo")}>{copy.solo}</button><button type="button" className={packageFilter === "couple" ? "active" : ""} aria-pressed={packageFilter === "couple"} onClick={() => setPackageFilter("couple")}>{copy.couple}</button></div>
              <article className="canada-service-card canada-package-card">
                {photos[1] ? <button type="button" className="canada-service-image" onClick={() => openGallery(1)}><img src={photos[1]} alt={preview.spaPackage.name} /></button> : null}
                <div className="canada-service-copy"><h3>{preview.spaPackage.name || copy.packageFallback}</h3><p>{preview.spaPackage.description}</p><div className="canada-service-meta"><span>{copy.from} <strong>{priceLabel(preview.spaPackage.price, french)}</strong></span></div></div>
                <a className="canada-card-book" href="#contact">{copy.bookNow}</a>
              </article>
            </section> : null}

            {treatments.length ? <section className="canada-section" id="treatments">
              <h2>{copy.treatments}</h2>
              <div className="canada-filter-tabs"><button type="button" className={treatmentFilter === "solo" ? "active" : ""} aria-pressed={treatmentFilter === "solo"} onClick={() => setTreatmentFilter("solo")}>{copy.solo}</button><button type="button" className={treatmentFilter === "couple" ? "active" : ""} aria-pressed={treatmentFilter === "couple"} onClick={() => setTreatmentFilter("couple")}>{copy.couple}</button></div>
              <div className="canada-treatment-list">
                {treatments.map((treatment, index) => <article className="canada-service-card canada-treatment-card" key={`${treatment.name}-${index}`}>
                  {photos[index + 2] ? <button type="button" className="canada-service-image" onClick={() => openGallery(index + 2)}><img src={photos[index + 2]} alt={treatment.name} /></button> : null}
                  <div className="canada-service-copy"><h3>{treatment.name} <span>››</span></h3><p>{treatment.description}</p><div className="canada-service-meta"><strong>{priceLabel(treatment.price, french)}</strong>{treatment.duration ? <span>{treatment.duration}</span> : null}</div></div>
                  <a className="canada-card-book" href="#contact">{copy.bookNow}</a>
                </article>)}
              </div>
            </section> : null}
          </div>

          <aside className="canada-profile-side">
            <section className="canada-side-section" id="about"><h2>{copy.about}</h2><p>{preview.about}</p></section>
            <section className="canada-side-section"><h2>{copy.hours}</h2><dl className="canada-hours">{hours.map(({ day, time }) => <div key={day}><dt>{day}</dt><dd>{time}</dd></div>)}</dl></section>
            <section className="canada-side-section" id="contact"><h2>{copy.contact}</h2><a className="canada-book-secondary" href="#packages">{copy.book}</a><h3>{copy.map}</h3><p>{preview.address}</p><a className="canada-navigate" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(preview.address)}`} target="_blank" rel="noreferrer">{copy.navigate}</a></section>
          </aside>
        </div>
      </section>

      {galleryOpen && photos.length ? <div className="canada-lightbox" role="dialog" aria-modal="true" aria-label={copy.images}>
        <button type="button" className="canada-lightbox-close" aria-label={copy.close} onClick={() => setGalleryOpen(false)}>×</button>
        <button type="button" className="canada-lightbox-prev" aria-label={copy.previous} onClick={() => moveGallery(-1)}>‹</button>
        <img src={photos[activeImage]} alt={`${preview.spaName} ${activeImage + 1}`} />
        <button type="button" className="canada-lightbox-next" aria-label={copy.next} onClick={() => moveGallery(1)}>›</button>
      </div> : null}
    </main>
  );
}
