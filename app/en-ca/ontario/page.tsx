import type { Metadata } from "next";
import MarketLaunchPage from "../../market-launch/MarketLaunchPage";
import { ontarioMarket } from "../../market-launch/markets";

const canonicalUrl = "https://spaplus.co/en-ca/ontario/";

export const metadata: Metadata = {
  title: "SpaPlus is coming to Ontario | Founding spa partners",
  description:
    "SpaPlus is preparing to launch in Ontario. Established spas can join the founding partner list with no fee, no commitment and no credit card.",
  alternates: {
    canonical: canonicalUrl,
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
