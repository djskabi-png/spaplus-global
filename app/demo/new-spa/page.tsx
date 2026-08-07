import type { Metadata } from "next";
import NewSpaDemo from "./NewSpaDemo";
import "./new-spa-demo.css";

export const metadata: Metadata = {
  title: "SpaPlus Canada operations workspace demo",
  description: "An illustrative first-day workspace for a new SpaPlus Canada partner.",
  robots: { index: false, follow: false },
};

export default function NewSpaDemoPage() {
  return <NewSpaDemo />;
}
