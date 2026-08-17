import type { Metadata } from "next";
import MarketLaunchPage from "../../market-launch/MarketLaunchPage";
import { israelMarket } from "../../market-launch/markets";

const canonicalUrl = "https://app.spaplus.co/he-il/israel/";

export const metadata: Metadata = {
  title: "SpaPlus ישראל | שותפים מבתי ספא",
  description: "SpaPlus בונה בישראל ערוץ ייעודי לגילוי ולהזמנה של חוויות ספא, ומזמינה בתי ספא מבוססים להציג את העסק לבדיקת התאמה.",
  alternates: { canonical: canonicalUrl, languages: { he: canonicalUrl, "x-default": canonicalUrl } },
  openGraph: { title: "SpaPlus ישראל | שותפים מבתי ספא", description: "עמוד פנייה ראשונית לבתי ספא מבוססים בישראל.", url: canonicalUrl, siteName: "SpaPlus", locale: "he_IL", type: "website", images: [{ url: "/ontario/og-ontario.png", width: 1536, height: 1024, alt: "המחשת קמפיין SpaPlus. אינה מציגה בית ספא ישראלי או שותף קיים." }] },
  twitter: { card: "summary_large_image", title: "SpaPlus ישראל | שותפים מבתי ספא", description: "בתי ספא מבוססים בישראל מוזמנים להציג את העסק לבדיקת התאמה.", images: ["/ontario/og-ontario.png"] },
  robots: { index: false, follow: false },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://spaplus.co/#organization", name: "SpaPlus", legalName: "GLOBAL SPA MANAGEMENT LTD", url: "https://spaplus.co/" },
    { "@type": "WebPage", "@id": `${canonicalUrl}#webpage`, url: canonicalUrl, name: "SpaPlus ישראל | שותפים מבתי ספא", description: "עמוד פנייה ראשונית לבתי ספא מבוססים בישראל.", inLanguage: "he-IL", about: { "@id": "https://spaplus.co/#organization" } },
  ],
};

export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><MarketLaunchPage config={israelMarket} /></>;
}
