import type { Metadata } from "next";
import MarketLaunchPage from "../../market-launch/MarketLaunchPage";
import { quebecFrenchMarket } from "../../market-launch/markets";

const canonicalUrl = "https://app.spaplus.co/fr-ca/quebec/";

export const metadata: Metadata = {
  title: "Joignez SpaPlus Québec | Partenaires spa",
  description:
    "SpaPlus est déjà actif au Québec. Les spas reconnus peuvent présenter leur établissement et explorer un partenariat avec le réseau SpaPlus Canada.",
  keywords: [
    "SpaPlus Québec",
    "joindre SpaPlus Canada",
    "partenaires spa Québec",
    "plateforme de réservation spa Québec",
    "marketing spa Québec",
  ],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      "en-CA": "https://app.spaplus.co/en-ca/quebec/",
      "fr-CA": canonicalUrl,
      "x-default": canonicalUrl,
    },
  },
  openGraph: {
    title: "Faites découvrir votre spa avec SpaPlus Québec",
    description:
      "SpaPlus est déjà actif au Québec. Présentez votre établissement à l’équipe des partenariats de SpaPlus Canada.",
    url: canonicalUrl,
    siteName: "SpaPlus",
    locale: "fr_CA",
    type: "website",
    images: [{
      url: "/ontario/og-ontario.png",
      width: 1536,
      height: 1024,
      alt: "Concept visuel de la campagne SpaPlus Québec. Il ne représente pas un établissement candidat ni un partenaire précis.",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Faites découvrir votre spa avec SpaPlus Québec",
    description: "Présentez votre établissement au réseau actif de SpaPlus Québec.",
    images: ["/ontario/og-ontario.png"],
  },
  other: { "geo.region": "CA-QC", "geo.placename": "Québec", "content-language": "fr-CA" },
  robots: { index: true, follow: true },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://spaplus.co/#organization",
      name: "SpaPlus",
      legalName: "Global Spa Management Ltd.",
      url: "https://spaplus.co/",
      logo: "https://spaplus.co/spaplus-logo.png",
    },
    {
      "@type": "WebPage",
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: "Joignez SpaPlus Québec",
      description: "Une page de demande de partenariat pour les spas québécois reconnus qui souhaitent se joindre à SpaPlus Canada.",
      inLanguage: "fr-CA",
      about: { "@id": "https://spaplus.co/#organization" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "SpaPlus Global", item: "https://spaplus.co/fr-ca/" },
        { "@type": "ListItem", position: 2, name: "SpaPlus Canada", item: "https://app.spaplus.co/fr-ca/canada/" },
        { "@type": "ListItem", position: 3, name: "Québec", item: canonicalUrl },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "SpaPlus est-il déjà offert au Québec?",
          acceptedAnswer: { "@type": "Answer", text: "Oui. SpaPlus Canada présente déjà des expériences spa au Québec et accueille les demandes d’autres établissements québécois reconnus." },
        },
        {
          "@type": "Question",
          name: "Est-ce payant de présenter mon spa?",
          acceptedAnswer: { "@type": "Answer", text: "Non. La demande de partenariat est gratuite, ne demande aucune carte de crédit et ne crée aucun engagement." },
        },
      ],
    },
  ],
};

export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><MarketLaunchPage config={quebecFrenchMarket} /></>;
}
