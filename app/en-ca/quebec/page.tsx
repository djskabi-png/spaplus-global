import type { Metadata } from "next";
import MarketLaunchPage from "../../market-launch/MarketLaunchPage";
import { quebecMarket } from "../../market-launch/markets";

const canonicalUrl = "https://app.spaplus.co/en-ca/quebec/";

export const metadata: Metadata = {
  title: "Join SpaPlus Québec | Spa partners",
  description:
    "SpaPlus is already active in Québec. Established spas can introduce their business and explore joining the SpaPlus Canada network.",
  keywords: [
    "SpaPlus Québec",
    "join SpaPlus Canada",
    "Québec spa partners",
    "spa booking platform Québec",
    "spa marketing Québec",
  ],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      "en-CA": canonicalUrl,
      "fr-CA": "https://app.spaplus.co/fr-ca/quebec/",
      "x-default": "https://app.spaplus.co/fr-ca/quebec/",
    },
  },
  openGraph: {
    title: "Bring your spa to SpaPlus Québec",
    description:
      "SpaPlus is already active in Québec. Introduce your established spa to the SpaPlus Canada partner team.",
    url: canonicalUrl,
    siteName: "SpaPlus",
    locale: "en_CA",
    type: "website",
    images: [{
      url: "/ontario/og-ontario.png",
      width: 1536,
      height: 1024,
      alt: "Illustrative SpaPlus Québec campaign artwork. It does not depict a specific applicant or partner spa.",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bring your spa to SpaPlus Québec",
    description: "Introduce your established spa to the active SpaPlus Québec network.",
    images: ["/ontario/og-ontario.png"],
  },
  other: { "geo.region": "CA-QC", "geo.placename": "Québec" },
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
      name: "Join SpaPlus Québec",
      description: "A partner enquiry page for established Québec spas interested in joining SpaPlus Canada.",
      inLanguage: "en-CA",
      about: { "@id": "https://spaplus.co/#organization" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "SpaPlus Global", item: "https://spaplus.co/en/" },
        { "@type": "ListItem", position: 2, name: "SpaPlus Canada", item: "https://app.spaplus.co/en-ca/canada/" },
        { "@type": "ListItem", position: 3, name: "Québec", item: canonicalUrl },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is SpaPlus already available in Québec?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. SpaPlus Canada already presents spa experiences in Québec and is welcoming enquiries from additional established Québec spas." },
        },
        {
          "@type": "Question",
          name: "Does it cost anything to introduce my spa?",
          acceptedAnswer: { "@type": "Answer", text: "No. Sending a partner enquiry is free, requires no credit card and creates no commitment." },
        },
      ],
    },
  ],
};

export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><MarketLaunchPage config={quebecMarket} /></>;
}
