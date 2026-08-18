import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSpaPreviewBySlug } from "../../spa-preview";
import "./spa-preview.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const preview = await getSpaPreviewBySlug(slug);
  if (!preview || preview.status !== "shared") return { robots: { index: false, follow: false } };
  const french = preview.language === "fr-CA";
  const title = french ? `${preview.spaName} | Aperçu SpaPlus` : `${preview.spaName} | SpaPlus preview`;
  const description = french ? `Aperçu privé du profil SpaPlus de ${preview.spaName}.` : `Private SpaPlus profile preview for ${preview.spaName}.`;
  return {
    title,
    description,
    robots: { index: false, follow: false, nocache: true },
    openGraph: {
      title,
      description,
      url: `https://spaplus.co/ca/${preview.slug}`,
      siteName: "SpaPlus",
      type: "website",
      images: preview.photoUrls[0] ? [{ url: preview.photoUrls[0], alt: french ? `Aperçu du profil de ${preview.spaName}` : `${preview.spaName} profile preview` }] : [],
    },
    twitter: {
      card: preview.photoUrls[0] ? "summary_large_image" : "summary",
      title,
      description,
      images: preview.photoUrls[0] ? [preview.photoUrls[0]] : [],
    },
  };
}

export default async function SpaPreviewPage({ params }: Props) {
  const { slug } = await params;
  const preview = await getSpaPreviewBySlug(slug);
  if (!preview || preview.status !== "shared") notFound();
  const isDemonstration = preview.slug === "spaplus-profile-demo";
  const treatments = preview.treatments.filter((treatment) => treatment.name);
  const french = preview.language === "fr-CA";
  const copy = french ? {
    notice: "Aperçu privé pour collaboration. Ce profil n’est pas encore publié sur SpaPlus Canada et les réservations ne sont pas disponibles.",
    demo: "Démonstration seulement. Les renseignements et les images sont fictifs et ne représentent pas un véritable spa.",
    profilePreview: "Aperçu du profil",
    profile: "Votre profil SpaPlus",
    opening: "Bientôt sur SpaPlus",
    explore: "Découvrir votre profil",
    gallery: "Galerie",
    about: "À propos du spa",
    aboutTitle: "Un profil à l’image de votre établissement",
    hours: "Heures d’ouverture",
    visit: "Planifiez votre visite",
    noHours: "Les heures seront ajoutées avant la mise en ligne.",
    previewOnly: "Ceci est un aperçu du profil. Les réservations ne sont pas activées.",
    treatments: "Soins signature",
    treatmentsTitle: "Pensés pour votre clientèle",
    package: "Forfait vedette",
    footer: `Ceci est un aperçu privé préparé pour ${preview.spaName}.`,
  } : {
    notice: "Private collaboration preview. This profile is not yet live on SpaPlus Canada and cannot accept bookings.",
    demo: "Demonstration only. The business details and images are illustrative and do not represent a real spa.",
    profilePreview: "Profile preview",
    profile: "Your SpaPlus profile",
    opening: "Opening soon on SpaPlus",
    explore: "Explore your profile",
    gallery: "Gallery",
    about: "About the spa",
    aboutTitle: "A profile that feels like your place",
    hours: "Hours of operation",
    visit: "Plan your visit",
    noHours: "Hours will be added before launch.",
    previewOnly: "This is a profile preview only. Booking is not enabled.",
    treatments: "Signature treatments",
    treatmentsTitle: "Designed for your guests",
    package: "Featured package",
    footer: `This is a private partner preview, prepared for ${preview.spaName}.`,
  };
  return (
    <main className="spa-preview-page" lang={preview.language}>
      <div className="spa-preview-notice">{copy.notice}</div>
      {isDemonstration ? <div className="spa-preview-demo-notice">{copy.demo}</div> : null}
      <header className="spa-preview-header">
        <a href="/" className="spa-preview-brand"><img src="/spaplus-mark.png" alt="" />SpaPlus</a>
        <span>{copy.profilePreview}</span>
      </header>
      <section className="spa-preview-hero">
        <div className="spa-preview-hero-copy">
          {preview.logoUrl ? <img className="spa-preview-logo" src={preview.logoUrl} alt={`${preview.spaName} logo`} /> : null}
          <p className="spa-preview-kicker">{copy.profile}</p>
          <h1>{preview.spaName}</h1>
          <p className="spa-preview-address">{preview.address}</p>
          <div className="spa-preview-hero-actions"><span>{copy.opening}</span><a href="#about">{copy.explore}</a></div>
        </div>
        <img className="spa-preview-hero-image" src={preview.photoUrls[0]} alt={isDemonstration ? "Illustrative SpaPlus profile demonstration" : `${preview.spaName} preview`} />
      </section>
      <section className="spa-preview-gallery" aria-label={`${preview.spaName} ${copy.gallery}`}>
        {preview.photoUrls.slice(1).map((image, index) => <img key={`${image}-${index}`} src={image} alt={isDemonstration ? `${copy.demo} ${index + 2}` : `${preview.spaName}, ${copy.gallery.toLowerCase()} ${index + 2}`} />)}
      </section>
      <section className="spa-preview-details" id="about">
        <article><p className="spa-preview-kicker">{copy.about}</p><h2>{copy.aboutTitle}</h2><p>{preview.about}</p></article>
        <aside><p className="spa-preview-kicker">{copy.hours}</p><h2>{copy.visit}</h2><p className="spa-preview-hours">{preview.hours || copy.noHours}</p><p className="spa-preview-preview-note">{copy.previewOnly}</p></aside>
      </section>
      <section className="spa-preview-treatments">
        <div><p className="spa-preview-kicker">{copy.treatments}</p><h2>{copy.treatmentsTitle}</h2></div>
        <div className="spa-preview-treatment-grid">
          {treatments.map((treatment) => <article key={treatment.name}><div><h3>{treatment.name}</h3><p>{treatment.description}</p></div><footer><span>{treatment.duration}</span><strong>{treatment.price}</strong></footer></article>)}
        </div>
      </section>
      {preview.spaPackage.name ? <section className="spa-preview-package"><div><p className="spa-preview-kicker">{copy.package}</p><h2>{preview.spaPackage.name}</h2><p>{preview.spaPackage.description}</p></div><strong>{preview.spaPackage.price}</strong></section> : null}
      <footer className="spa-preview-footer"><a href="/" className="spa-preview-brand"><img src="/spaplus-mark.png" alt="" />SpaPlus</a><span>{copy.footer}</span></footer>
    </main>
  );
}
