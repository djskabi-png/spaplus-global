import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarketLaunchPage from "../../../market-launch/MarketLaunchPage";
import {
  buildOntarioAreaConfig,
  getOntarioArea,
  ontarioAreas,
} from "../../../market-launch/markets";

type PageProps = {
  params: Promise<{ area: string }>;
};

const isPublicLaunch = process.env.ONTARIO_PUBLIC_LAUNCH === "true";

export function generateStaticParams() {
  return ontarioAreas.map((area) => ({ area: area.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { area: slug } = await params;
  const area = getOntarioArea(slug);
  if (!area) return {};
  const canonical = `https://spaplus.co/en-ca/ontario/${area.slug}/`;
  return {
    title: `SpaPlus is coming to ${area.name} | Join as a founding spa`,
    description: `${area.lead} Established spas can join the SpaPlus early list with no fee, no commitment and no credit card.`,
    keywords: [
      `SpaPlus ${area.name}`,
      `${area.name} spa partners`,
      `${area.name} spa booking`,
      `spa marketing ${area.name}`,
      `join SpaPlus Ontario`,
    ],
    alternates: {
      canonical,
      languages: {
        "en-CA": canonical,
        "fr-CA": `https://spaplus.co/fr-ca/ontario/${area.slug}/`,
        "x-default": canonical,
      },
    },
    openGraph: {
      title: `SpaPlus is coming to ${area.name}`,
      description: `Put your ${area.name} spa on the founding partner list.`,
      url: canonical,
      siteName: "SpaPlus",
      locale: "en_CA",
      type: "website",
      images: ["/ontario/og-ontario.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `SpaPlus is coming to ${area.name}`,
      description: `Established ${area.name} spas can join the founding partner list before launch.`,
      images: ["/ontario/og-ontario.png"],
    },
    other: {
      "geo.region": "CA-ON",
      "geo.placename": area.name,
    },
    robots: { index: isPublicLaunch, follow: isPublicLaunch },
  };
}

export default async function Page({ params }: PageProps) {
  const { area: slug } = await params;
  const area = getOntarioArea(slug);
  if (!area) notFound();
  const config = buildOntarioAreaConfig(area, "en");
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${config.pageUrl}#webpage`,
        name: `SpaPlus is coming to ${area.name}`,
        url: config.pageUrl,
        description: area.lead,
        inLanguage: "en-CA",
        isPartOf: { "@id": "https://spaplus.co/#website" },
        about: { "@id": "https://spaplus.co/#organization" },
        spatialCoverage: {
          "@type": "AdministrativeArea",
          name: area.name,
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: "Ontario, Canada",
          },
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
            item: "https://spaplus.co/en-ca/ontario/",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: area.name,
            item: config.pageUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Does it cost anything to register a ${area.name} spa?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Registration is free, requires no credit card and creates no commitment.",
            },
          },
          {
            "@type": "Question",
            name: `When will SpaPlus launch in ${area.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: "The launch date has not been announced. Early registrations help SpaPlus prepare the local founding group.",
            },
          },
        ],
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketLaunchPage config={config} />
    </>
  );
}
