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
  const canonical = `https://spaplus.co/fr-ca/ontario/${area.slug}/`;
  return {
    title: `SpaPlus arrive à ${area.frenchName} | Devenez un spa fondateur`,
    description: `${area.frenchLead} Les spas établis peuvent s’inscrire gratuitement, sans engagement et sans carte de crédit.`,
    alternates: {
      canonical,
      languages: {
        "en-CA": `https://spaplus.co/en-ca/ontario/${area.slug}/`,
        "fr-CA": canonical,
      },
    },
    openGraph: {
      title: `SpaPlus arrive à ${area.frenchName}`,
      description: `Inscrivez votre spa de ${area.frenchName} à la liste des partenaires fondateurs.`,
      url: canonical,
      siteName: "SpaPlus",
      locale: "fr_CA",
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
  const config = buildOntarioAreaConfig(area, "fr");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `SpaPlus arrive à ${area.frenchName}`,
    url: config.pageUrl,
    description: area.frenchLead,
    inLanguage: "fr-CA",
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
