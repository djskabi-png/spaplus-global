import type { Metadata } from "next";
import MarketLaunchPage from "../../market-launch/MarketLaunchPage";
import { canadaMarket } from "../../market-launch/markets";

const canonicalUrl = "https://app.spaplus.co/en-ca/canada/";

export const metadata: Metadata = {
  title: "Join SpaPlus Canada outside Ontario | Spa partners",
  description: "Introduce your spa to SpaPlus Canada. This partner page serves established spas across Canada outside Ontario, which has its own dedicated campaign.",
  keywords: ["SpaPlus Canada", "join spa platform Canada", "spa booking platform Canada", "spa marketing Canada", "Canadian spa partners"],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      "en-CA": canonicalUrl,
      "fr-CA": "https://app.spaplus.co/fr-ca/canada/",
      "x-default": canonicalUrl,
    },
  },
  openGraph: {
    title: "Bring your spa to SpaPlus Canada outside Ontario",
    description: "A dedicated discovery and booking channel for established spas across Canada outside Ontario.",
    url: canonicalUrl,
    siteName: "SpaPlus",
    locale: "en_CA",
    type: "website",
    images: [{ url: "/ontario/og-ontario.png", width: 1536, height: 1024, alt: "Illustrative SpaPlus Canada concept. It does not depict a specific partner spa." }],
  },
  twitter: { card: "summary_large_image", title: "Bring your spa to SpaPlus Canada", description: "Introduce your spa to SpaPlus Canada.", images: ["/ontario/og-ontario.png"] },
  robots: { index: true, follow: true },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://spaplus.co/#organization", name: "SpaPlus", legalName: "Global Spa Management Ltd.", url: "https://spaplus.co/", logo: "https://spaplus.co/spaplus-logo.png" },
    { "@type": "WebPage", "@id": `${canonicalUrl}#webpage`, url: canonicalUrl, name: "Join SpaPlus Canada outside Ontario", description: "A partner interest page for established spas across Canada outside Ontario.", inLanguage: "en-CA", about: { "@id": "https://spaplus.co/#organization" } },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "SpaPlus Global", item: "https://spaplus.co/en/" },
      { "@type": "ListItem", position: 2, name: "Canada", item: canonicalUrl },
    ] },
  ],
};

export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><MarketLaunchPage config={canadaMarket} /></>;
}
