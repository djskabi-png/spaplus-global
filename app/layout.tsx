import type { Metadata } from "next";
import { headers } from "next/headers";
import { Heebo, Noto_Sans } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "latin-ext", "cyrillic", "greek"],
  weight: "variable",
  display: "swap",
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: "variable",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spaplus.co"),
  title: "SpaPlus Global | Discover. Book. Relax.",
  description:
    "SpaPlus is building the global home for spa and wellness, backed by 20+ years of experience in Israel and now growing in Canada.",
  icons: {
    icon: [{ url: "/spaplus-mark.png?v=3", type: "image/png" }],
    shortcut: "/spaplus-mark.png?v=3",
    apple: "/spaplus-mark.png?v=3",
  },
  openGraph: {
    title: "SpaPlus Global | Discover. Book. Relax.",
    description:
      "The global home for spa and wellness, backed by 20+ years of experience.",
    url: "/",
    siteName: "SpaPlus Global",
    images: [{ url: "/og.png", width: 1734, height: 907, alt: "SpaPlus Global" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpaPlus Global | Discover. Book. Relax.",
    description:
      "The global home for spa and wellness, backed by 20+ years of experience.",
    images: ["/og.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const documentLanguage = (await headers()).get("x-spaplus-document-language") || "en";

  return (
    <html lang={documentLanguage} dir={documentLanguage === "he" ? "rtl" : "ltr"}>
      <body className={`${notoSans.variable} ${heebo.variable}`}>
        {children}
      </body>
    </html>
  );
}
