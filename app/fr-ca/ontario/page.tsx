import type { Metadata } from "next";
import MarketLaunchPage from "../../market-launch/MarketLaunchPage";
import { ontarioFrenchMarket } from "../../market-launch/markets";

const canonicalUrl = "https://spaplus.co/fr-ca/ontario/";

export const metadata: Metadata = {
  title: "SpaPlus arrive en Ontario | Spas partenaires fondateurs",
  description:
    "SpaPlus prépare son lancement en Ontario. Les spas établis peuvent s’inscrire à la liste des partenaires fondateurs, gratuitement, sans engagement et sans carte de crédit.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      "en-CA": "https://spaplus.co/en-ca/ontario/",
      "fr-CA": canonicalUrl,
    },
  },
  openGraph: {
    title: "SpaPlus arrive en Ontario",
    description:
      "Inscrivez votre spa à la liste des partenaires fondateurs avant le lancement.",
    url: canonicalUrl,
    siteName: "SpaPlus",
    locale: "fr_CA",
    type: "website",
    images: [
      {
        url: "/ontario/og-ontario.png",
        width: 1536,
        height: 1024,
        alt: "Concept visuel illustratif du lancement de SpaPlus en Ontario. Il ne représente pas un partenaire ontarien.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpaPlus arrive en Ontario",
    description:
      "Les spas ontariens peuvent s’inscrire à la liste prioritaire avant le lancement.",
    images: ["/ontario/og-ontario.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://spaplus.co/#organization",
      name: "SpaPlus",
      url: "https://spaplus.co/",
      logo: "https://spaplus.co/spaplus-logo.png",
    },
    {
      "@type": "WebPage",
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: "SpaPlus arrive en Ontario",
      description:
        "Une page d’accès prioritaire destinée aux spas établis de l’Ontario qui souhaitent découvrir SpaPlus.",
      inLanguage: "fr-CA",
      isPartOf: {
        "@id": "https://spaplus.co/#website",
      },
      about: {
        "@id": "https://spaplus.co/#organization",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketLaunchPage config={ontarioFrenchMarket} />
    </>
  );
}
