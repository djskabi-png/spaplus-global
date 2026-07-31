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
    alternates: {
      canonical,
      languages: {
        "en-CA": canonical,
        "fr-CA": `https://spaplus.co/fr-ca/ontario/${area.slug}/`,
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
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: PageProps) {
  const { area: slug } = await params;
  const area = getOntarioArea(slug);
  if (!area) notFound();
  const config = buildOntarioAreaConfig(area, "en");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `SpaPlus is coming to ${area.name}`,
    url: config.pageUrl,
    description: area.lead,
    inLanguage: "en-CA",
    about: { "@id": "https://spaplus.co/#organization" },
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
