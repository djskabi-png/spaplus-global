import type { Metadata } from "next";
import MarketLaunchPage from "../../market-launch/MarketLaunchPage";
import { ontarioFrenchMarket } from "../../market-launch/markets";

const canonicalUrl = "https://spaplus.co/fr-ca/ontario/";
const isPublicLaunch = process.env.ONTARIO_PUBLIC_LAUNCH === "true";

export const metadata: Metadata = {
  title: "SpaPlus arrive en Ontario | Spas partenaires fondateurs",
  description:
    "SpaPlus prépare son lancement en Ontario. Les spas établis peuvent s’inscrire à la liste des partenaires fondateurs, gratuitement, sans engagement et sans carte de crédit.",
  keywords: [
    "SpaPlus Ontario",
    "partenaires spa Ontario",
    "plateforme de réservation spa Ontario",
    "spas Toronto",
    "marketing spa Ontario",
  ],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      "en-CA": "https://spaplus.co/en-ca/ontario/",
      "fr-CA": canonicalUrl,
      "x-default": "https://spaplus.co/en-ca/ontario/",
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
  other: {
    "geo.region": "CA-ON",
    "geo.placename": "Ontario",
    "content-language": "fr-CA",
  },
  robots: {
    index: isPublicLaunch,
    follow: isPublicLaunch,
  },
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
      "@type": "WebSite",
      "@id": "https://spaplus.co/#website",
      name: "SpaPlus Global",
      url: "https://spaplus.co/",
      inLanguage: ["en", "fr-CA"],
      publisher: {
        "@id": "https://spaplus.co/#organization",
      },
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
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "SpaPlus mondial",
          item: "https://spaplus.co/fr-ca/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Ontario",
          item: canonicalUrl,
        },
      ],
    },
    {
      "@type": "ItemList",
      name: "Zones de lancement prioritaires de SpaPlus en Ontario",
      itemListElement: ontarioFrenchMarket.priorityAreas.map((area, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: area.label,
        url: `https://spaplus.co${area.href}`,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "L’inscription d’un spa ontarien est-elle gratuite?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Oui. L’inscription est gratuite, ne demande aucune carte de crédit et ne crée aucun engagement.",
          },
        },
        {
          "@type": "Question",
          name: "Quels établissements peuvent s’inscrire?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "La liste s’adresse aux spas urbains, spas d’hôtel et de villégiature, spas nordiques ou thermaux, établissements mieux-être et groupes de spas multisites.",
          },
        },
        {
          "@type": "Question",
          name: "Quand SpaPlus sera-t-il lancé en Ontario?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "La date de lancement n’a pas encore été annoncée. Les inscriptions prioritaires nous aident à former le bon groupe de partenaires fondateurs.",
          },
        },
      ],
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
