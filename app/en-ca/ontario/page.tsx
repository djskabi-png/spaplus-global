import type { Metadata } from "next";
import MarketLaunchPage from "../../market-launch/MarketLaunchPage";
import { ontarioMarket } from "../../market-launch/markets";

const canonicalUrl = "https://app.spaplus.co/en-ca/ontario/";
const isPublicLaunch = true;

export const metadata: Metadata = {
  title: "SpaPlus is coming to Ontario | Founding spa partners",
  description:
    "SpaPlus is preparing to launch in Ontario. Established spas can join the founding partner list with no fee, no commitment and no credit card.",
  keywords: [
    "SpaPlus Ontario",
    "Ontario spa partners",
    "spa booking platform Ontario",
    "Toronto spa marketplace",
    "spa marketing Ontario",
  ],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      "en-CA": canonicalUrl,
      "fr-CA": "https://app.spaplus.co/fr-ca/ontario/",
      "x-default": canonicalUrl,
    },
  },
  openGraph: {
    title: "SpaPlus is coming to Ontario",
    description:
      "Join the founding spa partner list. No fee to register, no commitment and no credit card.",
    url: canonicalUrl,
    siteName: "SpaPlus",
    locale: "en_CA",
    type: "website",
    images: [
      {
        url: "/ontario/og-ontario.png",
        width: 1536,
        height: 1024,
        alt: "Illustrative SpaPlus Ontario launch artwork. It does not depict an Ontario partner.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpaPlus is coming to Ontario",
    description:
      "Ontario spas can join the founding partner list before launch.",
    images: ["/ontario/og-ontario.png"],
  },
  other: {
    "geo.region": "CA-ON",
    "geo.placename": "Ontario",
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
      name: "SpaPlus is coming to Ontario",
      description:
        "An early-access page for established Ontario spas interested in joining SpaPlus.",
      inLanguage: "en-CA",
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
          name: "SpaPlus Global",
          item: "https://spaplus.co/en/",
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
      name: "SpaPlus Ontario priority launch areas",
      itemListElement: ontarioMarket.priorityAreas.map((area, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: area.label,
        url: `https://app.spaplus.co${area.href}`,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Does it cost anything to register an Ontario spa?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Registration is free, does not require a credit card and does not create a commitment.",
          },
        },
        {
          "@type": "Question",
          name: "Who can join the SpaPlus Ontario early-access list?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The list is intended for established day spas, hotel and resort spas, Nordic and thermal spas, wellness venues and multi-location spa groups.",
          },
        },
        {
          "@type": "Question",
          name: "When will SpaPlus launch in Ontario?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The launch date has not been announced. Early registrations help SpaPlus build the right founding group before opening the market.",
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
      <MarketLaunchPage config={ontarioMarket} />
    </>
  );
}
