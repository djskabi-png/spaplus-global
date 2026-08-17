"use client";

import {
  CSSProperties,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./market-launch.module.css";
import { marketCopyFieldKey } from "./market-copy";
import { israelCopy } from "./israel-market-copy";
import {
  initializeSpaPlusAnalytics,
  setSpaPlusAnalyticsConsent,
  trackAnalyticsEvent,
} from "../analytics";

type SubmitState = "idle" | "submitting" | "success" | "error";

export type MarketLaunchConfig = {
  marketName: string;
  marketSlug: string;
  countryName: string;
  primaryCity: string;
  locale: string;
  languageTag: string;
  timeZone: string;
  pageUrl: string;
  homeHref: string;
  heroImage: string;
  heroDisclosure?: string;
  leadEndpoint: string;
  reviewWindowHours: number;
  referenceMarketName: string;
  referenceCountryName: string;
  referenceSpas: Array<{
    name: string;
    location: string;
    image: string;
    imageAlt: string;
  }>;
  priorityAreas: Array<{
    label: string;
    href: string;
  }>;
  regionOptions?: Array<{
    value: string;
    label: string;
  }>;
  languageLinks: Array<{
    label: string;
    ariaLabel: string;
    languageTag: string;
    href: string;
    active: boolean;
  }>;
  pageMode?: "launch" | "network";
  showVideo?: boolean;
  copyOverrides?: Record<string, { en: string; fr: string }>;
  cmsSection?: string;
  resourceKey?: string;
  marketLinks?: Array<{
    label: string;
    href: string;
    active: boolean;
  }>;
  selectedArea?: {
    slug: string;
    name: string;
    lead: string;
    focus: string[];
  };
};

const spaTypes = [
  { field: "spaTypeDaySpa", value: "Day spa", en: "Day spa", fr: "Spa urbain ou spa de jour" },
  {
    field: "spaTypeHotelResort",
    value: "Hotel or resort spa",
    en: "Hotel or resort spa",
    fr: "Spa d’hôtel ou de centre de villégiature",
  },
  {
    field: "spaTypeNordicThermal",
    value: "Nordic or thermal spa",
    en: "Nordic or thermal spa",
    fr: "Spa nordique ou thermal",
  },
  {
    field: "spaTypeMedicalWellness",
    value: "Medical or wellness spa",
    en: "Medical or wellness spa",
    fr: "Médico-spa ou centre mieux-être",
  },
  {
    field: "spaTypeMultiLocation",
    value: "Multi-location spa group",
    en: "Multi-location spa group",
    fr: "Groupe de spas multisites",
  },
  {
    field: "spaTypeOtherEstablished",
    value: "Other established spa venue",
    en: "Other established spa venue",
    fr: "Autre établissement de spa reconnu",
  },
];

const serviceOptions = [
  { field: "serviceMassage", value: "Massage", en: "Massage", fr: "Massothérapie" },
  {
    field: "serviceFacials",
    value: "Facials and skincare",
    en: "Facials and skincare",
    fr: "Soins du visage et de la peau",
  },
  {
    field: "serviceBodyTreatments",
    value: "Body treatments",
    en: "Body treatments",
    fr: "Soins du corps",
  },
  {
    field: "serviceThermalNordic",
    value: "Thermal or Nordic experience",
    en: "Thermal or Nordic experience",
    fr: "Expérience thermale ou nordique",
  },
  {
    field: "serviceCouples",
    value: "Couples experiences",
    en: "Couples experiences",
    fr: "Expériences en couple",
  },
  {
    field: "serviceGroups",
    value: "Group experiences",
    en: "Group experiences",
    fr: "Expériences de groupe",
  },
  { field: "serviceDayPasses", value: "Day passes", en: "Day passes", fr: "Accès à la journée" },
  { field: "serviceSpaStays", value: "Spa stays", en: "Spa stays", fr: "Séjours spa" },
];

const protectedSpaLeadFormFlags = new Set([
  "formFieldOrganizationVisible",
  "formFieldWebsiteVisible",
  "formFieldCityVisible",
  "formFieldNameVisible",
  "formFieldPhoneVisible",
  "formFieldEmailVisible",
  "formFieldSpaTypeVisible",
  "formFieldServicesVisible",
  ...spaTypes.map((item) => `${item.field}Enabled`),
  ...serviceOptions.map((item) => `${item.field}Enabled`),
]);

const requiredSpaLeadFields = new Set([
  "Organization",
  "Phone",
  "Name",
  "City",
  "Email",
]);

function trackMarketEvent(
  site: "ontario" | "canada",
  event: string,
  data: Record<string, string> = {},
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("spaplus:marketing-event", {
      detail: { event, ...data },
    }),
  );
  trackAnalyticsEvent(site, event, data);
}

export default function MarketLaunchPage({
  config,
}: {
  config: MarketLaunchConfig;
}) {
  const {
    marketName,
    marketSlug,
    countryName,
    primaryCity,
    locale,
    languageTag,
    homeHref,
    heroImage,
    heroDisclosure,
    leadEndpoint,
    reviewWindowHours,
    referenceMarketName,
    referenceCountryName,
    referenceSpas,
    priorityAreas,
    regionOptions = [],
    languageLinks,
    marketLinks = [],
    selectedArea,
  } = config;
  const isFrench = languageTag.toLowerCase().startsWith("fr");
  const isHebrew = languageTag.toLowerCase().startsWith("he");
  const isNetwork = config.pageMode === "network";
  const cmsSection = config.cmsSection || "market.ca-on";
  const eventPrefix = marketSlug.replace(/[^a-z0-9_]+/g, "_");
  const analyticsSite = marketSlug === "ontario" ? "ontario" : "canada";
  const track = (event: string, data: Record<string, string> = {}) =>
    trackMarketEvent(analyticsSite, event, data);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [formStarted, setFormStarted] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerCompact, setHeaderCompact] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [cmsCopy, setCmsCopy] = useState<Record<string, string>>({});
  const normalizeDisplayCopy = (value: string) =>
    marketSlug === "quebec" && !isFrench
      ? value.replaceAll("QUÉBEC", "QUEBEC").replaceAll("Québec", "Quebec")
      : value;
  const override = (field: string) =>
    config.copyOverrides?.[field]?.[isFrench ? "fr" : "en"];
  const managed = (field: string, fallback: string) =>
    normalizeDisplayCopy(
      selectedArea
        ? fallback
        : cmsCopy[field] || (isHebrew ? israelCopy(field, "") : "") || override(field) || fallback,
    );
  const tr = (english: string, french: string) =>
    managed(
      marketCopyFieldKey(english),
      override(english) || (isHebrew ? israelCopy(english, english) : isFrench ? french : english),
    );
  const dynamicCopy = (field: string, english: string, french: string) =>
    managed(field, isHebrew ? israelCopy(field, israelCopy(english, english)) : isFrench ? french : english);
  const formFlag = (field: string, fallback: boolean) => {
    // A content-editor setting must never make the active Quebec lead form
    // impossible to complete or remove the contact number needed for follow-up.
    if ((marketSlug === "quebec" || marketSlug === "ontario" || marketSlug === "israel") && protectedSpaLeadFormFlags.has(field)) {
      return true;
    }
    // Form behaviour is shared by the Ontario page and its city pages.
    // City copy can remain specific while visibility and validation stay consistent.
    const value = (cmsCopy[field] || (fallback ? "true" : "false")).toLowerCase();
    return value === "true";
  };
  const fieldVisible = (field: string) => formFlag(`formField${field}Visible`, true);
  const fieldRequired = (field: string, fallback = true) =>
    fieldVisible(field) && (
      marketSlug === "quebec" || marketSlug === "ontario" || marketSlug === "israel"
        ? requiredSpaLeadFields.has(field)
        : formFlag(`formField${field}Required`, fallback)
    );
  const fieldLabel = (field: string, label: string, fallback = true) => (
    <>
      {label}
      <span className={fieldRequired(field, fallback) ? styles.requiredBadge : styles.optionalBadge}>
        {fieldRequired(field, fallback) ? tr("Required", "Obligatoire") : tr("Optional", "Facultatif")}
      </span>
    </>
  );
  const visibleSpaTypes = spaTypes.filter((item) =>
    formFlag(`${item.field}Enabled`, true),
  );
  const visibleServiceOptions = serviceOptions.filter((item) =>
    formFlag(`${item.field}Enabled`, true),
  );
  const campaignData = useMemo(() => {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"]
        .map((key) => [key, params.get(key) || ""])
        .filter(([, value]) => value),
    );
  }, []);

  useEffect(() => {
    document.documentElement.lang = languageTag;
    document.documentElement.dir = isHebrew ? "rtl" : "ltr";
  }, [isHebrew, languageTag]);

  useEffect(() => {
    const fallbackTitle = isNetwork
      ? isFrench
        ? "Joignez SpaPlus Canada hors Ontario | Partenaires spa"
        : "Join SpaPlus Canada outside Ontario | Spa partners"
      : isFrench
      ? "SpaPlus arrive en Ontario | Spas partenaires fondateurs"
      : "SpaPlus is coming to Ontario | Founding spa partners";
    const fallbackDescription = isNetwork
      ? isFrench
        ? "Présentez votre spa à SpaPlus Canada. Cette page partenaires s'adresse aux spas reconnus partout au Canada, à l'exception de l'Ontario."
        : "Introduce your spa to SpaPlus Canada. This partner page serves established spas across Canada outside Ontario."
      : isFrench
      ? "SpaPlus prépare son lancement en Ontario. Les spas établis peuvent s’inscrire à la liste des partenaires fondateurs, gratuitement, sans engagement et sans carte de crédit."
      : "SpaPlus is preparing to launch in Ontario. Established spas can join the founding partner list with no fee, no commitment and no credit card.";
    const title = managed(isNetwork ? "seoTitleOutsideOntario" : "seoTitle", fallbackTitle);
    const description = managed(isNetwork ? "seoDescriptionOutsideOntario" : "seoDescription", fallbackDescription);
    const imageAlt = managed(
      "seoImageAlt",
      isNetwork
        ? isFrench
          ? "Concept visuel de SpaPlus Canada. Il ne représente pas un spa partenaire précis."
          : "Illustrative SpaPlus Canada artwork. It does not depict a specific partner spa."
        : isFrench
        ? "Concept visuel illustratif du lancement de SpaPlus en Ontario. Il ne représente pas un partenaire ontarien."
        : "Illustrative SpaPlus Ontario launch artwork. It does not depict an Ontario partner.",
    );
    document.title = title;
    for (const [selector, value] of [
      ['meta[name="description"]', description],
      ['meta[property="og:title"]', title],
      ['meta[property="og:description"]', description],
      ['meta[name="twitter:title"]', title],
      ['meta[name="twitter:description"]', description],
      ['meta[property="og:image:alt"]', imageAlt],
      ['meta[name="twitter:image:alt"]', imageAlt],
    ] as const) {
      document.querySelector<HTMLMetaElement>(selector)?.setAttribute("content", value);
    }
  }, [cmsCopy, isFrench, isNetwork, selectedArea]);

  useEffect(() => {
    let active = true;
    fetch(`/api/cms/public?locale=${encodeURIComponent(languageTag)}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!active || !data) return;
        setCmsCopy(data.content?.[cmsSection] || {});
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [cmsSection, languageTag]);

  useEffect(() => {
    return initializeSpaPlusAnalytics(analyticsSite);
  }, [analyticsSite]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setShowCookieConsent(!window.localStorage.getItem("spaplus-consent"));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    track(`view_${eventPrefix}_launch`, {
      market: marketSlug,
      language: locale,
    });
  }, [eventPrefix, locale, marketSlug]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollState = () => {
      const currentScrollY = window.scrollY;
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setHeaderCompact(currentScrollY > 48);
      setHeaderHidden(
        !menuOpen && currentScrollY > 240 && currentScrollY > lastScrollY,
      );
      setShowBackToTop(currentScrollY > 650);
      setScrollProgress(
        scrollableHeight > 0
          ? Math.min(100, (currentScrollY / scrollableHeight) * 100)
          : 0,
      );
      lastScrollY = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateScrollState);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", updateScrollState);
    updateScrollState();
    const initialFrame = window.requestAnimationFrame(updateScrollState);
    const initialTimer = window.setTimeout(updateScrollState, 120);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", updateScrollState);
      window.cancelAnimationFrame(initialFrame);
      window.clearTimeout(initialTimer);
    };
  }, [menuOpen]);

  useEffect(() => {
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-market-page] section:not([data-no-reveal]), [data-market-page] footer',
      ),
    );
    revealTargets.forEach((element) => element.setAttribute("data-reveal", ""));

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      revealTargets.forEach((element) =>
        element.setAttribute("data-reveal-visible", ""),
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).setAttribute(
            "data-reveal-visible",
            "",
          );
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -7% 0px" },
    );
    revealTargets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const desktopViewport = window.matchMedia("(min-width: 981px)");
    const closeMobileMenu = () => {
      if (desktopViewport.matches) setMenuOpen(false);
    };
    closeMobileMenu();
    desktopViewport.addEventListener("change", closeMobileMenu);
    return () => desktopViewport.removeEventListener("change", closeMobileMenu);
  }, []);

  function setConsent(value: "essential" | "analytics") {
    window.localStorage.setItem("spaplus-consent", value);
    setShowCookieConsent(false);
    setSpaPlusAnalyticsConsent(analyticsSite, value === "analytics");
    window.dispatchEvent(
      new CustomEvent("spaplus:consent", {
        detail: { analytics: value === "analytics" },
      }),
    );
    if (value === "analytics") {
      track(`view_${eventPrefix}_launch`, {
        market: marketSlug,
        language: locale,
        consent_update: "granted",
      });
    }
  }

  function beginForm() {
    if (!formStarted) {
      setFormStarted(true);
      track(`start_${eventPrefix}_spa_form`, { market: marketSlug });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitState === "submitting") return;

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      setValidationAttempted(true);
      setSubmitState("error");
      const missingFields = Array.from(
        form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(":invalid"),
      )
        .map((control) => control.dataset.errorLabel || "")
        .filter(Boolean);
      const missingSummary = missingFields.length
        ? `${tr("Missing:", "Champs manquants :")} ${missingFields.join(", ")}.`
        : "";
      setErrorMessage(
        `${dynamicCopy(
          "formRequiredFieldsError",
          "Please complete the required business details and confirmations highlighted below.",
          "Veuillez remplir les renseignements obligatoires sur l’entreprise et cocher les confirmations indiquées ci-dessous.",
        )} ${missingSummary}`.trim(),
      );
      track("spa_registration_error", {
        market: marketSlug,
        error_type: "missing_required_field",
      });
      form.querySelector<HTMLElement>(":invalid")?.focus();
      form.reportValidity();
      return;
    }
    setValidationAttempted(false);
    const values = new FormData(form);
    const services = values.getAll("services").map(String);
    if (fieldRequired("Services") && services.length === 0) {
      setSubmitState("error");
      track("spa_registration_error", {
        market: marketSlug,
        error_type: "missing_services",
      });
      setErrorMessage(
        tr(
          "Please choose at least one main service.",
          "Veuillez choisir au moins un service principal.",
        ),
      );
      form.querySelector<HTMLInputElement>('input[name="services"]')?.focus();
      return;
    }
    setSubmitState("submitting");
    setErrorMessage("");

    const payload = {
      submissionId: crypto.randomUUID(),
      market: marketSlug,
      area: selectedArea?.slug || "",
      name: String(values.get("name") || ""),
      role: String(values.get("role") || ""),
      email: String(values.get("email") || ""),
      phone: String(values.get("phone") || ""),
      organization: String(values.get("organization") || ""),
      website: String(values.get("website") || ""),
      city: String(values.get("city") || ""),
      region: String(values.get("region") || ""),
      postalCode: String(values.get("postalCode") || ""),
      spaType: String(values.get("spaType") || ""),
      locations: String(values.get("locations") || ""),
      services,
      bookingSystem: String(values.get("bookingSystem") || ""),
      preferredContact: String(values.get("preferredContact") || ""),
      message: String(values.get("message") || ""),
      privacyAccepted: values.get("privacy") === "accepted",
      acknowledgementAccepted:
        values.get("acknowledgement") === "accepted",
      honey: String(values.get("website_confirm") || ""),
      locale: languageTag,
      source: window.location.href,
      campaign: campaignData,
    };

    try {
      const response = await fetch(leadEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to submit");
      }
      form.reset();
      setSubmitState("success");
      track(`submit_${eventPrefix}_spa_form`, {
        market: marketSlug,
        lead_type: "spa_partner",
      });
      track("generate_lead", {
        market: marketSlug,
        lead_type: "spa_partner",
        area: selectedArea?.slug || marketSlug,
      });
    } catch {
      setSubmitState("error");
      track("spa_registration_error", {
        market: marketSlug,
        error_type: "submission_failed",
      });
      setErrorMessage(
        tr(
          "We could not send your details right now. Please try again in a moment.",
          "Nous n’avons pas pu transmettre vos renseignements. Veuillez réessayer dans un instant.",
        ),
      );
    }
  }

  return (
    <main
      className={styles.page}
      data-market-page
      data-release="2026-08-17-israel-rebuild"
      lang={languageTag}
      dir={isHebrew ? "rtl" : "ltr"}
      style={
        {
          "--market-hero": `url("${heroImage}")`,
        } as CSSProperties
      }
    >
      {config.showVideo !== false ? <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: "Grow Your Spa Business in Ontario | Join SpaPlus",
            description: isFrench
              ? "Découvrez comment SpaPlus aide les spas de l’Ontario à gagner en visibilité et à rejoindre la liste des partenaires fondateurs."
              : "See how SpaPlus can help Ontario spas gain visibility and join the founding partner list.",
            thumbnailUrl: [
              "https://app.spaplus.co/ontario/ontario-youtube-cover.jpg",
            ],
            contentUrl: "https://www.youtube.com/watch?v=Z5U0XPkouQ4",
            embedUrl: "https://www.youtube-nocookie.com/embed/Z5U0XPkouQ4",
            inLanguage: languageTag,
            publisher: {
              "@type": "Organization",
              name: "SpaPlus Canada",
              url: "https://spaplus.ca/",
            },
          }),
        }}
      /> : null}
      <a className={styles.skipLink} href="#main-content">
        {tr("Skip to main content", "Aller au contenu principal")}
      </a>

      <div
        className={styles.scrollProgress}
        aria-hidden="true"
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
      />

      <header
        className={[
          styles.header,
          headerCompact ? styles.headerCompact : "",
          headerHidden ? styles.headerHidden : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <a
          className={styles.brand}
          href=""
          aria-label={tr(
            "Refresh this SpaPlus page",
            "Actualiser cette page SpaPlus",
          )}
        >
          <img src="/spaplus-mark.png" alt="" width="48" height="48" />
          <img
            src="/spaplus-wordmark.png"
            alt="SpaPlus"
            width="132"
            height="40"
          />
        </a>
        <button
          className={styles.menuButton}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="market-navigation"
          aria-label={
            menuOpen
              ? tr("Close navigation", "Fermer la navigation")
              : tr("Open navigation", "Ouvrir la navigation")
          }
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav
          id="market-navigation"
          className={`${styles.headerNav} ${menuOpen ? styles.menuOpen : ""}`}
          aria-label={dynamicCopy(
            "navAria",
            `${marketName} launch navigation`,
            `Navigation du lancement de SpaPlus en ${marketName}`,
          )}
        >
          <a href="#platform" onClick={() => setMenuOpen(false)}>
            {tr("The platform", "La plateforme")}
          </a>
          <a href="#process" onClick={() => setMenuOpen(false)}>
            {tr("How it works", "Fonctionnement")}
          </a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>
            {tr("Questions", "Questions")}
          </a>
          <a
            className={styles.navCta}
            href="#join"
            onClick={() => {
              setMenuOpen(false);
              track("click_join_early_access", { placement: "header" })
            }}
          >
            {isNetwork ? tr("Join SpaPlus", "Joindre SpaPlus") : tr("Join early access", "Accès prioritaire")}
          </a>
          {marketLinks.length ? (
            <div className={styles.marketSwitch} aria-label={tr("Market", "Marché")}>
              {marketLinks.map((link) => (
                <a key={link.href} href={link.href} aria-current={link.active ? "page" : undefined}>
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
          <div
            className={styles.languageSwitch}
            aria-label={tr("Language", "Langue")}
          >
            {languageLinks.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                lang={link.languageTag}
                hrefLang={link.languageTag}
                aria-label={managed(`languageLink${index + 1}Aria`, link.ariaLabel)}
                aria-current={link.active ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  setMenuOpen(false);
                  track("language_change", {
                    market: marketSlug,
                    from_language: languageTag,
                    to_language: link.languageTag,
                  });
                  window.location.assign(link.href);
                }}
              >
                {managed(`languageLink${index + 1}Label`, link.label)}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <section
        className={styles.hero}
        id="main-content"
        data-no-reveal
      >
        <div className={styles.heroPhoto} aria-hidden="true" />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>
            {managed("heroEyebrow", isNetwork
              ? tr("SPAPLUS CANADA", "SPAPLUS CANADA")
              : selectedArea
              ? tr(
                  `${selectedArea.name.toUpperCase()}, YOU’RE INVITED`,
                  `${selectedArea.name.toUpperCase()}, À VOUS DE JOUER`,
                )
              : tr(
                  `${marketName.toUpperCase()}, YOU’RE NEXT`,
                  `${marketName.toUpperCase()}, À VOUS DE JOUER`,
                ))}
          </p>
          <h1>
            {managed("heroTitle", isNetwork
              ? tr(
                  "Bring your spa to SpaPlus Canada.",
                  "Faites découvrir votre spa avec SpaPlus Canada.",
                )
              : selectedArea
              ? tr(
                  `SpaPlus is coming to ${selectedArea.name}.`,
                  `SpaPlus arrive à ${selectedArea.name}.`,
                )
              : tr(
                  `SpaPlus is coming to ${marketName}.`,
                  `SpaPlus arrive en ${marketName}.`,
                ))}
          </h1>
          <p className={styles.heroLead}>
            {managed(isNetwork ? "heroLeadOutsideOntario" : "heroLead", isNetwork
              ? tr(
                  "Join a dedicated spa discovery and booking platform built to help established spas reach more guests across Canada, outside Ontario.",
                  "Joignez-vous à une plateforme spécialisée dans la découverte et la réservation de spas, conçue pour aider les établissements reconnus partout au Canada, à l'extérieur de l'Ontario.",
                )
              : selectedArea
              ? selectedArea.lead
              : tr(
                  `We are preparing a better way for people in ${primaryCity} and across ${marketName} to discover, compare and book memorable spa experiences.`,
                  `Nous préparons une meilleure façon de découvrir, comparer et réserver des expériences spa mémorables à ${primaryCity} et partout en ${marketName}.`,
                ))}
          </p>
          <div
            className={styles.promiseRow}
            aria-label={tr("Registration terms", "Conditions d’inscription")}
          >
            <span>{tr("Spa businesses only", "Entreprises de spa seulement")}</span>
            <span>{tr("Commission only on confirmed SpaPlus bookings", "Commission seulement sur les réservations SpaPlus confirmées")}</span>
            <span>{tr("No monthly fee or extra costs", "Aucuns frais mensuels ni frais supplémentaires")}</span>
            <span>{tr("No long-term commitment", "Aucun engagement à long terme")}</span>
          </div>
          <div className={styles.heroActions}>
            <a
              className={styles.primaryButton}
              href="#join"
              onClick={() =>
                track("click_join_early_access", { placement: "hero" })
              }
            >
              {isNetwork
                ? tr("Introduce your spa", "Présenter votre spa")
                : tr(
                    "Join the Founding Spa List",
                    "Rejoindre la liste des spas fondateurs",
                  )}
            </a>
            <a className={styles.textButton} href="#proof">
              {tr("See SpaPlus in action", "Voir SpaPlus en action")}
            </a>
          </div>
          <p className={styles.heroNote}>
            {tr(
              "Registration is an expression of interest. It is not a contract or a purchase.",
              "L’inscription exprime votre intérêt. Elle ne constitue ni un contrat ni un achat.",
            )}
          </p>
          {heroDisclosure ? (
            <p className={styles.heroMediaNote}>
              {managed("heroDisclosure", heroDisclosure)}
            </p>
          ) : null}
        </div>
      </section>

      <section
        className={styles.launchBand}
        aria-label={tr("Launch status", "État du lancement")}
      >
        <div>
          <small>{tr("LIVE TODAY", "DÉJÀ EN LIGNE")}</small>
          <strong>{managed("referenceMarketName", referenceMarketName)}</strong>
        </div>
        <span className={styles.routeLine} aria-hidden="true">
          <i />
        </span>
        <div>
          <small>{isNetwork ? tr("OPEN TO PARTNERS", "OUVERT AUX PARTENAIRES") : tr("COMING NEXT", "PROCHAINE ÉTAPE")}</small>
          <strong>
            {selectedArea?.name || managed(
              isNetwork ? "marketDisplayNameOutsideOntario" : "marketDisplayName",
              isNetwork
                ? tr("Canada outside Ontario", "Canada hors Ontario")
                : marketName,
            )}
          </strong>
        </div>
      </section>

      {config.showVideo !== false ? <section className={styles.videoSection} aria-labelledby="market-video-title">
        <div className={styles.videoCopy}>
          <p className={styles.eyebrowDark}>
            {dynamicCopy(
              "videoEyebrow",
              "SEE SPAPLUS IN ACTION",
              "DÉCOUVREZ SPAPLUS EN ACTION",
            )}
          </p>
          <h2 id="market-video-title">
            {dynamicCopy(
              "videoTitle",
              "A better way for Ontario spas to be discovered.",
              "Une meilleure façon de faire découvrir les spas de l’Ontario.",
            )}
          </h2>
          <p>
            {dynamicCopy(
              "videoDescription",
              "Watch how SpaPlus brings spa discovery and booking together, then introduce your spa for early consideration in Ontario.",
              "Voyez comment SpaPlus réunit la découverte et la réservation de spas, puis présentez votre établissement pour faire partie des premiers partenaires considérés en Ontario.",
            )}
          </p>
          <a className={styles.videoJoinLink} href="#join">
            {dynamicCopy(
              "videoJoinLink",
              "Introduce your spa",
              "Présenter votre spa",
            )}
          </a>
        </div>
        <div className={styles.videoFrame}>
          {videoPlaying ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/Z5U0XPkouQ4?autoplay=1&rel=0&hl=${isFrench ? "fr-CA" : "en-CA"}`}
              title={tr(
                "Grow Your Spa Business in Ontario | Join SpaPlus",
                "Développez votre spa en Ontario | Joignez SpaPlus",
              )}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <button
              className={styles.videoPoster}
              type="button"
              aria-label={tr(
                "Play the SpaPlus Ontario video",
                "Lire la vidéo de SpaPlus Ontario",
              )}
              onClick={() => {
                setVideoPlaying(true);
                track("play_ontario_video", {
                  area: selectedArea?.slug || "ontario",
                  language: languageTag,
                });
              }}
            >
              <img
                src="/ontario/ontario-youtube-cover.jpg"
                alt={tr(
                  "Preview of the SpaPlus Ontario partner video",
                  "Aperçu de la vidéo destinée aux partenaires SpaPlus Ontario",
                )}
                width="1280"
                height="720"
                loading="lazy"
              />
              <span className={styles.videoOverlay} aria-hidden="true" />
              <span className={styles.playButton} aria-hidden="true">
                <i />
              </span>
              <span className={styles.videoButtonLabel}>
                {dynamicCopy(
                  "videoPlayButton",
                  "Watch the video",
                  "Voir la vidéo",
                )}
              </span>
            </button>
          )}
        </div>
      </section> : null}

      <section className={styles.intro} id="why">
        <div className={styles.introAside}>
          <div className={styles.sectionLabel}>
            {tr("A STRONGER WAY TO GROW", "UNE MEILLEURE FAÇON DE GRANDIR")}
          </div>
          <ol
            className={styles.introPath}
            aria-label={tr(
              "The SpaPlus guest journey",
              "Le parcours client SpaPlus",
            )}
          >
            <li><span>01</span><strong>{tr("Discover", "Découvrir")}</strong></li>
            <li><span>02</span><strong>{tr("Compare", "Comparer")}</strong></li>
            <li><span>03</span><strong>{tr("Book", "Réserver")}</strong></li>
          </ol>
        </div>
        <div>
          <h2>
            {isNetwork
              ? tr(
                  "Better spa experiences for guests. New opportunities for Canadian spas outside Ontario.",
                  "De meilleures expériences spa pour les clients. De nouvelles possibilités pour les spas canadiens hors Ontario.",
                )
              : tr(
                  "Better spa experiences for guests. New opportunities for Ontario spas.",
                  "De meilleures expériences spa pour les clients. De nouvelles possibilités pour les spas de l’Ontario.",
                )}
          </h2>
          <p>
            {tr(
              "SpaPlus brings discovery, offers and booking into one focused spa platform. Guests get a simpler way to find an experience worth making time for. Spa partners get a new channel designed around the way spa businesses actually work.",
              "SpaPlus réunit la découverte, les offres et la réservation dans une plateforme entièrement consacrée au spa. Les clients trouvent plus facilement une expérience qui vaut le détour. Les partenaires obtiennent un nouveau canal pensé selon la réalité des entreprises de spa.",
            )}
          </p>
        </div>
      </section>

      <section className={styles.benefits}>
        <article>
          <span>01</span>
          <h3>{isNetwork ? tr("Join the SpaPlus Canada network", "Joignez le réseau SpaPlus Canada") : tr("Join before the launch", "Inscrivez-vous avant le lancement")}</h3>
          <p>
            {dynamicCopy(
              "growthCardOneBody",
              isNetwork
                ? "Introduce your business and be considered for the SpaPlus Canada partner network."
                : `Tell us about your business now and be among the first ${marketName} spas considered for onboarding.`,
              isNetwork
                ? "Présentez votre établissement afin que notre équipe puisse évaluer son intégration au réseau SpaPlus Canada."
                : `Présentez-nous votre établissement et faites partie des premiers spas de l’${marketName} considérés pour l’intégration.`,
            )}
          </p>
        </article>
        <article>
          <span>02</span>
          <h3>{tr("Get discovered by new guests", "Faites-vous découvrir par de nouveaux clients")}</h3>
          <p>
            {tr(
              "Present the experiences, packages and occasions that make your spa worth choosing.",
              "Présentez les expériences, forfaits et occasions qui donnent envie de choisir votre spa.",
            )}
          </p>
        </article>
        <article>
          <span>03</span>
          <h3>{tr("Review the offer before deciding", "Voyez l’offre avant de décider")}</h3>
          <p>
            {tr(
              "If the fit is right, we will explain the launch offer and next steps. You decide whether to continue.",
              "Si le partenariat semble prometteur, nous vous présenterons l’offre de lancement et la suite. La décision vous appartient.",
            )}
          </p>
        </article>
      </section>

      <section className={styles.foundingOffer} aria-labelledby="founding-offer-title">
        <div>
          <p className={styles.eyebrowDark}>
            {isNetwork ? tr("THE SPAPLUS CANADA ADVANTAGE", "L’AVANTAGE SPAPLUS CANADA") : tr("THE FOUNDING PARTNER ADVANTAGE", "L’AVANTAGE PARTENAIRE FONDATEUR")}
          </p>
          <h2 id="founding-offer-title">
            {tr(
              "A clear path from first conversation to new bookings.",
              "Un parcours clair, du premier échange aux nouvelles réservations.",
            )}
          </h2>
          <p>
            {isNetwork
              ? tr(
                  "There is no fee to send your spa details. We review the opportunity together, explain the commercial terms in writing and move forward only if the fit makes sense.",
                  "Il n’y a aucuns frais pour présenter votre spa. Nous évaluons l’occasion ensemble, expliquons les conditions commerciales par écrit et avançons seulement si le partenariat convient.",
                )
              : tr(
                  "There is no fee to join the early list. We prepare the opportunity together, explain the written launch terms and move forward only if the fit makes sense.",
                  "L’inscription prioritaire est gratuite. Nous préparons l’occasion avec vous, expliquons les conditions de lancement par écrit et avançons seulement si le partenariat est logique.",
                )}
          </p>
        </div>
        <ol className={styles.foundingPath}>
          <li>
            <span>01</span>
            <strong>{tr("Register free", "Inscription gratuite")}</strong>
            <small>{tr("No payment or card", "Aucun paiement ni carte")}</small>
          </li>
          <li>
            <span>02</span>
            <strong>{tr("Build the right offer", "Création de la bonne offre")}</strong>
            <small>{tr("Profile, packages and fit", "Profil, forfaits et positionnement")}</small>
          </li>
          <li>
            <span>03</span>
            <strong>{tr("Review before launch", "Révision avant le lancement")}</strong>
            <small>{tr("Written terms, no pressure", "Conditions écrites, sans pression")}</small>
          </li>
          <li>
            <span>04</span>
            <strong>{tr("Grow through bookings", "Croissance par les réservations")}</strong>
            <small>{tr("No booking, no booking commission", "Aucune réservation, aucune commission")}</small>
          </li>
        </ol>
      </section>

      <section className={styles.platformSection} id="platform">
        <div className={styles.platformHeading}>
          <div>
            <p className={styles.eyebrowDark}>
              {tr("ONE SPA PLATFORM", "UNE PLATEFORME POUR LE SPA")}
            </p>
            <h2>
              {tr(
                "From first discovery to a confirmed booking.",
                "De la découverte jusqu’à la réservation confirmée.",
              )}
            </h2>
          </div>
          <p>
            {tr(
              "SpaPlus is being built as a focused home for spa and wellness, not another general marketplace. It gives guests a clear way to choose and gives spa teams a practical way to receive and manage demand.",
              "SpaPlus est conçu comme la destination du spa et du mieux-être, et non comme une autre place de marché généraliste. Les clients choisissent plus facilement et les équipes de spa disposent d’un moyen pratique de recevoir et de gérer la demande.",
            )}
          </p>
        </div>

        <div className={styles.productStory}>
          <div className={styles.guestPreview}>
            <div className={styles.previewBar}>
              <span />
              <b>{tr("Guest experience", "Expérience client")}</b>
              <small>{tr("ILLUSTRATIVE PREVIEW", "APERÇU ILLUSTRATIF")}</small>
            </div>
            <div className={styles.previewHero}>
              <p>
                {tr(
                  "Find your next good day.",
                  "Trouvez votre prochaine belle journée.",
                )}
              </p>
              <h3>
                {dynamicCopy(
                  "platformPreviewTitle",
                  `Spa experiences across ${marketName}`,
                  `Des expériences spa partout en ${marketName}`,
                )}
              </h3>
              <div className={styles.searchPreview}>
                <span>{primaryCity}</span>
                <span>{tr("Any date", "Toutes les dates")}</span>
                <strong>{tr("Explore", "Explorer")}</strong>
              </div>
            </div>
            <div className={styles.previewCards}>
              <article>
                <span>{tr("COUPLES", "EN COUPLE")}</span>
                <strong>{tr("A day made for two", "Une journée à deux")}</strong>
              </article>
              <article>
                <span>{dynamicCopy("previewDayPassLabel", "DAY PASS", "ACCÈS JOURNÉE")}</span>
                <strong>{tr("More than a treatment", "Bien plus qu’un soin")}</strong>
              </article>
              <article>
                <span>{tr("SOLO RESET", "PAUSE EN SOLO")}</span>
                <strong>{tr("Time that is entirely yours", "Du temps rien que pour vous")}</strong>
              </article>
            </div>
          </div>

          <div className={styles.partnerPreview}>
            <div className={styles.partnerPreviewTop}>
              <span className={styles.logoDot}>SP</span>
              <div>
                <small>{tr("PARTNER VIEW", "ESPACE PARTENAIRE")}</small>
                <strong>{tr("Today at your spa", "Aujourd’hui dans votre spa")}</strong>
              </div>
              <span className={styles.livePill}>{tr("LIVE", "EN DIRECT")}</span>
            </div>
            <div className={styles.partnerStats}>
              <div>
                <small>{tr("NEW REQUESTS", "NOUVELLES DEMANDES")}</small>
                <strong>4</strong>
              </div>
              <div>
                <small>{tr("CONFIRMED", "CONFIRMÉES")}</small>
                <strong>11</strong>
              </div>
            </div>
            <div className={styles.bookingPreview}>
              <span>10:30</span>
              <div>
                <strong>{tr("Couples spa experience", "Expérience spa en couple")}</strong>
                <small>{tr("2 guests · Confirmation requested", "2 personnes · Confirmation demandée")}</small>
              </div>
              <b>{tr("Review", "Voir")}</b>
            </div>
            <div className={styles.bookingPreview}>
              <span>14:00</span>
              <div>
                <strong>{tr("Day spa package", "Forfait spa de jour")}</strong>
                <small>{tr("1 guest · Confirmed", "1 personne · Confirmée")}</small>
              </div>
              <b className={styles.confirmed}>{tr("Ready", "Prête")}</b>
            </div>
          </div>
        </div>
        <p className={styles.interfaceDisclosure}>
          {dynamicCopy(
            "platformDisclosure",
            isNetwork
              ? "Interface previews are illustrative. Partner availability varies by region and the tools shown may evolve."
              : `Interface previews are illustrative. ${marketName} inventory is not live and the final partner tools may evolve before launch.`,
            isNetwork
              ? "Les aperçus d’interface sont illustratifs. La disponibilité des partenaires varie selon la région et les outils présentés peuvent évoluer."
              : `Les aperçus d’interface sont illustratifs. L’inventaire de l’${marketName} n’est pas encore en ligne et les outils partenaires peuvent évoluer avant le lancement.`,
          )}
        </p>

        <div className={styles.platformGrid}>
          <article>
            <span>01</span>
            <h3>{tr("A dedicated spa marketplace", "Une place de marché consacrée au spa")}</h3>
            <p>
              {tr(
                "Present treatments, packages, day passes and spa stays in a place where guests arrive specifically looking for wellness.",
                "Présentez soins, forfaits, accès à la journée et séjours spa là où les clients viennent précisément chercher du mieux-être.",
              )}
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>{tr("Booking requests that are easy to manage", "Des demandes faciles à gérer")}</h3>
            <p>
              {tr(
                "Receive a request by email and in the partner system, then review and confirm it without a complicated process.",
                "Recevez la demande par courriel et dans l’espace partenaire, puis vérifiez-la et confirmez-la simplement.",
              )}
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>{tr("Availability at the level that suits you", "La gestion des disponibilités qui vous convient")}</h3>
            <p>
              {tr(
                "Start by confirming requests. Spas that maintain live availability can move toward immediate confirmation.",
                "Commencez par confirmer les demandes. Les spas qui tiennent leurs disponibilités à jour peuvent passer à la confirmation immédiate.",
              )}
            </p>
          </article>
          <article>
            <span>04</span>
            <h3>{tr("Clear payments and monthly reconciliation", "Des paiements clairs et un rapprochement mensuel")}</h3>
            <p>
              {tr(
                "Guests may pay online or at the spa, according to the available offer. A monthly report keeps bookings, commission and settlement transparent.",
                "Selon l’offre, les clients paient en ligne ou au spa. Un rapport mensuel présente clairement les réservations, les commissions et le règlement.",
              )}
            </p>
          </article>
        </div>
      </section>

      <section className={styles.proof} id="proof">
        <div className={styles.proofHeading}>
          <div>
            <p className={styles.eyebrowDark}>
              {tr(
                "BUILT FOR REAL SPA EXPERIENCES",
                "PENSÉ POUR DE VRAIES EXPÉRIENCES SPA",
              )}
            </p>
            <h2>
              {dynamicCopy(
                "proofTitle",
                `Already helping guests discover spas in ${referenceMarketName}.`,
                `Déjà au service de la découverte des spas au ${referenceMarketName}.`,
              )}
            </h2>
          </div>
          <p>
              {dynamicCopy(
                "proofIntro",
                isNetwork
                  ? "These are current experiences presented on the live SpaPlus Canada platform. Availability varies by region."
                  : `These are current experiences presented on the live SpaPlus Canada platform. ${marketName} listings are not live yet.`,
                isNetwork
                  ? "Ces expériences sont actuellement présentées sur la plateforme SpaPlus Canada. L’offre varie selon la région."
                  : `Ces expériences sont actuellement présentées sur la plateforme SpaPlus Canada. Les établissements de l’${marketName} ne sont pas encore en ligne.`,
            )}
          </p>
        </div>
        <div className={styles.gallery}>
          {referenceSpas.map((spa, index) => (
            <figure key={spa.name}>
              <img
                src={spa.image}
                alt={managed(`referenceSpa${index + 1}Alt`, spa.imageAlt)}
                width="400"
                height="320"
              />
              <figcaption>
                <strong>{managed(`referenceSpa${index + 1}Name`, spa.name)}</strong>
                <span>{managed(`referenceSpa${index + 1}Location`, spa.location)}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className={styles.mediaDisclosure}>
          {dynamicCopy(
            "proofDisclosure",
            isNetwork
              ? "Images are sourced from current listings on the official SpaPlus Canada website. They show existing listings and do not represent every current or future partner."
              : `Images are sourced from current spa listings on the official SpaPlus Canada website. They illustrate the existing ${referenceMarketName} platform in ${referenceCountryName} and do not depict future ${marketName} partners.`,
            isNetwork
              ? "Les images proviennent de fiches actuelles du site officiel SpaPlus Canada. Elles montrent des établissements déjà présentés et ne représentent pas tous les partenaires actuels ou futurs."
              : `Les images proviennent de fiches actuelles du site officiel SpaPlus Canada. Elles illustrent la plateforme existante au ${referenceMarketName}, au ${referenceCountryName}, et ne représentent pas de futurs partenaires en ${marketName}.`,
          )}
        </p>
      </section>

      <section className={styles.occasionSection} id="experiences">
        <div className={styles.occasionLead}>
          <p className={styles.eyebrow}>
            {tr(
              "THE OCCASIONS PEOPLE MAKE TIME FOR",
              "LES OCCASIONS QUI MÉRITENT DU TEMPS",
            )}
          </p>
          <h2>
            {tr(
              "Not one kind of guest. Not one kind of spa day.",
              "Chaque client est différent. Chaque journée spa aussi.",
            )}
          </h2>
          <p>
            {tr(
              "The platform is designed to help people start with the experience they want, then find a spa that fits.",
              "La plateforme aide les gens à partir de l’expérience qu’ils souhaitent, puis à trouver le spa qui leur convient.",
            )}
          </p>
        </div>
        <div className={styles.occasionGrid}>
          <article>
            <span>01</span>
            <h3>{tr("For two", "À deux")}</h3>
            <p>
              {tr(
                "Couples experiences, celebrations and time away together.",
                "Expériences en couple, célébrations et moments à partager.",
              )}
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>{tr("For one", "En solo")}</h3>
            <p>
              {tr(
                "A treatment, a quiet reset or a full day devoted to yourself.",
                "Un soin, une pause au calme ou une journée entièrement pour soi.",
              )}
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>{tr("For groups", "En groupe")}</h3>
            <p>
              {tr(
                "Birthdays, friends, teams and occasions worth planning well.",
                "Anniversaires, amis, équipes et occasions à organiser avec soin.",
              )}
            </p>
          </article>
          <article>
            <span>04</span>
            <h3>{tr("For the whole day", "Pour toute la journée")}</h3>
            <p>
              {tr(
                "Day passes, thermal experiences, resort spas and spa stays.",
                "Accès à la journée, expériences thermales, centres de villégiature et séjours spa.",
              )}
            </p>
          </article>
        </div>
      </section>

      <section className={styles.fitSection}>
        <div>
          <p className={styles.eyebrowDark}>
            {tr("WHO WE WANT TO MEET", "LES PARTENAIRES QUE NOUS RECHERCHONS")}
          </p>
          <h2>
            {dynamicCopy(
              "partnerFitTitle",
              isNetwork ? "Established Canadian spas outside Ontario that care about the guest experience." : `Established ${marketName} spas that care about the guest experience.`,
              isNetwork ? "Des spas canadiens reconnus hors Ontario qui accordent une vraie importance à l’expérience client." : `Des spas établis en ${marketName} qui accordent une vraie importance à l’expérience client.`,
            )}
          </h2>
        </div>
        <div className={styles.fitGrid}>
          <p>{tr("Day spas with a physical commercial location", "Spas de jour ayant un établissement commercial")}</p>
          <p>{tr("Hotel, resort, Nordic and thermal spas", "Spas d’hôtel, de villégiature, nordiques et thermaux")}</p>
          <p>{tr("Wellness venues with bookable spa experiences", "Établissements mieux-être proposant des expériences réservables")}</p>
          <p>{tr("Multi-location groups preparing for their next growth channel", "Groupes multisites prêts à développer un nouveau canal de croissance")}</p>
        </div>
        <p className={styles.fitNote}>
          {tr(
            "SpaPlus is not currently onboarding individual mobile therapists, home-based services or solo private treatment rooms through this program.",
            "Ce programme ne vise pas actuellement les thérapeutes mobiles indépendants, les services à domicile ni les salles de soins privées exploitées par une seule personne.",
          )}
        </p>
        <div className={styles.priorityAreas}>
          <span>{isNetwork ? tr("Explore Canada", "Explorer le Canada") : tr("Priority launch areas", "Zones de lancement prioritaires")}</span>
          <div>
            {priorityAreas.map((area, index) => (
              <a
                key={`${area.href}-${area.label}-${index}`}
                href={area.href}
                aria-current={
                  selectedArea && area.label === selectedArea.name
                    ? "page"
                    : undefined
                }
              >
                {managed(`priorityArea${index + 1}Label`, area.label)}
              </a>
            ))}
          </div>
          <small>
            {isNetwork
              ? tr(
                  "This page is for every Canadian province and territory outside Ontario. Ontario has its own dedicated partner page and campaign.",
                  "Cette page s'adresse aux provinces et territoires du Canada, à l'exception de l'Ontario. L'Ontario possède sa propre page et sa propre campagne partenaires.",
                )
              : tr(
                  "Choose an area to open its dedicated partner page. These are campaign targets, not a claim that SpaPlus is already operating there.",
                  "Choisissez une zone pour ouvrir sa page partenaire. Il s’agit de cibles de campagne, et non d’une affirmation que SpaPlus y exerce déjà ses activités.",
                )}
          </small>
        </div>
      </section>

      {selectedArea ? (
        <section className={styles.localFocus} aria-labelledby="local-focus-title">
          <div>
            <p className={styles.eyebrowDark}>
              {tr("A LOCAL LAUNCH WITH A GLOBAL PLATFORM", "UN LANCEMENT LOCAL, UNE PLATEFORME MONDIALE")}
            </p>
            <h2 id="local-focus-title">
              {tr(
                `Built for the way people discover spa experiences in ${selectedArea.name}.`,
                `Pensé pour la façon dont les gens découvrent les expériences spa à ${selectedArea.name}.`,
              )}
            </h2>
            <p>{selectedArea.lead}</p>
          </div>
          <div className={styles.localFocusMap} aria-label={tr("Local focus areas", "Secteurs ciblés")}>
            <span className={styles.mapPulse} aria-hidden="true" />
            <strong>{selectedArea.name}</strong>
            <div>
              {selectedArea.focus.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <small>
              {tr(
                isNetwork
                  ? "Partner availability and launch activity vary by province and territory."
                  : "Campaign planning areas only. SpaPlus inventory is not live here yet.",
                isNetwork
                  ? "La disponibilité des partenaires et les activités de lancement varient selon la province ou le territoire."
                  : "Secteurs prévus pour les campagnes. L’inventaire SpaPlus n’y est pas encore en ligne.",
              )}
            </small>
          </div>
        </section>
      ) : null}

      <section className={styles.commercialSection} id="partner-model">
        <div className={styles.commercialIntro}>
          <p className={styles.eyebrowDark}>
            {tr("A MODEL THAT STARTS SIMPLE", "UN MODÈLE SIMPLE DÈS LE DÉPART")}
          </p>
          <h2>
            {tr(
              "Understand the journey before you decide.",
              "Comprenez le parcours avant de décider.",
            )}
          </h2>
          <p>
            {tr(
              "Early registration is free. If there is a strong fit, the full launch offer and commercial terms are reviewed with you in writing before any commitment.",
              "L’inscription prioritaire est gratuite. Si le partenariat semble prometteur, l’offre de lancement et les conditions commerciales vous sont présentées par écrit avant tout engagement.",
            )}
          </p>
        </div>
        <div className={styles.commercialFlow}>
          <article>
            <span>{tr("DISCOVERY", "DÉCOUVERTE")}</span>
            <h3>{tr("Your spa is presented to guests", "Votre spa est présenté aux clients")}</h3>
            <p>
              {tr(
                "People can discover your venue, understand your experiences and choose an offer that fits the occasion.",
                "Les gens découvrent votre établissement, comprennent vos expériences et choisissent l’offre qui convient à leur occasion.",
              )}
            </p>
          </article>
          <article>
            <span>{tr("BOOKING", "RÉSERVATION")}</span>
            <h3>{tr("You stay in control of confirmation", "Vous gardez le contrôle de la confirmation")}</h3>
            <p>
              {tr(
                "Confirm from the email or partner system. If you maintain live availability, eligible bookings can be confirmed immediately.",
                "Confirmez depuis le courriel ou l’espace partenaire. Si vos disponibilités sont à jour, les réservations admissibles peuvent être confirmées immédiatement.",
              )}
            </p>
          </article>
          <article>
            <span>{tr("PAYMENT", "PAIEMENT")}</span>
            <h3>{tr("The guest chooses the available payment option", "Le client choisit l’option de paiement offerte")}</h3>
            <p>
              {tr(
                "For pay-at-spa bookings, the spa charges the guest. For prepaid bookings, SpaPlus processes the payment.",
                "Pour une réservation payable sur place, le spa facture le client. Pour une réservation prépayée, SpaPlus traite le paiement.",
              )}
            </p>
          </article>
          <article>
            <span>{tr("SETTLEMENT", "RÈGLEMENT")}</span>
            <h3>{tr("One clear monthly picture", "Un portrait mensuel clair")}</h3>
            <p>
              {tr(
                "A report shows what was charged, the applicable commission and the net balance to settle between the parties.",
                "Un rapport indique les montants facturés, la commission applicable et le solde net à régler entre les parties.",
              )}
            </p>
          </article>
        </div>
        <div className={styles.futureNote}>
          <strong>{tr("Built to become even easier", "Pensé pour devenir encore plus simple")}</strong>
          <p>
            {tr(
              "After the initial operating period, deeper calendar connections may allow full availability checks and more bookings to flow through automatically.",
              "Après la période initiale, des connexions plus poussées aux calendriers pourront permettre la vérification complète des disponibilités et l’automatisation d’un plus grand nombre de réservations.",
            )}
          </p>
        </div>
      </section>

      <section className={styles.process} id="process">
        <div className={styles.processIntro}>
          <p className={styles.eyebrow}>{tr("SIMPLE FROM THE START", "SIMPLE DÈS LE DÉPART")}</p>
          <h2>{tr("Four steps. No pressure.", "Quatre étapes. Aucune pression.")}</h2>
          <p>
            {tr(
              "The form helps us understand your spa before we speak. It does not create a contract or commit you to joining.",
              "Le formulaire nous aide à comprendre votre spa avant notre échange. Il ne crée aucun contrat et ne vous engage pas à vous joindre à SpaPlus.",
            )}
          </p>
        </div>
        <ol>
          <li>
            <span>01</span>
            <div>
              <h3>{tr("Introduce your spa", "Présentez votre spa")}</h3>
              <p>{tr("Share the basics about your venue, services and location.", "Parlez-nous de votre établissement, de vos services et de votre emplacement.")}</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>{tr("We review the fit", "Nous évaluons le partenariat")}</h3>
              <p>
                {dynamicCopy(
                  "reviewStepBody",
                  `Our team reviews every complete enquiry within ${reviewWindowHours} hours.`,
                  `Notre équipe examine chaque demande complète dans un délai de ${reviewWindowHours} heures.`,
                )}
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>{tr("Have a real conversation", "Échangeons pour vrai")}</h3>
              <p>{tr("We explain the launch plan, answer questions and learn more.", "Nous expliquons le plan de lancement, répondons à vos questions et apprenons à mieux vous connaître.")}</p>
            </div>
          </li>
          <li>
            <span>04</span>
            <div>
              <h3>{tr("Decide together", "Décidons ensemble")}</h3>
              <p>
                {tr(
                  "If there is a strong fit, you can review the written launch offer before choosing whether to move ahead.",
                  "Si le partenariat est solide, vous pourrez examiner l’offre de lancement écrite avant de décider d’aller de l’avant.",
                )}
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section className={styles.formSection} id="join">
        <div className={styles.formIntro}>
          <p className={styles.eyebrowDark}>
            {dynamicCopy(
              "formEyebrow",
              isNetwork ? "SPAPLUS CANADA PARTNER ENQUIRY" : `${(selectedArea?.name || marketName).toUpperCase()} FOUNDING SPA LIST`,
              isNetwork ? "DEMANDE DE PARTENARIAT SPAPLUS CANADA" : `LISTE PRIORITAIRE DES SPAS DE ${(selectedArea?.name || marketName).toUpperCase()}`,
            )}
          </p>
          <h2>{managed("formTitle", tr("Tell us about your spa.", "Parlez-nous de votre spa."))}</h2>
          <p>
            {managed("formIntro", tr(
              `Complete the form once. We will review it personally and contact you within ${reviewWindowHours} hours.`,
              `Remplissez le formulaire une seule fois. Nous l’examinerons personnellement et communiquerons avec vous dans un délai de ${reviewWindowHours} heures.`,
            ))}
          </p>
          <div className={styles.assuranceCard}>
            <strong>{tr("What happens after you send it?", "Que se passe-t-il après l’envoi?")}</strong>
            <ul>
              <li>
                {tr("You receive an immediate email confirmation.", "Vous recevez immédiatement un courriel de confirmation.")}
              </li>
              <li>{tr("Our team reviews the business and location.", "Notre équipe examine l’établissement et son emplacement.")}</li>
              <li>{tr("We contact you to arrange a short conversation.", "Nous vous contactons pour planifier un court échange.")}</li>
              <li>{tr("No payment or card details are requested.", "Aucun paiement ni renseignement de carte n’est demandé.")}</li>
            </ul>
          </div>
        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
          onFocus={beginForm}
          data-validation-attempted={validationAttempted}
          noValidate
        >
          {marketSlug === "quebec" || marketSlug === "ontario" ? (
            <p className={styles.requirementNote}>
              <strong>{tr("Only five business details are required.", "Seulement cinq renseignements sur l’entreprise sont obligatoires.")}</strong>{" "}
              {tr(
                "Business name, contact person, phone, business email and spa location are required and clearly marked below. This form is only for owners, managers and authorized representatives of operating spa businesses. It is not for spa customers, job applicants or unrelated enquiries. Do not submit repeated or irrelevant messages.",
                "Le nom de l’entreprise, la personne-ressource, le téléphone, le courriel professionnel et l’emplacement du spa sont obligatoires et clairement indiqués. Ce formulaire est réservé aux propriétaires, gestionnaires et représentants autorisés d’entreprises de spa en activité. Il ne s’adresse pas aux clients, aux candidats à un emploi ni aux demandes sans rapport. N’envoyez pas de messages répétés ou non pertinents.",
              )}
            </p>
          ) : null}
          {submitState === "error" ? (
            <p id="market-form-error" className={styles.formError} role="alert">
              {errorMessage}
            </p>
          ) : null}
          {fieldVisible("Organization") ? <div className={styles.field}>
            <label htmlFor="organization">{fieldLabel("Organization", tr("Spa or business name", "Nom du spa ou de l’entreprise"))}</label>
            <input
              id="organization"
              name="organization"
              required={fieldRequired("Organization")}
              data-error-label={tr("Spa or business name", "Nom du spa ou de l’entreprise")}
              autoComplete="organization"
              maxLength={160}
            />
          </div> : null}
          {fieldVisible("Name") ? <div className={styles.field}>
            <label htmlFor="name">{fieldLabel("Name", tr("Contact person", "Personne-ressource"))}</label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required={fieldRequired("Name")}
              data-error-label={tr("Contact person", "Personne-ressource")}
              maxLength={100}
            />
          </div> : null}
          {fieldVisible("Phone") ? <div className={styles.field}>
            <label htmlFor="phone">{fieldLabel("Phone", tr("Phone", "Téléphone"))}</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required={fieldRequired("Phone")}
              data-error-label={tr("Phone", "Téléphone")}
              minLength={7}
              maxLength={40}
            />
          </div> : null}
          {fieldVisible("Website") ? <div className={styles.field}>
            <label htmlFor="website">{fieldLabel("Website", tr("Business website or Instagram", "Site Web ou Instagram de l’entreprise"))}</label>
            <input
              id="website"
              name="website"
              type={marketSlug === "quebec" ? "text" : "url"}
              placeholder={marketSlug === "quebec" ? tr("https:// or @instagram", "https:// ou @instagram") : managed("websitePlaceholder", "https://")}
              required={fieldRequired("Website")}
              data-error-label={tr("Business website or Instagram", "Site Web ou Instagram de l’entreprise")}
              maxLength={300}
            />
          </div> : null}
          {fieldVisible("City") ? <div className={styles.field}>
            <label htmlFor="city">
              {fieldLabel("City", marketSlug === "quebec"
                ? tr("Business address", "Adresse de l’entreprise")
                : selectedArea
                ? tr("City or community", "Ville ou collectivité")
                : dynamicCopy(isNetwork ? "formCityLabelOutsideOntario" : "formCityLabel", isNetwork ? "City" : `${marketName} city`, isNetwork ? "Ville" : `Ville en ${marketName}`))}
            </label>
            <input
              id="city"
              name="city"
              required={fieldRequired("City")}
              data-error-label={tr("Business address", "Adresse de l’entreprise")}
              autoComplete="street-address"
              maxLength={220}
            />
          </div> : null}
          {regionOptions.length ? <div className={styles.field}>
            <label htmlFor="region">
              {fieldLabel("Region", dynamicCopy("formRegionLabel", "Province or territory", "Province ou territoire"))}
            </label>
            <select
              id="region"
              name="region"
              required={fieldRequired("Region")}
              defaultValue={
                regionOptions.some((region) => region.value === campaignData.utm_content)
                  ? campaignData.utm_content
                  : ""
              }
            >
              <option value="" disabled>
                {dynamicCopy("formRegionPlaceholder", "Select a province or territory", "Choisir une province ou un territoire")}
              </option>
              {regionOptions.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
            <small>
              {tr(
                "Ontario is not included here. Use the dedicated Ontario page.",
                "L'Ontario n'est pas inclus ici. Utilisez la page dédiée à l'Ontario.",
              )}
            </small>
          </div> : null}
          {fieldVisible("PostalCode") ? <div className={styles.field}>
            <label htmlFor="postalCode">{fieldLabel("PostalCode", tr("Postal code", "Code postal"))}</label>
            <input
              id="postalCode"
              name="postalCode"
              autoComplete="postal-code"
              required={fieldRequired("PostalCode")}
              maxLength={12}
            />
          </div> : null}
          {fieldVisible("SpaType") ? <div className={styles.field}>
            <label htmlFor="spaType">{fieldLabel("SpaType", tr("Type of spa", "Type de spa"))}</label>
            <select id="spaType" name="spaType" required={fieldRequired("SpaType")} defaultValue="">
              <option value="" disabled>
                {dynamicCopy("formSpaTypePlaceholder", "Select a spa type", "Choisir un type de spa")}
              </option>
              {visibleSpaTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {dynamicCopy(item.field, item.en, item.fr)}
                </option>
              ))}
            </select>
          </div> : null}
          {fieldVisible("Locations") ? <div className={styles.field}>
            <label htmlFor="locations">{fieldLabel("Locations", tr("Number of locations", "Nombre d’établissements"))}</label>
            <select id="locations" name="locations" required={fieldRequired("Locations")} defaultValue="">
              <option value="" disabled>
                {dynamicCopy("formLocationsPlaceholder", "Select the number of locations", "Choisir le nombre d’établissements")}
              </option>
              <option value="1">{tr("1 location", "1 établissement")}</option>
              <option value="2-3">{tr("2 to 3 locations", "2 à 3 établissements")}</option>
              <option value="4-10">{tr("4 to 10 locations", "4 à 10 établissements")}</option>
              <option value="11+">{tr("11 or more locations", "11 établissements ou plus")}</option>
            </select>
          </div> : null}
          {fieldVisible("Services") ? <fieldset className={styles.services}>
            <legend>{fieldLabel("Services", tr("Main services offered", "Principaux services offerts"))}</legend>
            <div>
              {visibleServiceOptions.map((service) => (
                <label key={service.value}>
                  <input type="checkbox" name="services" value={service.value} />
                  <span>{dynamicCopy(service.field, service.en, service.fr)}</span>
                </label>
              ))}
            </div>
          </fieldset> : null}
          {fieldVisible("Role") ? <div className={styles.field}>
            <label htmlFor="role">{fieldLabel("Role", tr("Your role", "Votre fonction"))}</label>
            <input id="role" name="role" required={fieldRequired("Role")} maxLength={100} />
          </div> : null}
          {fieldVisible("Email") ? <div className={styles.field}>
            <label htmlFor="email">{fieldLabel("Email", tr("Business email", "Courriel professionnel"))}</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required={fieldRequired("Email")}
              maxLength={180}
            />
          </div> : null}
          {fieldVisible("PreferredContact") ? <div className={styles.field}>
            <label htmlFor="preferredContact">{fieldLabel("PreferredContact", tr("Preferred contact", "Méthode de contact préférée"))}</label>
            <select
              id="preferredContact"
              name="preferredContact"
              required={fieldRequired("PreferredContact")}
              defaultValue=""
            >
              <option value="" disabled>
                {dynamicCopy("formPreferredContactPlaceholder", "Select a contact method", "Choisir une méthode de contact")}
              </option>
              <option value="Email">{tr("Email", "Courriel")}</option>
              <option value="Phone">{tr("Phone", "Téléphone")}</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div> : null}
          {fieldVisible("BookingSystem") ? <div className={styles.field}>
            <label htmlFor="bookingSystem">{fieldLabel("BookingSystem", tr("Current booking system", "Système de réservation actuel"), false)}</label>
            <input id="bookingSystem" name="bookingSystem" required={fieldRequired("BookingSystem", false)} maxLength={120} />
          </div> : null}
          {fieldVisible("Message") ? <div className={`${styles.field} ${styles.fullField}`}>
            <label htmlFor="message">{fieldLabel("Message", tr("Anything we should know?", "Y a-t-il autre chose à savoir?"), false)}</label>
            <textarea id="message" name="message" required={fieldRequired("Message", false)} rows={5} maxLength={1500} />
          </div> : null}
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="website_confirm">{tr("Leave this field empty", "Laisser ce champ vide")}</label>
            <input
              id="website_confirm"
              name="website_confirm"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <label className={styles.consent}>
            <input
              type="checkbox"
              name="privacy"
              value="accepted"
              data-error-label={tr("Privacy confirmation", "Confirmation de confidentialité")}
              required
            />
            <span>
              {tr(
                "I agree that SpaPlus may use these details to assess and respond to this enquiry, as described in the ",
                "J’accepte que SpaPlus utilise ces renseignements pour évaluer cette demande et y répondre, comme décrit dans la ",
              )}
              <a
                href={`${homeHref}#privacy`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {tr("Privacy Policy", "Politique de confidentialité")}
              </a>
              .
            </span>
          </label>
          <label className={styles.consent}>
            <input
              type="checkbox"
              name="acknowledgement"
              value="accepted"
              data-error-label={tr("Partnership acknowledgement", "Confirmation de partenariat")}
              required
            />
            <span>
              {tr(
                "I confirm that I own, manage or am authorized to represent an operating spa business that wants more SpaPlus bookings. I understand that SpaPlus charges commission only on confirmed bookings it generates, with no monthly fee, no extra costs and no long-term commitment.",
                "Je confirme que je possède, gère ou représente avec autorisation une entreprise de spa en activité qui souhaite recevoir davantage de réservations grâce à SpaPlus. Je comprends que SpaPlus facture une commission seulement sur les réservations confirmées qu’il génère, sans frais mensuels, sans frais supplémentaires et sans engagement à long terme.",
              )}
            </span>
          </label>
          <button
            className={styles.submitButton}
            type="submit"
            disabled={submitState === "submitting"}
            aria-busy={submitState === "submitting"}
            aria-describedby={submitState === "error" ? "market-form-error" : undefined}
            aria-live="polite"
          >
            {submitState === "submitting"
              ? tr("Sending your details...", "Envoi de vos renseignements...")
              : dynamicCopy(
                  "formSubmitButton",
                  isNetwork ? "Send my spa details" : `Join the ${selectedArea?.name || marketName} Founding Spa List`,
                  isNetwork ? "Présenter mon spa" : `Rejoindre la liste des spas fondateurs de ${selectedArea?.name || marketName}`,
                )}
          </button>
          <p className={styles.formFinePrint}>
            {tr(
              "Founding partner terms are not guaranteed. Any commercial offer will be shared separately in writing after a fit review.",
              "Les conditions de partenaire fondateur ne sont pas garanties. Toute offre commerciale sera transmise séparément par écrit après l’évaluation du partenariat.",
            )}
          </p>
        </form>
      </section>

      <section className={styles.faq} id="faq">
        <div>
          <p className={styles.eyebrowDark}>{tr("THE IMPORTANT QUESTIONS", "LES QUESTIONS IMPORTANTES")}</p>
          <h2>{tr("Before you register.", "Avant de vous inscrire.")}</h2>
        </div>
        <div className={styles.faqList}>
          <details>
            <summary>{tr("Does it cost anything to register?", "L’inscription est-elle payante?")}</summary>
            <p>
              {dynamicCopy(
                "faqCostAnswer",
                isNetwork
                  ? "No. Sending a partner enquiry is free. We do not ask for payment or credit card details."
                  : `No. Joining the ${marketName} early-access list is free. We do not ask for payment or credit card details.`,
                isNetwork
                  ? "Non. La demande de partenariat est gratuite. Nous ne demandons aucun paiement ni renseignement de carte de crédit."
                  : `Non. L’inscription à la liste prioritaire de l’${marketName} est gratuite. Nous ne demandons aucun paiement ni renseignement de carte de crédit.`,
              )}
            </p>
          </details>
          <details>
            <summary>{tr("Am I committing my spa to join?", "Est-ce que j’engage mon spa à se joindre à SpaPlus?")}</summary>
            <p>
              {tr(
                "No. The form only tells us you are interested in learning more. You can review the launch offer before making any decision.",
                "Non. Le formulaire indique seulement que vous souhaitez en savoir plus. Vous pourrez examiner l’offre de lancement avant de prendre une décision.",
              )}
            </p>
          </details>
          <details>
            <summary>
              {dynamicCopy(
                "faqLaunchQuestion",
                isNetwork ? "Where is SpaPlus available in Canada?" : `When will SpaPlus launch in ${marketName}?`,
                isNetwork ? "Où SpaPlus est-il offert au Canada?" : `Quand SpaPlus sera-t-il lancé en ${marketName}?`,
              )}
            </summary>
            <p>
              {isNetwork
                ? tr(
                    "SpaPlus Canada already presents spa experiences in Québec. This page receives partner enquiries from the rest of Canada outside Ontario, which has its own dedicated page.",
                    "SpaPlus Canada présente déjà des expériences spa au Québec. Cette page reçoit les demandes de partenariat du reste du Canada hors Ontario, qui possède sa propre page.",
                  )
                : tr(
                    "The launch date has not been announced. Early registrations help us build the right founding group before opening the market.",
                    "La date de lancement n’a pas encore été annoncée. Les inscriptions prioritaires nous aident à former le bon groupe de partenaires fondateurs avant l’ouverture du marché.",
                  )}
            </p>
          </details>
          <details>
            <summary>{tr("What happens with bookings later?", "Comment les réservations fonctionneront-elles?")}</summary>
            <p>
              {tr(
                "The initial partner setup supports booking requests and confirmations. Spas can manage availability in the partner system for immediate confirmation, with deeper calendar connections planned as the market develops.",
                "La configuration initiale prend en charge les demandes et les confirmations de réservation. Les spas peuvent gérer leurs disponibilités dans l’espace partenaire pour permettre la confirmation immédiate. Des connexions plus poussées aux calendriers sont prévues à mesure que le marché se développe.",
              )}
            </p>
          </details>
          <details>
            <summary>{tr("How are guest payments handled?", "Comment les paiements des clients sont-ils gérés?")}</summary>
            <p>
              {tr(
                "Guests may be offered pay-now or pay-at-the-spa options, depending on the experience. Settlement and commission details are shown in a clear monthly report and explained before a spa goes live.",
                "Selon l’expérience, les clients peuvent payer maintenant ou au spa. Les détails du règlement et des commissions figurent dans un rapport mensuel clair et sont expliqués avant la mise en ligne du spa.",
              )}
            </p>
          </details>
        </div>
      </section>

      <section className={styles.finalCta}>
        <p className={styles.eyebrow}>
          {dynamicCopy(
            "finalEyebrow",
            `${primaryCity.toUpperCase()}. ${marketName.toUpperCase()}. LET’S BUILD THIS WELL.`,
            `${primaryCity.toUpperCase()}. ${marketName.toUpperCase()}. BÂTISSONS CELA COMME IL FAUT.`,
          )}
        </p>
        <h2>
          {managed("finalTitle", isNetwork
            ? tr(
                "Your spa could become part of the growing SpaPlus Canada network.",
                "Votre spa pourrait faire partie du réseau SpaPlus Canada en pleine croissance.",
              )
            : tr(
                `Your spa could help shape the first SpaPlus experience in ${selectedArea?.name || marketName}.`,
                `Votre spa pourrait contribuer à façonner la première expérience SpaPlus à ${selectedArea?.name || `l’${marketName}`}.`,
              ))}
        </h2>
        <a
          className={styles.primaryButton}
          href="#join"
          onClick={() =>
            track("click_join_early_access", { placement: "final" })
          }
        >
          {tr("Introduce your spa", "Présenter votre spa")}
        </a>
      </section>

      <footer className={styles.footer} id="site-footer">
        <div className={styles.footerIntro}>
          <a
            className={styles.footerBrand}
            href=""
            aria-label={tr(
              "Refresh this SpaPlus page",
              "Actualiser cette page SpaPlus",
            )}
          >
            <img src="/spaplus-mark.png" alt="" width="46" height="46" />
            <span>SpaPlus</span>
          </a>
          <p>
            {dynamicCopy(
              isNetwork ? "footerIntroOutsideOntario" : "footerIntro",
              isNetwork
                ? "This page welcomes partner interest from established spas across Canada outside Ontario. Ontario has its own dedicated page and campaign."
                : `SpaPlus is preparing the ${marketName} market in ${countryName}. No ${marketName} spa listings or booking inventory are currently represented on this page.`,
              isNetwork
                ? "Cette page accueille les demandes de partenariat de spas reconnus partout au Canada hors Ontario. L'Ontario possède sa propre page et sa propre campagne."
                : `SpaPlus prépare le marché de l’${marketName}, au ${countryName}. Cette page ne présente actuellement aucune fiche ni disponibilité de réservation de spa en ${marketName}.`,
            )}
          </p>
          <p className={styles.footerTagline}>
            {tr(
              "Discover. Book. Relax.",
              "Découvrir. Réserver. Décrocher.",
            )}
          </p>
        </div>

        <nav
          className={styles.footerColumn}
          aria-label={tr(
            `${marketName} page links`,
            `Liens de la page ${marketName}`,
          )}
        >
          <strong>{tr("Explore", "Explorer")}</strong>
          <a href="#platform">{tr("The platform", "La plateforme")}</a>
          <a href="#process">{tr("How it works", "Fonctionnement")}</a>
          <a href="#faq">{tr("Questions", "Questions")}</a>
          <a href="#join">{tr("Introduce your spa", "Présenter votre spa")}</a>
        </nav>

        <nav
          className={styles.footerColumn}
          aria-label={tr("SpaPlus network links", "Liens du réseau SpaPlus")}
        >
          <strong>{tr("SpaPlus network", "Réseau SpaPlus")}</strong>
          <a href={homeHref} target="_blank" rel="noopener noreferrer">
            {tr("SpaPlus Global", "SpaPlus mondial")}
          </a>
          <a
            href={isFrench ? "https://spaplus.ca/fr/" : "https://spaplus.ca/en/"}
            target="_blank"
            rel="noopener noreferrer"
          >
            {tr("SpaPlus Canada", "SpaPlus Canada")}
          </a>
          <a href={isFrench ? "/fr-ca/quebec/" : "/en-ca/quebec/"}>
            {tr("Join SpaPlus in Québec", "Joindre SpaPlus au Québec")}
          </a>
          <a href={isFrench ? "/fr-ca/ontario/" : "/en-ca/ontario/"}>
            {tr("Ontario launch", "Lancement en Ontario")}
          </a>
          <a href={isFrench ? "/fr-ca/canada/" : "/en-ca/canada/"}>
            {tr("Join SpaPlus across Canada outside Ontario", "Joindre SpaPlus partout au Canada hors Ontario")}
          </a>
        </nav>

        <nav
          className={`${styles.footerColumn} ${styles.footerAreas}`}
          aria-label={dynamicCopy(
            "priorityAreasAria",
            isNetwork ? `${marketName} partner areas` : "Ontario launch areas",
            isNetwork ? `Régions partenaires au ${marketName}` : "Zones de lancement en Ontario",
          )}
        >
          <strong>{dynamicCopy(
            "priorityAreasTitle",
            isNetwork ? `${marketName} areas` : "Ontario launch areas",
            isNetwork ? `Régions du ${marketName}` : "Zones de lancement",
          )}</strong>
          {priorityAreas.map((area, index) => (
            <a
              key={`${area.href}-${area.label}-${index}`}
              href={area.href}
              aria-current={
                selectedArea && area.href.includes(`/${selectedArea.slug}/`)
                  ? "page"
                  : undefined
              }
            >
              {managed(`priorityArea${index + 1}Label`, area.label)}
            </a>
          ))}
        </nav>

        <nav
          className={styles.footerColumn}
          aria-label={tr("Legal and privacy links", "Liens légaux")}
        >
          <strong>{tr("Trust and access", "Confiance et accès")}</strong>
          <a
            href={`${homeHref}#privacy`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {tr("Privacy Policy", "Politique de confidentialité")}
          </a>
          <a
            href={`${homeHref}#accessibility`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {tr("Accessibility", "Accessibilité")}
          </a>
          <a href="/admin">
            {tr("Management login", "Accès à la gestion")}
          </a>
          <button
            className={styles.cookieSettingsButton}
            type="button"
            onClick={() => setShowCookieConsent(true)}
          >
            {tr("Cookie settings", "Préférences de témoins")}
          </button>
        </nav>

        <small>
          {tr(
            "© 2026 Global Spa Management Ltd. All rights reserved.",
            "© 2026 Global Spa Management Ltd. Tous droits réservés.",
          )}
        </small>
      </footer>

      <button
        className={`${styles.backToTop} ${
          showBackToTop ? styles.backToTopVisible : ""
        }`}
        type="button"
        aria-label={tr("Back to top", "Retour en haut")}
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "auto"
              : "smooth",
          })
        }
      >
        <span aria-hidden="true">↑</span>
        <span>{tr("Top", "Haut")}</span>
      </button>

      {submitState === "success" ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSubmitState("idle");
          }}
        >
          <div
            className={styles.successModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-title"
          >
            <button
              type="button"
              aria-label={tr("Close confirmation", "Fermer la confirmation")}
              onClick={() => setSubmitState("idle")}
            >
              ×
            </button>
            <span className={styles.successMark} aria-hidden="true">
              ✓
            </span>
            <p className={styles.eyebrowDark}>
              {tr("YOU’RE ON THE EARLY LIST", "VOTRE SPA EST SUR LA LISTE PRIORITAIRE")}
            </p>
            <h2 id="success-title">
              {tr(
                "Thank you. Your spa details are with us.",
                "Merci. Nous avons bien reçu les renseignements de votre spa.",
              )}
            </h2>
            <p>
              {marketSlug === "quebec" ? tr(
                `Our team will review the information and contact you by phone within ${reviewWindowHours} hours. If you provided an email, a confirmation is also on its way.`,
                `Notre équipe examinera les renseignements et communiquera avec vous par téléphone dans un délai de ${reviewWindowHours} heures. Si vous avez fourni un courriel, une confirmation est également en route.`,
              ) : dynamicCopy(
                "successBody",
                `A confirmation is on its way to your email. Our team will review the information and contact you within ${reviewWindowHours} hours.`,
                `Un courriel de confirmation est en route. Notre équipe examinera les renseignements et communiquera avec vous dans un délai de ${reviewWindowHours} heures.`,
              )}
            </p>
            <button
              className={styles.modalButton}
              type="button"
              onClick={() => setSubmitState("idle")}
            >
              {tr("Back to the page", "Retour à la page")}
            </button>
          </div>
        </div>
      ) : null}

      {showCookieConsent ? (
        <aside
          className={styles.cookieConsent}
          aria-label={tr("Privacy choices", "Choix de confidentialité")}
          role="region"
        >
          <div>
            <strong>{tr("Your privacy, your choice.", "Votre vie privée, votre choix.")}</strong>
            <p>
              {tr(
                "Essential storage runs the site. Analytics and advertising measurement run only with your permission. Read our ",
                "Le stockage essentiel fait fonctionner le site. Les outils d’analyse et de mesure publicitaire ne sont activés qu’avec votre permission. Consultez notre ",
              )}
              <a
                href={`${homeHref}#privacy`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {tr("Privacy Policy", "Politique de confidentialité")}
              </a>
              .
            </p>
          </div>
          <div className={styles.cookieActions}>
            <button type="button" onClick={() => setConsent("essential")}>
              {tr("Essential only", "Essentiels seulement")}
            </button>
            <button type="button" onClick={() => setConsent("analytics")}>
              {tr("Allow measurement", "Autoriser la mesure")}
            </button>
          </div>
        </aside>
      ) : null}
    </main>
  );
}
