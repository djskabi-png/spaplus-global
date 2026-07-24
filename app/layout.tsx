import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Hebrew } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "latin-ext", "cyrillic", "greek"],
  weight: "variable",
  display: "swap",
});

const notoSansHebrew = Noto_Sans_Hebrew({
  variable: "--font-noto-sans-hebrew",
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
    icon: "/spaplus-logo.png",
    shortcut: "/spaplus-logo.png",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${notoSans.variable} ${notoSansHebrew.variable}`}>
        {children}
      </body>
    </html>
  );
}
