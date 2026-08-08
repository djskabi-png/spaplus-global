import type { Metadata } from "next";
import "./adir-projects.css";
import AdirProjectsClient from "./AdirProjectsClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "הפרויקטים של אדיר",
  description: "תמונת מצב פרטית של הפרויקטים, ההתקדמות והשלב הבא.",
  robots: { index: false, follow: false },
};

export default function AdirProjectsPage() {
  return <AdirProjectsClient />;
}
