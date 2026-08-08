import type { Metadata } from "next";
import "./adir-projects.css";
import AdirProjectsClient from "./AdirProjectsClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "הפרויקטים של אדיר נאור",
  description: "מה אדיר נאור כבר בנה, מה נמצא בבנייה עכשיו ומה מגיע בהמשך.",
  alternates: { canonical: "https://adir.spaplus.co/" },
  robots: { index: true, follow: true },
  icons: { icon: "https://adir.spaplus.co/adir-ai-empire-icon.png", apple: "https://adir.spaplus.co/adir-ai-empire-icon.png" },
  openGraph: {
    title: "הפרויקטים של אדיר נאור",
    description: "מה כבר בניתי. מה אני בונה עכשיו. ומה מגיע אחר כך.",
    url: "https://adir.spaplus.co/",
    siteName: "אימפריית אדיר",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "הפרויקטים של אדיר נאור",
    description: "רשימת הפרויקטים של אדיר נאור ורמת ההתקדמות של כל פרויקט.",
    images: ["https://adir.spaplus.co/adir-ai-empire-icon.png"],
  },
};

export default function AdirProjectsPage() {
  return <AdirProjectsClient />;
}
