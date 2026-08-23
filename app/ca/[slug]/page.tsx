import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRecruitmentPreviewBySlug } from "../../spa-preview";
import CanadaSpaProfile from "./CanadaSpaProfile";
import "./spa-preview.css";
import "./spa-preview-controls.css";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const preview = await getRecruitmentPreviewBySlug(slug);
  if (!preview || preview.status !== "shared") return { robots: { index: false, follow: false } };
  const language = lang === "fr-CA" ? "fr-CA" : "en";
  const content = preview.localizedContent[language] || { address: preview.address, about: preview.about, hours: preview.hours, treatments: preview.treatments, spaPackage: preview.spaPackage };
  const title = `${preview.spaName} | SpaPlus Canada`;
  const description = content.about.slice(0, 155);
  return {
    title,
    description,
    robots: { index: false, follow: false, nocache: true },
    openGraph: {
      title,
      description,
      url: `https://spaplus.co/ca/${preview.slug}`,
      siteName: "SpaPlus Canada",
      type: "website",
      images: preview.photoUrls[0] ? [{ url: preview.photoUrls[0], alt: preview.spaName }] : [],
    },
    twitter: {
      card: preview.photoUrls[0] ? "summary_large_image" : "summary",
      title,
      description,
      images: preview.photoUrls[0] ? [preview.photoUrls[0]] : [],
    },
  };
}

export default async function SpaPreviewPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const preview = await getRecruitmentPreviewBySlug(slug);
  if (!preview || preview.status !== "shared") notFound();
  return <CanadaSpaProfile preview={preview} initialLanguage={lang === "fr-CA" ? "fr-CA" : "en"} />;
}
