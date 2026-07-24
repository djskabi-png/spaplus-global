"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import {
  isLocale,
  localeFromBrowser,
  localeOptions,
  translations,
  type Locale,
} from "./i18n";
import companyData from "./company-data.json";

const israelUrl = "https://www.spaplus.co.il/";
const localeStorageKey = "spaplus-global-locale";
const contactEmail = "info@spaplus.ca";
const contactFormEndpoint =
  "https://formsubmit.co/ajax/93567c940af3bbace0ca1b462708c256";

function BrandLockup({ footer = false }: { footer?: boolean }) {
  return (
    <span className={`brand-lockup ${footer ? "footer-lockup" : ""}`}>
      <Image
        className="brand-mark"
        src="/spaplus-mark.png"
        alt=""
        width={80}
        height={80}
        priority={!footer}
      />
      <Image
        className="brand-wordmark"
        src="/spaplus-wordmark.png"
        alt="SpaPlus"
        width={112}
        height={60}
        priority={!footer}
      />
    </span>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");
  const [emailCopied, setEmailCopied] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>(
    {},
  );
  const [formStatus, setFormStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const t = translations[locale];
  const company = companyData.copy[locale];
  const canadaUrl =
    locale === "fr-CA" ? "https://spaplus.ca/fr/" : "https://spaplus.ca/en/";

  useEffect(() => {
    const queryLocale = new URLSearchParams(window.location.search).get("lang");
    const storedLocale = window.localStorage.getItem(localeStorageKey);
    if (isLocale(queryLocale)) {
      setLocale(queryLocale);
    } else if (isLocale(storedLocale)) {
      setLocale(storedLocale);
    } else {
      setLocale(localeFromBrowser(navigator.languages));
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = locale === "he" ? "rtl" : "ltr";
    document.title = t.pageTitle;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", t.pageDescription);
    window.localStorage.setItem(localeStorageKey, locale);

    const url = new URL(window.location.href);
    if (locale === "en") {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", locale);
    }
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [locale, t.pageDescription, t.pageTitle]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
      setShowBackToTop(window.scrollY > 640);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const copyContactEmail = async () => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(contactEmail);
    } else {
      const input = document.createElement("textarea");
      input.value = contactEmail;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setEmailCopied(true);
    window.setTimeout(() => setEmailCopied(false), 2200);
  };

  const submitContactForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const organization = String(data.get("organization") || "");
    const topic = String(data.get("topic") || company.topics[0]);
    const message = String(data.get("message") || "");
    const honey = String(data.get("_honey") || "");

    setFormStatus("sending");
    try {
      const response = await fetch(contactFormEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: `${company.formSubject} | ${topic} | ${name}`,
          _template: "box",
          _captcha: "false",
          _honey: honey,
          _replyto: email,
          [company.formName]: name,
          Email: email,
          [company.formCompany]: organization || "Not provided",
          [company.formTopic]: topic,
          [company.formMessage]: message,
          Language: locale,
          Source: window.location.href,
        }),
      });
      const result = (await response.json()) as { success?: string | boolean };
      if (!response.ok || String(result.success) !== "true") {
        throw new Error("Submission failed");
      }
      form.reset();
      setFormStatus("success");
    } catch {
      setFormStatus("error");
    }
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        {t.skip}
      </a>

      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <a className="brand" href="#top" aria-label={t.homeLabel}>
          <BrandLockup />
        </a>

        <div className="header-actions">
          <nav className="desktop-nav" aria-label={t.mainNavigation}>
            <a href="#vision">{t.navVision}</a>
            <a href="#countries">{t.navCountries}</a>
            <a href="#story">{t.navStory}</a>
            <a href="#about">{t.aboutEyebrow}</a>
            <a href="#contact">{t.contact}</a>
            <a className="button button-outline button-small" href="#countries">
              {t.chooseCountry}
            </a>
          </nav>

          <label className="language-switcher">
            <span className="sr-only">{t.languageLabel}</span>
            <span aria-hidden="true">A</span>
            <select
              value={locale}
              aria-label={t.languageLabel}
              onChange={(event) => setLocale(event.target.value as Locale)}
            >
              {localeOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            className="menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t.closeMenu : t.openMenu}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <nav
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? "is-open" : ""}`}
        aria-label={t.mobileNavigation}
      >
        <a href="#vision" onClick={closeMenu}>
          {t.navVision}
        </a>
        <a href="#countries" onClick={closeMenu}>
          {t.navCountries}
        </a>
        <a href="#story" onClick={closeMenu}>
          {t.navStory}
        </a>
        <a href="#about" onClick={closeMenu}>
          {t.aboutEyebrow}
        </a>
        <a href="#contact" onClick={closeMenu}>
          {t.contact}
        </a>
        <a
          className="button button-primary"
          href="#countries"
          onClick={closeMenu}
        >
          {t.chooseCountry}
        </a>
      </nav>

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow hero-animate delay-1">{t.heroEyebrow}</p>
            <h1 className="hero-animate delay-2">
              {t.heroTitle} <span>{t.heroTitleAccent}</span>
            </h1>
            <p className="hero-intro hero-animate delay-3">{t.heroIntro}</p>
            <div className="hero-actions hero-animate delay-4">
              <a className="button button-primary" href="#countries">
                {t.chooseCountry}
              </a>
              <a className="text-link" href="#vision">
                {t.discoverVision}
              </a>
            </div>
          </div>

          <div
            className="hero-image"
            role="img"
            aria-label={t.promiseBody}
          >
            <div className="promise-card hero-animate delay-4">
              <strong>{t.promiseTitle}</strong>
              <span>{t.promiseBody}</span>
            </div>
          </div>
        </section>

        <section className="section countries-section" id="countries">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">{t.worldEyebrow}</p>
            <h2>{t.worldTitle}</h2>
            <p>{t.worldBody}</p>
          </div>

          <div className="country-grid">
            <a
              className="country-card israel-card"
              href={israelUrl}
              aria-label={t.israelAria}
              data-reveal
            >
              <div className="country-content">
                <span className="card-label">{t.israelLabel}</span>
                <h3>{t.israelName}</h3>
                <p>{t.israelBody}</p>
                <span className="card-button">{t.israelButton}</span>
              </div>
            </a>

            <a
              className="country-card canada-card"
              href={canadaUrl}
              aria-label={t.canadaAria}
              data-reveal
            >
              <div className="country-content">
                <span className="card-label">{t.canadaLabel}</span>
                <h3>{t.canadaName}</h3>
                <p>{t.canadaBody}</p>
                <span className="card-button">{t.canadaButton}</span>
              </div>
            </a>
          </div>

          <div className="coming-card" data-reveal aria-label={t.usaAria}>
            <div className="usa-visual" aria-hidden="true">
              <span className="usa-flag">
                <span className="usa-canton" />
              </span>
              <span className="usa-code">USA</span>
            </div>
            <div className="usa-copy">
              <span className="usa-status-local">{t.comingSoon}</span>
              <strong className="usa-coming">COMING SOON</strong>
              <h3>{t.usaName}</h3>
              <p>{t.usaBody}</p>
            </div>
          </div>
        </section>

        <section className="section vision-section" id="vision">
          <div className="vision-brand" data-reveal>
            <div className="logo-card">
              <BrandLockup />
            </div>
          </div>
          <div className="vision-copy" data-reveal>
            <p className="eyebrow">{t.visionEyebrow}</p>
            <h2>{t.visionTitle}</h2>
            <p>{t.visionBodyOne}</p>
            <p>{t.visionBodyTwo}</p>
            <div className="proof-grid">
              <div>
                <strong>20+</strong>
                <span>{t.proofYears}</span>
              </div>
              <div>
                <strong>2</strong>
                <span>{t.proofMarkets}</span>
              </div>
              <div>
                <strong>1</strong>
                <span>{t.proofPromise}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section story-section" id="story">
          <div className="story-copy" data-reveal>
            <p className="eyebrow">{t.storyEyebrow}</p>
            <h2>{t.storyTitle}</h2>
            <p>{t.storyBodyOne}</p>
            <p>{t.storyBodyTwo}</p>
          </div>
          <div className="story-image" data-reveal>
            <span>{t.storyImage}</span>
          </div>
        </section>

        <section className="section benefits-section">
          <div className="section-heading centered" data-reveal>
            <p className="eyebrow">{t.experienceEyebrow}</p>
            <h2>{t.experienceTitle}</h2>
          </div>
          <div className="benefit-grid">
            <article data-reveal>
              <span className="benefit-number">01</span>
              <h3>{t.benefitOneTitle}</h3>
              <p>{t.benefitOneBody}</p>
            </article>
            <article data-reveal>
              <span className="benefit-number">02</span>
              <h3>{t.benefitTwoTitle}</h3>
              <p>{t.benefitTwoBody}</p>
            </article>
            <article data-reveal>
              <span className="benefit-number">03</span>
              <h3>{t.benefitThreeTitle}</h3>
              <p>{t.benefitThreeBody}</p>
            </article>
          </div>
        </section>

        <section className="partner-section">
          <div data-reveal>
            <p className="eyebrow light">{t.partnerEyebrow}</p>
            <h2>{t.partnerTitle}</h2>
            <p>{t.partnerBody}</p>
          </div>
          <a className="button button-light" href="#contact">
            {t.partnerButton}
          </a>
        </section>

        <section
          className="about-section"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="about-intro-grid">
            <div className="about-intro-copy" data-reveal>
              <p className="eyebrow light">{t.aboutEyebrow}</p>
              <h2 id="about-title">{t.aboutTitle}</h2>
              <p>{t.aboutBody}</p>
            </div>
            <aside className="technology-principle" data-reveal>
              <p className="eyebrow light">{company.technologyEyebrow}</p>
              <h3>{company.technologyTitle}</h3>
              <p>{company.technologyBody}</p>
              <strong>{company.technologyStatement}</strong>
            </aside>
          </div>

          <div className="timeline-block" data-reveal>
            <h3>{company.timelineTitle}</h3>
            <div className="timeline-grid">
              {company.timeline.map((item) => (
                <article key={`${item.year}-${item.title}`}>
                  <span>{item.year}</span>
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="founder-team-grid">
            <article className="founder-card" data-reveal>
              <div className="founder-identity">
                <Image
                  className="founder-photo"
                  src="/adir-naor-founder.jpg"
                  alt={locale === "he" ? "אדיר נאור" : "Adir Naor"}
                  width={720}
                  height={720}
                />
                <div>
                  <span>{t.founderRole}</span>
                  <h3>{locale === "he" ? "אדיר נאור" : "Adir Naor"}</h3>
                </div>
              </div>
              <p>{t.founderBio}</p>
              <blockquote>{t.founderQuote}</blockquote>
            </article>

            <div className="team-heading" data-reveal>
              <p className="eyebrow light">{company.teamEyebrow}</p>
              <h3>{company.teamTitle}</h3>
              <p>{company.teamIntro}</p>
            </div>
          </div>

          <div className="organization-grid">
            {(["leadership", "technology", "business"] as const).map((group) => {
              const members = companyData.team.filter(
                (member) => member.group === group,
              );
              const expanded = Boolean(expandedTeams[group]);
              return (
                <section className="team-group" key={group} data-reveal>
                  <h3>{company.groups[group]}</h3>
                  <div className="team-list">
                    {members.map((member, index) => {
                      const name =
                        locale === "he" ? member.nameHe : member.nameLatin;
                      const initials = name
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("");
                      return (
                        <article
                          className="team-member"
                          key={`${member.nameLatin}-${member.role}`}
                          hidden={!expanded && index >= 3}
                        >
                          <span className="team-initials" aria-hidden="true">
                            {initials}
                          </span>
                          <div>
                            <h4>{name}</h4>
                            <p>
                              {
                                (company.roles as Record<string, string>)[
                                  member.role
                                ]
                              }
                            </p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  {members.length > 3 && (
                    <button
                      className="team-toggle"
                      type="button"
                      aria-expanded={expanded}
                      onClick={() =>
                        setExpandedTeams((current) => ({
                          ...current,
                          [group]: !current[group],
                        }))
                      }
                    >
                      <span>
                        {expanded
                          ? company.teamShowLess
                          : company.teamShowMore}
                      </span>
                      <i aria-hidden="true" />
                    </button>
                  )}
                </section>
              );
            })}
          </div>

          <div className="service-team-note" data-reveal>
            <h3>{company.serviceTeamTitle}</h3>
            <p>{company.serviceTeamBody}</p>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-copy" data-reveal>
            <p className="eyebrow">{t.contact}</p>
            <h2>{company.contactTitle}</h2>
            <p>{company.contactBody}</p>
            <div className="direct-email">
              <span>{company.directEmail}</span>
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              <button
                type="button"
                onClick={copyContactEmail}
                aria-live="polite"
              >
                {emailCopied ? t.emailCopied : t.copyEmail}
              </button>
            </div>
          </div>

          <form key={locale} className="contact-form" onSubmit={submitContactForm} data-reveal>
            <label className="form-honey" aria-hidden="true">
              <span>Leave this field empty</span>
              <input name="_honey" type="text" tabIndex={-1} autoComplete="off" />
            </label>
            <label>
              <span>{company.formName}</span>
              <input name="name" type="text" autoComplete="name" required />
            </label>
            <label>
              <span>{company.formEmail}</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label className="form-wide">
              <span>{company.formCompany}</span>
              <input
                name="organization"
                type="text"
                autoComplete="organization"
              />
            </label>
            <label className="form-wide">
              <span>{company.formTopic}</span>
              <select name="topic" defaultValue={company.topics[0]}>
                {company.topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-wide">
              <span>{company.formMessage}</span>
              <textarea name="message" rows={6} required />
            </label>
            <div className="form-submit form-wide">
              <button
                className="button button-primary"
                type="submit"
                disabled={formStatus === "sending"}
              >
                {formStatus === "sending"
                  ? company.formSending
                  : company.formSubmit}
              </button>
              <p>{company.formNote}</p>
              {formStatus === "success" && (
                <strong className="form-status is-success" role="status">
                  {company.formReady}
                </strong>
              )}
              {formStatus === "error" && (
                <strong className="form-status is-error" role="alert">
                  {company.formError}
                </strong>
              )}
            </div>
          </form>
        </section>
      </main>

      <button
        className={`back-to-top ${showBackToTop ? "is-visible" : ""}`}
        type="button"
        aria-label={companyData.backToTop[locale]}
        title={companyData.backToTop[locale]}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <span aria-hidden="true" />
      </button>

      <footer className="site-footer">
        <div className="footer-main">
          <BrandLockup footer />
          <p>{t.footerTagline}</p>
          <nav aria-label={t.footerNavigation}>
            <a href="#vision">{t.navVision}</a>
            <a href={israelUrl}>{t.israelName}</a>
            <a href={canadaUrl}>{t.canadaName}</a>
            <span>
              {t.usaName} {t.comingSoon}
            </span>
            <a href="#about">{t.aboutEyebrow}</a>
            <a href="#contact">{t.contact}</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} SpaPlus Global. {t.rights}
          </span>
          <span>spaplus.co</span>
        </div>
      </footer>
    </>
  );
}
