import type { Metadata } from "next";
import NewSpaDemo from "./NewSpaDemo";
import "./new-spa-demo.css";

export const metadata: Metadata = {
  title: "New spa workspace demo | SpaPlus",
  description: "A private demonstration of the first-day SpaPlus partner workspace.",
  robots: { index: false, follow: false },
};

export default function NewSpaDemoPage() {
  return <NewSpaDemo />;
}
