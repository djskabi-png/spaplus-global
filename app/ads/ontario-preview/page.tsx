import type { Metadata } from "next";
import styles from "./preview.module.css";

export const metadata: Metadata = {
  title: "SpaPlus Canada | Ontario campaign preview",
  description: "Approved English and Canadian French campaign creative for the SpaPlus Ontario launch.",
  robots: { index: false, follow: false },
};

const variants = [
  { key: "square", label: "Square feed", ratio: "1:1" },
  { key: "portrait", label: "Portrait feed", ratio: "4:5" },
  { key: "story", label: "Stories and Reels", ratio: "9:16" },
] as const;

const languages = [
  { code: "en", title: "English, Canada", badge: "EN CA" },
  { code: "fr", title: "Français, Canada", badge: "FR CA" },
] as const;

export default function OntarioCampaignPreview() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <img
          className={styles.logo}
          src="/ontario/spaplus-canada-logo.png"
          alt="SpaPlus Canada"
        />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>ONTARIO CAMPAIGN CREATIVE</p>
          <h1>Built to get the right spas discovered.</h1>
          <p>
            Final creative preview for Facebook and Instagram, prepared in Canadian English and Canadian French.
          </p>
        </div>
      </header>

      <section className={styles.notice} aria-label="Creative disclosure">
        <strong>Creative note</strong>
        <span>
          The wellness setting is an illustrative SpaPlus launch concept. It does not depict an Ontario partner location.
        </span>
      </section>

      {languages.map((language) => (
        <section className={styles.languageSection} key={language.code}>
          <div className={styles.sectionHeading}>
            <span>{language.badge}</span>
            <h2>{language.title}</h2>
          </div>
          <div className={styles.grid}>
            {variants.map((variant) => (
              <article className={styles.card} key={variant.key}>
                <div className={styles.cardHeading}>
                  <h3>{variant.label}</h3>
                  <span>{variant.ratio}</span>
                </div>
                <img
                  src={`/ads/ontario-preview/${language.code}-a-${variant.key}.jpg`}
                  alt={`${language.title} ${variant.label} campaign creative`}
                />
              </article>
            ))}
          </div>
        </section>
      ))}

      <footer className={styles.footer}>
        <p>SpaPlus Canada</p>
        <a href="https://app.spaplus.co/en-ca/ontario">View the Ontario landing page</a>
      </footer>
    </main>
  );
}
