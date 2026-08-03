import type { Metadata } from "next";
import MarketLaunchPage from "../../market-launch/MarketLaunchPage";
import { canadaFrenchMarket } from "../../market-launch/markets";

const canonicalUrl = "https://app.spaplus.co/fr-ca/canada/";

export const metadata: Metadata = {
  title: "Joignez SpaPlus Canada hors Ontario | Partenaires spa",
  description: "Présentez votre spa à SpaPlus Canada. Cette page partenaires s'adresse aux spas reconnus partout au Canada, à l'exception de l'Ontario.",
  keywords: ["SpaPlus Canada", "plateforme de réservation spa Canada", "partenaires spa Canada", "marketing spa Canada"],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      "en-CA": "https://app.spaplus.co/en-ca/canada/",
      "fr-CA": canonicalUrl,
      "x-default": "https://app.spaplus.co/en-ca/canada/",
    },
  },
  openGraph: {
    title: "Faites découvrir votre spa avec SpaPlus Canada hors Ontario",
    description: "Un canal spécialisé dans la découverte et la réservation pour les spas reconnus partout au Canada hors Ontario.",
    url: canonicalUrl,
    siteName: "SpaPlus",
    locale: "fr_CA",
    type: "website",
    images: [{ url: "/ontario/og-ontario.png", width: 1536, height: 1024, alt: "Concept visuel de SpaPlus Canada. Il ne représente pas un spa partenaire précis." }],
  },
  twitter: { card: "summary_large_image", title: "Faites découvrir votre spa avec SpaPlus Canada", description: "Présentez votre spa à SpaPlus Canada.", images: ["/ontario/og-ontario.png"] },
  robots: { index: true, follow: true },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://spaplus.co/#organization", name: "SpaPlus", legalName: "Global Spa Management Ltd.", url: "https://spaplus.co/", logo: "https://spaplus.co/spaplus-logo.png" },
    { "@type": "WebPage", "@id": `${canonicalUrl}#webpage`, url: canonicalUrl, name: "Joignez SpaPlus Canada hors Ontario", description: "Une page destinée aux spas reconnus hors Ontario qui souhaitent explorer un partenariat avec SpaPlus Canada.", inLanguage: "fr-CA", about: { "@id": "https://spaplus.co/#organization" } },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "SpaPlus Global", item: "https://spaplus.co/fr-ca/" },
      { "@type": "ListItem", position: 2, name: "Canada", item: canonicalUrl },
    ] },
  ],
};

export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><MarketLaunchPage config={canadaFrenchMarket} /></>;
}
