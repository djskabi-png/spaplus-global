import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSpaPreviewBySlug } from "../../spa-preview";
import "./spa-preview.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const preview = await getSpaPreviewBySlug(slug);
  if (!preview || preview.status !== "shared") return { robots: { index: false, follow: false } };
  return {
    title: `${preview.spaName} | SpaPlus preview`,
    description: `Private SpaPlus profile preview for ${preview.spaName}.`,
    robots: { index: false, follow: false, nocache: true },
    openGraph: {
      title: `${preview.spaName} | SpaPlus preview`,
      description: `Private SpaPlus profile preview for ${preview.spaName}.`,
      url: `https://spaplus.co/ca/${preview.slug}`,
      siteName: "SpaPlus",
      type: "website",
      images: preview.photoUrls[0] ? [{ url: preview.photoUrls[0], alt: `${preview.spaName} profile preview` }] : [],
    },
    twitter: {
      card: preview.photoUrls[0] ? "summary_large_image" : "summary",
      title: `${preview.spaName} | SpaPlus preview`,
      description: `Private SpaPlus profile preview for ${preview.spaName}.`,
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
  return (
    <main className="spa-preview-page">
      <div className="spa-preview-notice">Private collaboration preview. This profile is not yet live on SpaPlus Canada and cannot accept bookings.</div>
      {isDemonstration ? <div className="spa-preview-demo-notice">Demonstration only. The business details and images are illustrative and do not represent a real spa.</div> : null}
      <header className="spa-preview-header">
        <a href="/" className="spa-preview-brand"><img src="/spaplus-mark.png" alt="" />SpaPlus</a>
        <span>Profile preview</span>
      </header>
      <section className="spa-preview-hero">
        <div className="spa-preview-hero-copy">
          {preview.logoUrl ? <img className="spa-preview-logo" src={preview.logoUrl} alt={`${preview.spaName} logo`} /> : null}
          <p className="spa-preview-kicker">Your SpaPlus profile</p>
          <h1>{preview.spaName}</h1>
          <p className="spa-preview-address">{preview.address}</p>
          <div className="spa-preview-hero-actions"><span>Opening soon on SpaPlus</span><a href="#about">Explore your profile</a></div>
        </div>
        <img className="spa-preview-hero-image" src={preview.photoUrls[0]} alt={isDemonstration ? "Illustrative SpaPlus profile demonstration" : `${preview.spaName} preview`} />
      </section>
      <section className="spa-preview-gallery" aria-label={`${preview.spaName} gallery`}>
        {preview.photoUrls.slice(1).map((image, index) => <img key={image} src={image} alt={isDemonstration ? `Illustrative SpaPlus demonstration image ${index + 2}` : `${preview.spaName}, gallery image ${index + 2}`} />)}
      </section>
      <section className="spa-preview-details" id="about">
        <article><p className="spa-preview-kicker">About the spa</p><h2>A profile that feels like your place</h2><p>{preview.about}</p></article>
        <aside><p className="spa-preview-kicker">Hours of operation</p><h2>Plan your visit</h2><p className="spa-preview-hours">{preview.hours || "Hours will be added before launch."}</p><p className="spa-preview-preview-note">This is a profile preview only. Booking is not enabled.</p></aside>
      </section>
      <section className="spa-preview-treatments">
        <div><p className="spa-preview-kicker">Signature treatments</p><h2>Designed for your guests</h2></div>
        <div className="spa-preview-treatment-grid">
          {treatments.map((treatment) => <article key={treatment.name}><div><h3>{treatment.name}</h3><p>{treatment.description}</p></div><footer><span>{treatment.duration}</span><strong>{treatment.price}</strong></footer></article>)}
        </div>
      </section>
      {preview.spaPackage.name ? <section className="spa-preview-package"><div><p className="spa-preview-kicker">Featured package</p><h2>{preview.spaPackage.name}</h2><p>{preview.spaPackage.description}</p></div><strong>{preview.spaPackage.price}</strong></section> : null}
      <footer className="spa-preview-footer"><a href="/" className="spa-preview-brand"><img src="/spaplus-mark.png" alt="" />SpaPlus</a><span>This is a private partner preview, prepared for {preview.spaName}.</span></footer>
    </main>
  );
}
