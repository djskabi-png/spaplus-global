"use client";

import {
  CSSProperties,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./market-launch.module.css";

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
  languageLinks: Array<{
    label: string;
    ariaLabel: string;
    languageTag: string;
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
  { value: "Day spa", en: "Day spa", fr: "Spa urbain ou spa de jour" },
  {
    value: "Hotel or resort spa",
    en: "Hotel or resort spa",
    fr: "Spa d’hôtel ou de centre de villégiature",
  },
  {
    value: "Nordic or thermal spa",
    en: "Nordic or thermal spa",
    fr: "Spa nordique ou thermal",
  },
  {
    value: "Medical or wellness spa",
    en: "Medical or wellness spa",
    fr: "Médico-spa ou centre mieux-être",
  },
  {
    value: "Multi-location spa group",
    en: "Multi-location spa group",
    fr: "Groupe de spas multisites",
  },
  {
    value: "Other established spa venue",
    en: "Other established spa venue",
    fr: "Autre établissement de spa reconnu",
  },
];

const serviceOptions = [
  { value: "Massage", en: "Massage", fr: "Massothérapie" },
  {
    value: "Facials and skincare",
    en: "Facials and skincare",
    fr: "Soins du visage et de la peau",
  },
  {
    value: "Body treatments",
    en: "Body treatments",
    fr: "Soins du corps",
  },
  {
    value: "Thermal or Nordic experience",
    en: "Thermal or Nordic experience",
    fr: "Expérience thermale ou nordique",
  },
  {
    value: "Couples experiences",
    en: "Couples experiences",
    fr: "Expériences en couple",
  },
  {
    value: "Group experiences",
    en: "Group experiences",
    fr: "Expériences de groupe",
  },
  { value: "Day passes", en: "Day passes", fr: "Accès à la journée" },
  { value: "Spa stays", en: "Spa stays", fr: "Séjours spa" },
];

function track(event: string, data: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("spaplus:marketing-event", {
      detail: { event, ...data },
    }),
  );
  const candidate = window as Window & {
    dataLayer?: Array<Record<string, string>>;
  };
  if (window.localStorage.getItem("spaplus-consent") === "analytics") {
    candidate.dataLayer?.push({ event, ...data });
  }
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
    languageLinks,
    selectedArea,
  } = config;
  const isFrench = languageTag.toLowerCase().startsWith("fr");
  const tr = (english: string, french: string) =>
    isFrench ? french : english;
  const eventPrefix = marketSlug.replace(/[^a-z0-9_]+/g, "_");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [formStarted, setFormStarted] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerCompact, setHeaderCompact] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
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
    document.documentElement.dir = "ltr";
  }, [languageTag]);

  useEffect(() => {
    setShowCookieConsent(!window.localStorage.getItem("spaplus-consent"));
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
    updateScrollState();
    return () => window.removeEventListener("scroll", onScroll);
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

  function setConsent(value: "essential" | "analytics") {
    window.localStorage.setItem("spaplus-consent", value);
    setShowCookieConsent(false);
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
    const values = new FormData(form);
    const services = values.getAll("services").map(String);
    if (services.length === 0) {
      setSubmitState("error");
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
    } catch {
      setSubmitState("error");
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
      lang={languageTag}
      dir="ltr"
      style={
        {
          "--market-hero": `url("${heroImage}")`,
        } as CSSProperties
      }
    >
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
          aria-label={tr(
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
            {tr("Join early access", "Accès prioritaire")}
          </a>
          <div
            className={styles.languageSwitch}
            aria-label={tr("Language", "Langue")}
          >
            {languageLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                lang={link.languageTag}
                hrefLang={link.languageTag}
                aria-label={link.ariaLabel}
                aria-current={link.active ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  setMenuOpen(false);
                  window.location.assign(link.href);
                }}
              >
                {link.label}
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
            {selectedArea
              ? tr(
                  `${selectedArea.name.toUpperCase()}, YOU’RE INVITED`,
                  `${selectedArea.name.toUpperCase()}, À VOUS DE JOUER`,
                )
              : tr(
                  `${marketName.toUpperCase()}, YOU’RE NEXT`,
                  `${marketName.toUpperCase()}, À VOUS DE JOUER`,
                )}
          </p>
          <h1>
            {selectedArea
              ? tr(
                  `SpaPlus is coming to ${selectedArea.name}.`,
                  `SpaPlus arrive à ${selectedArea.name}.`,
                )
              : tr(
                  `SpaPlus is coming to ${marketName}.`,
                  `SpaPlus arrive en ${marketName}.`,
                )}
          </h1>
          <p className={styles.heroLead}>
            {selectedArea
              ? selectedArea.lead
              : tr(
                  `We are preparing a better way for people across ${primaryCity} and ${marketName} to discover, compare and book memorable spa experiences.`,
                  `Nous préparons une meilleure façon de découvrir, comparer et réserver des expériences spa mémorables à ${primaryCity} et partout en ${marketName}.`,
                )}
          </p>
          <div
            className={styles.promiseRow}
            aria-label={tr("Registration terms", "Conditions d’inscription")}
          >
            <span>{tr("No fee to register", "Inscription gratuite")}</span>
            <span>{tr("No commitment", "Sans engagement")}</span>
            <span>{tr("No credit card", "Sans carte de crédit")}</span>
          </div>
          <div className={styles.heroActions}>
            <a
              className={styles.primaryButton}
              href="#join"
              onClick={() =>
                track("click_join_early_access", { placement: "hero" })
              }
            >
              {tr(
                "Put your spa on the early list",
                "Inscrire votre spa en priorité",
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
            <p className={styles.heroMediaNote}>{heroDisclosure}</p>
          ) : null}
        </div>
      </section>

      <section
        className={styles.launchBand}
        aria-label={tr("Launch status", "État du lancement")}
      >
        <div>
          <small>{tr("LIVE TODAY", "DÉJÀ EN LIGNE")}</small>
          <strong>{referenceMarketName}</strong>
        </div>
        <span className={styles.routeLine} aria-hidden="true">
          <i />
        </span>
        <div>
          <small>{tr("COMING NEXT", "PROCHAINE ÉTAPE")}</small>
          <strong>{selectedArea?.name || marketName}</strong>
        </div>
      </section>

      <section className={styles.intro} id="why">
        <div className={styles.sectionLabel}>
          {tr("A STRONGER WAY TO GROW", "UNE MEILLEURE FAÇON DE GRANDIR")}
        </div>
        <div>
          <h2>
            {tr(
              "More people looking for a great spa day. More opportunities for the right spas.",
              "Plus de gens à la recherche d’une belle journée au spa. Plus d’occasions pour les bons établissements.",
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
          <h3>{tr("Join before the launch", "Inscrivez-vous avant le lancement")}</h3>
          <p>
            {tr(
              `Tell us about your business now and be among the first ${marketName} spas considered for onboarding.`,
              `Présentez-nous votre établissement et faites partie des premiers spas de l’${marketName} considérés pour l’intégration.`,
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
            {tr("THE FOUNDING PARTNER ADVANTAGE", "L’AVANTAGE PARTENAIRE FONDATEUR")}
          </p>
          <h2 id="founding-offer-title">
            {tr(
              "A clear path from first conversation to new bookings.",
              "Un parcours clair, du premier échange aux nouvelles réservations.",
            )}
          </h2>
          <p>
            {tr(
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
                {tr(
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
                <span>DAY PASS</span>
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
          {tr(
            `Interface previews are illustrative. ${marketName} inventory is not live and the final partner tools may evolve before launch.`,
            `Les aperçus d’interface sont illustratifs. L’inventaire de l’${marketName} n’est pas encore en ligne et les outils partenaires peuvent évoluer avant le lancement.`,
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
              {tr(
                `Already helping guests discover spas in ${referenceMarketName}.`,
                `Déjà au service de la découverte des spas au ${referenceMarketName}.`,
              )}
            </h2>
          </div>
          <p>
            {tr(
              `These are current experiences presented on the live SpaPlus Canada platform. ${marketName} listings are not live yet.`,
              `Ces expériences sont actuellement présentées sur la plateforme SpaPlus Canada. Les établissements de l’${marketName} ne sont pas encore en ligne.`,
            )}
          </p>
        </div>
        <div className={styles.gallery}>
          {referenceSpas.map((spa) => (
            <figure key={spa.name}>
              <img
                src={spa.image}
                alt={spa.imageAlt}
                width="400"
                height="320"
              />
              <figcaption>
                <strong>{spa.name}</strong>
                <span>{spa.location}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className={styles.mediaDisclosure}>
          {tr(
            `Images are sourced from current spa listings on the official SpaPlus Canada website. They illustrate the existing ${referenceMarketName} platform in ${referenceCountryName} and do not depict future ${marketName} partners.`,
            `Les images proviennent de fiches actuelles du site officiel SpaPlus Canada. Elles illustrent la plateforme existante au ${referenceMarketName}, au ${referenceCountryName}, et ne représentent pas de futurs partenaires en ${marketName}.`,
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
            {tr(
              `Established ${marketName} spas that care about the guest experience.`,
              `Des spas établis en ${marketName} qui accordent une vraie importance à l’expérience client.`,
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
          <span>{tr("Priority launch areas", "Zones de lancement prioritaires")}</span>
          <div>
            {priorityAreas.map((area) => (
              <a
                key={area.href}
                href={area.href}
                aria-current={
                  selectedArea && area.label === selectedArea.name
                    ? "page"
                    : undefined
                }
              >
                {area.label}
              </a>
            ))}
          </div>
          <small>
            {tr(
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
                "Campaign planning areas only. SpaPlus inventory is not live here yet.",
                "Secteurs prévus pour les campagnes. L’inventaire SpaPlus n’y est pas encore en ligne.",
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
                {tr(
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
            {tr(
              `${(selectedArea?.name || marketName).toUpperCase()} FOUNDING SPA LIST`,
              `LISTE PRIORITAIRE DES SPAS DE ${(selectedArea?.name || marketName).toUpperCase()}`,
            )}
          </p>
          <h2>{tr("Tell us about your spa.", "Parlez-nous de votre spa.")}</h2>
          <p>
            {tr(
              `Complete the form once. We will review it personally and contact you within ${reviewWindowHours} hours.`,
              `Remplissez le formulaire une seule fois. Nous l’examinerons personnellement et communiquerons avec vous dans un délai de ${reviewWindowHours} heures.`,
            )}
          </p>
          <div className={styles.assuranceCard}>
            <strong>{tr("What happens after you send it?", "Que se passe-t-il après l’envoi?")}</strong>
            <ul>
              <li>{tr("You receive an immediate email confirmation.", "Vous recevez immédiatement un courriel de confirmation.")}</li>
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
        >
          <div className={styles.field}>
            <label htmlFor="organization">{tr("Spa or business name", "Nom du spa ou de l’entreprise")}</label>
            <input id="organization" name="organization" required maxLength={160} />
          </div>
          <div className={styles.field}>
            <label htmlFor="website">{tr("Website or social profile", "Site Web ou profil social")}</label>
            <input
              id="website"
              name="website"
              type="url"
              placeholder="https://"
              required
              maxLength={300}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="city">
              {selectedArea
                ? tr("City or community", "Ville ou collectivité")
                : tr(`${marketName} city`, `Ville en ${marketName}`)}
            </label>
            <input id="city" name="city" required maxLength={100} />
          </div>
          <div className={styles.field}>
            <label htmlFor="postalCode">{tr("Postal code", "Code postal")}</label>
            <input
              id="postalCode"
              name="postalCode"
              autoComplete="postal-code"
              required
              maxLength={12}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="spaType">{tr("Type of spa", "Type de spa")}</label>
            <select id="spaType" name="spaType" required defaultValue="">
              <option value="" disabled>
                {tr("Select one", "Choisir une option")}
              </option>
              {spaTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {isFrench ? item.fr : item.en}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="locations">{tr("Number of locations", "Nombre d’établissements")}</label>
            <select id="locations" name="locations" required defaultValue="">
              <option value="" disabled>
                {tr("Select one", "Choisir une option")}
              </option>
              <option value="1">{tr("1 location", "1 établissement")}</option>
              <option value="2-3">{tr("2 to 3 locations", "2 à 3 établissements")}</option>
              <option value="4-10">{tr("4 to 10 locations", "4 à 10 établissements")}</option>
              <option value="11+">{tr("11 or more locations", "11 établissements ou plus")}</option>
            </select>
          </div>
          <fieldset className={styles.services}>
            <legend>{tr("Main services offered", "Principaux services offerts")}</legend>
            <div>
              {serviceOptions.map((service) => (
                <label key={service.value}>
                  <input type="checkbox" name="services" value={service.value} />
                  <span>{isFrench ? service.fr : service.en}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className={styles.field}>
            <label htmlFor="name">{tr("Your full name", "Votre nom complet")}</label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              maxLength={100}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="role">{tr("Your role", "Votre fonction")}</label>
            <input id="role" name="role" required maxLength={100} />
          </div>
          <div className={styles.field}>
            <label htmlFor="email">{tr("Business email", "Courriel professionnel")}</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={180}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="phone">{tr("Phone", "Téléphone")}</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              maxLength={40}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="preferredContact">{tr("Preferred contact", "Méthode de contact préférée")}</label>
            <select
              id="preferredContact"
              name="preferredContact"
              required
              defaultValue=""
            >
              <option value="" disabled>
                {tr("Select one", "Choisir une option")}
              </option>
              <option value="Email">{tr("Email", "Courriel")}</option>
              <option value="Phone">{tr("Phone", "Téléphone")}</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="bookingSystem">
              {tr("Current booking system", "Système de réservation actuel")}{" "}
              <span>{tr("Optional", "Facultatif")}</span>
            </label>
            <input id="bookingSystem" name="bookingSystem" maxLength={120} />
          </div>
          <div className={`${styles.field} ${styles.fullField}`}>
            <label htmlFor="message">
              {tr("Anything we should know?", "Y a-t-il autre chose à savoir?")}{" "}
              <span>{tr("Optional", "Facultatif")}</span>
            </label>
            <textarea id="message" name="message" rows={5} maxLength={1500} />
          </div>
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
              required
            />
            <span>
              {tr(
                "I understand that this registration is an expression of interest only. It creates no commitment and requests no payment or credit card.",
                "Je comprends que cette inscription exprime seulement mon intérêt. Elle ne crée aucun engagement et ne demande aucun paiement ni carte de crédit.",
              )}
            </span>
          </label>
          <button
            className={styles.submitButton}
            type="submit"
            disabled={submitState === "submitting"}
          >
            {submitState === "submitting"
              ? tr("Sending your details...", "Envoi de vos renseignements...")
              : tr(
                  `Join the ${selectedArea?.name || marketName} early list`,
                  `Rejoindre la liste prioritaire de ${selectedArea?.name || marketName}`,
                )}
          </button>
          {submitState === "error" ? (
            <p className={styles.formError} role="alert">
              {errorMessage}
            </p>
          ) : null}
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
              {tr(
                `No. Joining the ${marketName} early-access list is free. We do not ask for payment or credit card details.`,
                `Non. L’inscription à la liste prioritaire de l’${marketName} est gratuite. Nous ne demandons aucun paiement ni renseignement de carte de crédit.`,
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
              {tr(
                `When will SpaPlus launch in ${marketName}?`,
                `Quand SpaPlus sera-t-il lancé en ${marketName}?`,
              )}
            </summary>
            <p>
              {tr(
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
          {tr(
            `${primaryCity.toUpperCase()}. ${marketName.toUpperCase()}. LET’S BUILD THIS WELL.`,
            `${primaryCity.toUpperCase()}. ${marketName.toUpperCase()}. BÂTISSONS CELA COMME IL FAUT.`,
          )}
        </p>
        <h2>
          {tr(
            `Your spa could help shape the first SpaPlus experience in ${selectedArea?.name || marketName}.`,
            `Votre spa pourrait contribuer à façonner la première expérience SpaPlus à ${selectedArea?.name || `l’${marketName}`}.`,
          )}
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
            {tr(
              `SpaPlus is preparing the ${marketName} market in ${countryName}. No ${marketName} spa listings or booking inventory are currently represented on this page.`,
              `SpaPlus prépare le marché de l’${marketName}, au ${countryName}. Cette page ne présente actuellement aucune fiche ni disponibilité de réservation de spa en ${marketName}.`,
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
          aria-label={tr("Ontario page links", "Liens de la page Ontario")}
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
          <a href={isFrench ? "/fr-ca/ontario/" : "/en-ca/ontario/"}>
            {tr("Ontario launch", "Lancement en Ontario")}
          </a>
        </nav>

        <nav
          className={`${styles.footerColumn} ${styles.footerAreas}`}
          aria-label={tr("Ontario launch areas", "Zones de lancement en Ontario")}
        >
          <strong>{tr("Ontario launch areas", "Zones de lancement")}</strong>
          {priorityAreas.map((area) => (
            <a
              key={area.href}
              href={area.href}
              aria-current={
                selectedArea && area.href.includes(`/${selectedArea.slug}/`)
                  ? "page"
                  : undefined
              }
            >
              {area.label}
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
              {tr(
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
                "Essential storage runs the site. Analytics runs only with your permission. Read our ",
                "Le stockage essentiel fait fonctionner le site. Les outils d’analyse ne sont activés qu’avec votre permission. Consultez notre ",
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
              {tr("Allow analytics", "Autoriser l’analyse")}
            </button>
          </div>
        </aside>
      ) : null}
    </main>
  );
}
