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

const isPublicLaunch = true;

export function generateStaticParams() {
  return ontarioAreas.map((area) => ({ area: area.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { area: slug } = await params;
  const area = getOntarioArea(slug);
  if (!area) return {};
  const canonical = `https://app.spaplus.co/fr-ca/ontario/${area.slug}/`;
  return {
    title: `SpaPlus arrive à ${area.frenchName} | Devenez un spa fondateur`,
    description: `${area.frenchLead} Les spas établis peuvent s’inscrire gratuitement, sans engagement et sans carte de crédit.`,
    keywords: [
      `SpaPlus ${area.frenchName}`,
      `partenaires spa ${area.frenchName}`,
      `réservation spa ${area.frenchName}`,
      `marketing spa ${area.frenchName}`,
      "rejoindre SpaPlus Ontario",
    ],
    alternates: {
      canonical,
      languages: {
        "en-CA": `https://app.spaplus.co/en-ca/ontario/${area.slug}/`,
        "fr-CA": canonical,
        "x-default": `https://app.spaplus.co/en-ca/ontario/${area.slug}/`,
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
    twitter: {
      card: "summary_large_image",
      title: `SpaPlus arrive à ${area.frenchName}`,
      description: `Les spas établis de ${area.frenchName} peuvent s’inscrire à la liste des partenaires fondateurs.`,
      images: ["/ontario/og-ontario.png"],
    },
    other: {
      "geo.region": "CA-ON",
      "geo.placename": area.frenchName,
    },
    robots: { index: isPublicLaunch, follow: isPublicLaunch },
  };
}

export default async function Page({ params }: PageProps) {
  const { area: slug } = await params;
  const area = getOntarioArea(slug);
  if (!area) notFound();
  const config = buildOntarioAreaConfig(area, "fr");
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${config.pageUrl}#webpage`,
        name: `SpaPlus arrive à ${area.frenchName}`,
        url: config.pageUrl,
        description: area.frenchLead,
        inLanguage: "fr-CA",
        isPartOf: { "@id": "https://spaplus.co/#website" },
        about: { "@id": "https://spaplus.co/#organization" },
        spatialCoverage: {
          "@type": "AdministrativeArea",
          name: area.frenchName,
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
            name: "SpaPlus mondial",
            item: "https://spaplus.co/fr-ca/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Ontario",
            item: "https://app.spaplus.co/fr-ca/ontario/",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: area.frenchName,
            item: config.pageUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `L’inscription d’un spa de ${area.frenchName} est-elle gratuite?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: "Oui. L’inscription est gratuite, ne demande aucune carte de crédit et ne crée aucun engagement.",
            },
          },
          {
            "@type": "Question",
            name: `Quand SpaPlus sera-t-il lancé à ${area.frenchName}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: "La date de lancement n’a pas encore été annoncée. Les inscriptions prioritaires nous aident à préparer le groupe local de partenaires fondateurs.",
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
