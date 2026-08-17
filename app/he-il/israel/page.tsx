import type { Metadata } from "next";
import MarketLaunchPage from "../../market-launch/MarketLaunchPage";
import { israelMarket } from "../../market-launch/markets";

const canonicalUrl = "https://app.spaplus.co/he-il/israel/";

export const metadata: Metadata = {
  title: "הצטרפות בתי ספא ל־SpaPlus ישראל | פועלים מאז 2005",
  description: "SpaPlus פועלת בישראל מאז 2005 ופתוחה כעת להוסיף בתי ספא איכותיים מכל הארץ. הציגו את המקום שלכם ובדקו התאמה לפלטפורמה.",
  keywords: ["הצטרפות בתי ספא", "SpaPlus ישראל", "שיווק בתי ספא", "הזמנות ספא", "שותפות ספא"],
  alternates: { canonical: canonicalUrl, languages: { he: canonicalUrl, "x-default": canonicalUrl } },
  openGraph: { title: "הצטרפות בתי ספא ל־SpaPlus ישראל", description: "יותר מעשרים שנות פעילות בישראל. עכשיו אנחנו פתוחים להוסיף מקומות מצוינים.", url: canonicalUrl, siteName: "SpaPlus", locale: "he_IL", type: "website", images: [{ url: "https://www.spaplus.co.il/gallery/1708422320068752.jpeg", alt: "ספא קלרינס בירושלים, מתוך רשומה פעילה באתר SpaPlus ישראל." }] },
  twitter: { card: "summary_large_image", title: "הצטרפות בתי ספא ל־SpaPlus ישראל", description: "SpaPlus פועלת בישראל מאז 2005 ופתוחה כעת להוסיף בתי ספא איכותיים.", images: ["https://www.spaplus.co.il/gallery/1708422320068752.jpeg"] },
  robots: { index: true, follow: true },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://www.spaplus.co.il/#organization", name: "SpaPlus", legalName: "GLOBAL SPA MANAGEMENT LTD", url: "https://www.spaplus.co.il/" },
    { "@type": "WebPage", "@id": `${canonicalUrl}#webpage`, url: canonicalUrl, name: "הצטרפות בתי ספא ל־SpaPlus ישראל", description: "SpaPlus פועלת בישראל מאז 2005 ופתוחה כעת להוסיף בתי ספא איכותיים מכל הארץ.", inLanguage: "he-IL", about: { "@id": "https://www.spaplus.co.il/#organization" } },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "SpaPlus ישראל", item: "https://www.spaplus.co.il/" },
      { "@type": "ListItem", position: 2, name: "הצטרפות בתי ספא", item: canonicalUrl },
    ] },
  ],
};

export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><MarketLaunchPage config={israelMarket} /></>;
}
