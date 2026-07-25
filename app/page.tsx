"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type FormEvent } from "react";
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
const contactFormEndpoint = "/api/contact";
const platformPillars: Record<Locale, string[]> = {
  en: ["Discovery", "Booking", "Business tools", "Data and automation"],
  he: ["חיפוש וגילוי", "הזמנה", "כלים לעסקים", "מידע ואוטומציה"],
  "fr-CA": ["Découverte", "Réservation", "Outils d’affaires", "Données et automatisation"],
  ru: ["Поиск", "Бронирование", "Инструменты для бизнеса", "Данные и автоматизация"],
  el: ["Ανακάλυψη", "Κράτηση", "Εργαλεία επιχειρήσεων", "Δεδομένα και αυτοματισμοί"],
  it: ["Scoperta", "Prenotazione", "Strumenti gestionali", "Dati e automazione"],
  hu: ["Felfedezés", "Foglalás", "Üzleti eszközök", "Adatok és automatizálás"],
  pl: ["Odkrywanie", "Rezerwacja", "Narzędzia biznesowe", "Dane i automatyzacja"],
  es: ["Descubrimiento", "Reserva", "Herramientas de gestión", "Datos y automatización"],
};
const atmosphereAlts: Record<Locale, [string, string, string]> = {
  en: [
    "A spa resort at dusk with a warm pool and guests walking in robes",
    "Two friends relaxing together beside a thermal spa pool",
    "A wellness ritual with warm towels, tea and natural oils",
  ],
  he: [
    "ריזורט ספא בשעת ערב עם בריכה חמה ואורחים בחלוקים",
    "שתי חברות נרגעות יחד לצד בריכת ספא תרמית",
    "טקס וולנס עם מגבות חמות, תה ושמנים טבעיים",
  ],
  "fr-CA": [
    "Un centre de villégiature spa au crépuscule avec piscine chaude et invités en peignoir",
    "Deux amies se détendent près d’un bassin thermal",
    "Un rituel bien-être avec serviettes chaudes, thé et huiles naturelles",
  ],
  ru: [
    "Спа-курорт на закате с теплым бассейном и гостями в халатах",
    "Две подруги отдыхают у термального бассейна",
    "Велнес-ритуал с теплыми полотенцами, чаем и натуральными маслами",
  ],
  el: [
    "Θέρετρο σπα στο σούρουπο με ζεστή πισίνα και επισκέπτες με μπουρνούζια",
    "Δύο φίλες χαλαρώνουν δίπλα σε θερμική πισίνα",
    "Τελετουργία ευεξίας με ζεστές πετσέτες, τσάι και φυσικά έλαια",
  ],
  it: [
    "Resort spa al tramonto con piscina calda e ospiti in accappatoio",
    "Due amiche si rilassano accanto a una piscina termale",
    "Rituale wellness con asciugamani caldi, tè e oli naturali",
  ],
  hu: [
    "Spa üdülőhely alkonyatkor meleg medencével és köntösben sétáló vendégekkel",
    "Két barát pihen egy termálmedence mellett",
    "Wellness rituálé meleg törölközőkkel, teával és természetes olajokkal",
  ],
  pl: [
    "Resort spa o zmierzchu z ciepłym basenem i gośćmi w szlafrokach",
    "Dwie przyjaciółki odpoczywają przy basenie termalnym",
    "Rytuał wellness z ciepłymi ręcznikami, herbatą i naturalnymi olejkami",
  ],
  es: [
    "Resort de spa al atardecer con piscina cálida y huéspedes en albornoz",
    "Dos amigas descansan junto a una piscina termal",
    "Ritual de bienestar con toallas calientes, té y aceites naturales",
  ],
};

const productShowcase: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    body: string;
    guestLabel: string;
    guestTitle: string;
    guestBody: string;
    businessLabel: string;
    businessTitle: string;
    businessBody: string;
    dayPlusTitle: string;
    dayPlusBody: string;
    dayPlusTag: string;
    guestAlt: string;
    dashboardAlt: string;
    bookingAlt: string;
  }
> = {
  en: {
    eyebrow: "One connected ecosystem",
    title: "A better experience for guests. A stronger business for spa partners.",
    body: "SpaPlus connects inspiration, booking, operations and long-term guest relationships in one wellness ecosystem.",
    guestLabel: "For guests",
    guestTitle: "From a moment of inspiration to a day worth remembering.",
    guestBody: "Couples, groups and solo guests discover the right experience and book it with confidence.",
    businessLabel: "For spa businesses",
    businessTitle: "Real tools for the people running the experience.",
    businessBody: "BizSpa brings bookings, schedules, payments, performance and customer relationships into one clear workspace.",
    dayPlusTitle: "DayPlus",
    dayPlusBody: "A dedicated Day Pass and day experience management system for groups, organizations and hospitality businesses.",
    dayPlusTag: "Groups and organizations",
    guestAlt: "Two guests relaxing beside a thermal spa pool",
    dashboardAlt: "BizSpa business management platform",
    bookingAlt: "BizSpa online booking system in English",
  },
  he: {
    eyebrow: "מערכת אחת שמחברת הכל",
    title: "חוויה טובה יותר לאורחים. עסק חזק יותר לשותפי הספא.",
    body: "SpaPlus מחברת בין השראה, הזמנה, תפעול וקשר ארוך טווח עם הלקוחות, בתוך עולם וולנס אחד.",
    guestLabel: "לאורחים",
    guestTitle: "מרגע של השראה ליום ששווה לזכור.",
    guestBody: "זוגות, קבוצות וגם מי שבא לבד מוצאים את החוויה שמתאימה להם ומזמינים בביטחון.",
    businessLabel: "לעסקי הספא",
    businessTitle: "כלים אמיתיים לאנשים שמנהלים את החוויה.",
    businessBody: "BizSpa מרכזת הזמנות, יומנים, תשלומים, ביצועים וקשרי לקוחות בסביבת עבודה אחת וברורה.",
    dayPlusTitle: "DayPlus",
    dayPlusBody: "מערכת ייעודית לניהול Day Pass וימי כיף לקבוצות, ארגונים ומקומות אירוח.",
    dayPlusTag: "קבוצות וארגונים",
    guestAlt: "שני אורחים נרגעים יחד לצד בריכת ספא תרמית",
    dashboardAlt: "פלטפורמת הניהול העסקי BizSpa",
    bookingAlt: "מערכת ההזמנות המקוונת של BizSpa באנגלית",
  },
  "fr-CA": {
    eyebrow: "Un écosystème connecté",
    title: "Une meilleure expérience pour les clients. Une entreprise plus forte pour nos partenaires.",
    body: "SpaPlus relie l’inspiration, la réservation, les opérations et la relation client dans un même écosystème mieux-être.",
    guestLabel: "Pour les clients",
    guestTitle: "D’une envie de décrocher à une journée qui fait vraiment du bien.",
    guestBody: "En couple, en groupe ou en solo, chacun trouve l’expérience qui lui convient et réserve en toute confiance.",
    businessLabel: "Pour les entreprises",
    businessTitle: "Des outils concrets pour celles et ceux qui font vivre l’expérience.",
    businessBody: "BizSpa réunit réservations, horaires, paiements, performance et relations clients dans un espace clair.",
    dayPlusTitle: "DayPlus",
    dayPlusBody: "Une solution dédiée à la gestion des journées détente et des Day Pass pour les groupes, les organisations et l’hôtellerie.",
    dayPlusTag: "Groupes et organisations",
    guestAlt: "Deux personnes se détendent près d’un bassin thermal",
    dashboardAlt: "Plateforme de gestion BizSpa",
    bookingAlt: "Système de réservation en ligne BizSpa en anglais",
  },
  ru: {
    eyebrow: "Единая экосистема",
    title: "Лучший опыт для гостей. Более сильный бизнес для спа-партнеров.",
    body: "SpaPlus объединяет вдохновение, бронирование, управление и долгосрочные отношения с гостями.",
    guestLabel: "Для гостей",
    guestTitle: "От желания отдохнуть до дня, который хочется запомнить.",
    guestBody: "Пары, группы и самостоятельные гости легко находят подходящий формат и уверенно бронируют.",
    businessLabel: "Для спа-бизнеса",
    businessTitle: "Практичные инструменты для тех, кто создает впечатления.",
    businessBody: "BizSpa объединяет бронирования, расписания, платежи, аналитику и работу с клиентами.",
    dayPlusTitle: "DayPlus",
    dayPlusBody: "Система управления Day Pass и днями отдыха для групп, компаний и объектов гостеприимства.",
    dayPlusTag: "Группы и компании",
    guestAlt: "Два гостя отдыхают у термального бассейна",
    dashboardAlt: "Платформа управления BizSpa",
    bookingAlt: "Онлайн-бронирование BizSpa на английском языке",
  },
  el: {
    eyebrow: "Ένα ενιαίο οικοσύστημα",
    title: "Καλύτερη εμπειρία για τους επισκέπτες. Ισχυρότερη επιχείρηση για τους συνεργάτες spa.",
    body: "Το SpaPlus συνδέει την έμπνευση, την κράτηση, τη λειτουργία και τη σχέση με τον πελάτη σε ένα οικοσύστημα ευεξίας.",
    guestLabel: "Για τους επισκέπτες",
    guestTitle: "Από την ανάγκη για ξεκούραση σε μια ημέρα που αξίζει να θυμάσαι.",
    guestBody: "Ζευγάρια, παρέες και μεμονωμένοι επισκέπτες βρίσκουν τη σωστή εμπειρία και κλείνουν με σιγουριά.",
    businessLabel: "Για τις επιχειρήσεις spa",
    businessTitle: "Πραγματικά εργαλεία για όσους δημιουργούν την εμπειρία.",
    businessBody: "Το BizSpa συγκεντρώνει κρατήσεις, πρόγραμμα, πληρωμές, απόδοση και πελατολόγιο.",
    dayPlusTitle: "DayPlus",
    dayPlusBody: "Σύστημα διαχείρισης Day Pass και ημερήσιων εμπειριών για ομάδες, οργανισμούς και μονάδες φιλοξενίας.",
    dayPlusTag: "Ομάδες και οργανισμοί",
    guestAlt: "Δύο επισκέπτες χαλαρώνουν δίπλα σε μια θερμική πισίνα",
    dashboardAlt: "Πλατφόρμα διαχείρισης BizSpa",
    bookingAlt: "Ηλεκτρονικό σύστημα κρατήσεων BizSpa στα αγγλικά",
  },
  it: {
    eyebrow: "Un unico ecosistema",
    title: "Un’esperienza migliore per gli ospiti. Un business più forte per i partner spa.",
    body: "SpaPlus unisce ispirazione, prenotazione, gestione e relazione con il cliente in un solo ecosistema wellness.",
    guestLabel: "Per gli ospiti",
    guestTitle: "Da un momento di ispirazione a una giornata da ricordare.",
    guestBody: "Coppie, gruppi e ospiti singoli trovano l’esperienza giusta e prenotano con fiducia.",
    businessLabel: "Per le attività spa",
    businessTitle: "Strumenti concreti per chi crea l’esperienza.",
    businessBody: "BizSpa riunisce prenotazioni, agenda, pagamenti, performance e relazioni con i clienti.",
    dayPlusTitle: "DayPlus",
    dayPlusBody: "Il sistema per gestire Day Pass e giornate benessere per gruppi, aziende e strutture ricettive.",
    dayPlusTag: "Gruppi e aziende",
    guestAlt: "Due ospiti si rilassano accanto a una piscina termale",
    dashboardAlt: "Piattaforma gestionale BizSpa",
    bookingAlt: "Sistema di prenotazione online BizSpa in inglese",
  },
  hu: {
    eyebrow: "Egy összekapcsolt rendszer",
    title: "Jobb élmény a vendégeknek. Erősebb üzlet a spa partnereknek.",
    body: "A SpaPlus egyetlen wellness ökoszisztémában kapcsolja össze az inspirációt, a foglalást, a működést és az ügyfélkapcsolatokat.",
    guestLabel: "Vendégeknek",
    guestTitle: "Az első ötlettől egy emlékezetes napig.",
    guestBody: "Párok, csoportok és egyéni vendégek könnyen megtalálják és magabiztosan lefoglalják a megfelelő élményt.",
    businessLabel: "Spa vállalkozásoknak",
    businessTitle: "Valódi eszközök azoknak, akik az élményt működtetik.",
    businessBody: "A BizSpa egy helyen kezeli a foglalásokat, időbeosztást, fizetéseket, teljesítményt és ügyfélkapcsolatokat.",
    dayPlusTitle: "DayPlus",
    dayPlusBody: "Day Pass és élménynap-kezelő rendszer csoportok, szervezetek és vendéglátóhelyek számára.",
    dayPlusTag: "Csoportok és szervezetek",
    guestAlt: "Két vendég pihen egy termálmedence mellett",
    dashboardAlt: "BizSpa üzleti platform",
    bookingAlt: "BizSpa online foglalási rendszer angol nyelven",
  },
  pl: {
    eyebrow: "Jeden połączony ekosystem",
    title: "Lepsze doświadczenie dla gości. Silniejszy biznes dla partnerów spa.",
    body: "SpaPlus łączy inspirację, rezerwację, obsługę i relacje z klientami w jednym ekosystemie wellness.",
    guestLabel: "Dla gości",
    guestTitle: "Od pomysłu na odpoczynek do dnia, który warto zapamiętać.",
    guestBody: "Pary, grupy i osoby odwiedzające spa solo łatwo znajdują właściwe doświadczenie i rezerwują bez obaw.",
    businessLabel: "Dla biznesu spa",
    businessTitle: "Praktyczne narzędzia dla ludzi, którzy tworzą doświadczenie.",
    businessBody: "BizSpa łączy rezerwacje, grafik, płatności, wyniki i relacje z klientami.",
    dayPlusTitle: "DayPlus",
    dayPlusBody: "System do zarządzania Day Pass i dniami wellness dla grup, firm i obiektów hotelarskich.",
    dayPlusTag: "Grupy i firmy",
    guestAlt: "Dwoje gości odpoczywa przy basenie termalnym",
    dashboardAlt: "Platforma zarządzania BizSpa",
    bookingAlt: "System rezerwacji online BizSpa w języku angielskim",
  },
  es: {
    eyebrow: "Un ecosistema conectado",
    title: "Una experiencia mejor para los clientes. Un negocio más sólido para los spas.",
    body: "SpaPlus conecta inspiración, reservas, operaciones y relación con el cliente dentro de un mismo ecosistema de bienestar.",
    guestLabel: "Para los clientes",
    guestTitle: "De las ganas de desconectar a un día que merece la pena recordar.",
    guestBody: "Parejas, grupos y personas que vienen solas encuentran la experiencia adecuada y reservan con confianza.",
    businessLabel: "Para los negocios de spa",
    businessTitle: "Herramientas reales para quienes hacen posible la experiencia.",
    businessBody: "BizSpa reúne reservas, agenda, pagos, rendimiento y relación con clientes en un espacio claro.",
    dayPlusTitle: "DayPlus",
    dayPlusBody: "Sistema para gestionar Day Pass y jornadas de bienestar para grupos, empresas y alojamientos.",
    dayPlusTag: "Grupos y empresas",
    guestAlt: "Dos personas se relajan junto a una piscina termal",
    dashboardAlt: "Plataforma de gestión BizSpa",
    bookingAlt: "Sistema de reservas online BizSpa en inglés",
  },
};

function BrandLockup({ footer = false }: { footer?: boolean }) {
  return (
    <span className={`brand-lockup ${footer ? "footer-lockup" : ""}`}>
      <img
        className="brand-mark"
        src="/spaplus-mark.png"
        alt=""
        width={80}
        height={80}
      />
      <img
        className="brand-wordmark"
        src="/spaplus-wordmark.png"
        alt="SpaPlus"
        width={112}
        height={60}
      />
    </span>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [locale, setLocale] = useState<Locale>("en");
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>(
    {},
  );
  const [formStatus, setFormStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const successCloseRef = useRef<HTMLButtonElement>(null);
  const t = translations[locale];
  const company = companyData.copy[locale];
  const showcase = productShowcase[locale];
  const canadaUrl = "#contact";

  useEffect(() => {
    const queryLocale = new URLSearchParams(window.location.search).get("lang");
    const storedLocale = window.localStorage.getItem(localeStorageKey);
    const initialLocale = isLocale(queryLocale)
      ? queryLocale
      : isLocale(storedLocale)
        ? storedLocale
        : localeFromBrowser(navigator.languages);
    queueMicrotask(() => setLocale(initialLocale));
  }, []);

  useEffect(() => {
    if (formStatus !== "success") return;

    const previousOverflow = document.body.style.overflow;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFormStatus("idle");
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onEscape);
    successCloseRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onEscape);
    };
  }, [formStatus]);

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
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0);
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

  useEffect(() => {
    const openLegalFromHash = () => {
      if (!window.location.hash) return;
      const target = document.getElementById(
        decodeURIComponent(window.location.hash.slice(1)),
      );
      if (target instanceof HTMLDetailsElement) target.open = true;
    };
    openLegalFromHash();
    window.addEventListener("hashchange", openLegalFromHash);
    return () => window.removeEventListener("hashchange", openLegalFromHash);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const openLegalSection = (id: string) => {
    const section = document.getElementById(id) as HTMLDetailsElement | null;
    if (section) section.open = true;
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
    const privacyAccepted = data.get("privacy") === "accepted";
    const honey = String(data.get("_honey") || "");
    const submissionId = crypto.randomUUID();

    setFormStatus("sending");
    try {
      const response = await fetch(contactFormEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          submissionId,
          honey,
          name,
          email,
          organization,
          topic,
          message,
          privacyAccepted,
          locale,
          source: window.location.href,
        }),
      });
      const result = (await response.json()) as { success?: boolean };
      if (!response.ok || result.success !== true) {
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
      <div
        className="scroll-progress"
        aria-hidden="true"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <a className="brand" href="#top" aria-label={t.homeLabel}>
          <BrandLockup />
        </a>

        <div className="header-actions">
          <nav className="desktop-nav" aria-label={t.mainNavigation}>
            <a href="#vision">{t.navVision}</a>
            <a href="#countries">{t.navCountries}</a>
            <a href="#products">{t.productsEyebrow}</a>
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
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <a href="#vision" onClick={closeMenu}>
          {t.navVision}
        </a>
        <a href="#countries" onClick={closeMenu}>
          {t.navCountries}
        </a>
        <a href="#products" onClick={closeMenu}>
          {t.productsEyebrow}
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

          <div className="global-route" data-reveal>
            <div className="route-orbit" aria-hidden="true">
              <span className="route-line" />
              <span className="route-node route-israel">
                <i />
                <strong>{t.israelName}</strong>
                <small>{t.israelLabel}</small>
              </span>
              <span className="route-node route-canada">
                <i />
                <strong>{t.canadaName}</strong>
                <small>{t.canadaLabel}</small>
              </span>
              <span className="route-node route-usa">
                <i />
                <strong>{t.usaName}</strong>
                <small>{t.comingSoon}</small>
              </span>
              <span className="route-brand">SpaPlus Global</span>
            </div>
            <div className="route-proof">
              {company.timeline.slice(0, 3).map((item) => (
                <div key={`${item.year}-${item.title}`}>
                  <strong>{item.year}</strong>
                  <span>{item.title}</span>
                </div>
              ))}
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

        <section
          className="atmosphere-section"
          id="better-day"
          aria-label={t.visionEyebrow}
        >
          <div className="atmosphere-heading" data-reveal>
            <p className="eyebrow">{company.technologyEyebrow}</p>
            <h2>{company.technologyTitle}</h2>
            <p>{company.technologyStatement}</p>
          </div>
          <div className="audience-heading" data-reveal>
            <p className="eyebrow">{t.audienceEyebrow}</p>
            <h3>{t.audienceTitle}</h3>
          </div>
          <div className="audience-grid">
            <article data-reveal>
              <span aria-hidden="true">01</span>
              <h3>{t.coupleTitle}</h3>
              <p>{t.coupleBody}</p>
            </article>
            <article data-reveal>
              <span aria-hidden="true">02</span>
              <h3>{t.groupTitle}</h3>
              <p>{t.groupBody}</p>
            </article>
            <article data-reveal>
              <span aria-hidden="true">03</span>
              <h3>{t.soloTitle}</h3>
              <p>{t.soloBody}</p>
            </article>
          </div>
          <div className="atmosphere-gallery">
            <figure className="atmosphere-resort" data-reveal>
              <img src="/vision-resort.webp" alt={atmosphereAlts[locale][0]} />
            </figure>
            <figure data-reveal>
              <img src="/vision-people.webp" alt={atmosphereAlts[locale][1]} />
            </figure>
            <figure data-reveal>
              <img src="/vision-ritual.webp" alt={atmosphereAlts[locale][2]} />
            </figure>
          </div>
        </section>

        <section className="products-section" id="products">
          <div className="products-heading" data-reveal>
            <p className="eyebrow">{t.productsEyebrow}</p>
            <h2>{t.productsTitle}</h2>
            <p>{t.productsIntro}</p>
          </div>

          <div className="ecosystem-intro" data-reveal>
            <div className="ecosystem-copy">
              <p className="eyebrow">{showcase.eyebrow}</p>
              <h3>{showcase.title}</h3>
              <p>{showcase.body}</p>
            </div>
            <div className="ecosystem-visual">
              <figure className="experience-shot">
                <img
                  src="/vision-people.webp"
                  alt={showcase.guestAlt}
                  loading="lazy"
                />
                <figcaption>
                  <span>{showcase.guestLabel}</span>
                  <strong>{showcase.guestTitle}</strong>
                  <small>{showcase.guestBody}</small>
                </figcaption>
              </figure>
              <figure className="product-shot dashboard-shot">
                <img
                  src="/bizspa-logo.webp"
                  alt={showcase.dashboardAlt}
                  loading="lazy"
                />
              </figure>
              <figure className="product-shot booking-shot">
                <img
                  src="/bizspa-booking.jpg"
                  alt={showcase.bookingAlt}
                  loading="lazy"
                />
              </figure>
              <div className="business-caption">
                <span>{showcase.businessLabel}</span>
                <strong>{showcase.businessTitle}</strong>
                <small>{showcase.businessBody}</small>
              </div>
            </div>
          </div>

          <div className="products-grid">
            {[
              [t.marketplaceTitle, t.marketplaceBody],
              [t.bizSpaTitle, t.bizSpaBody],
              [t.aiServiceTitle, t.aiServiceBody],
              [t.marketingTitle, t.marketingBody],
              [t.spaSitesTitle, t.spaSitesBody],
              [t.giftCardsTitle, t.giftCardsBody],
              [showcase.dayPlusTitle, showcase.dayPlusBody],
            ].map(([title, body], index) => (
              <article
                className={index === 6 ? "dayplus-card" : undefined}
                key={title}
                data-reveal
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{body}</p>
                {index === 6 && <small>{showcase.dayPlusTag}</small>}
              </article>
            ))}
          </div>
        </section>

        <section className="growth-section" id="global-partners">
          <div data-reveal>
            <p className="eyebrow light">{t.growthEyebrow}</p>
            <h2>{t.growthTitle}</h2>
            <p>{t.growthBody}</p>
            <strong>{t.growthStatus}</strong>
          </div>
          <a className="button button-light" href="#contact">
            {t.growthCta}
          </a>
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
              <div className="platform-pillars" aria-label={company.technologyEyebrow}>
                {platformPillars[locale].map((pillar, index) => (
                  <span key={pillar}>
                    <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
                    {pillar}
                  </span>
                ))}
              </div>
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
                <img
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
            <div className="contact-assurance">
              <strong>SpaPlus Global</strong>
              <p>{company.formNote}</p>
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
            <label className="privacy-consent form-wide">
              <input name="privacy" type="checkbox" value="accepted" required />
              <span>
                {t.privacyConsent}{" "}
                <a href="#privacy" onClick={() => openLegalSection("privacy")}>
                  {t.privacyTitle}
                </a>
              </span>
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
              {formStatus === "error" && (
                <strong className="form-status is-error" role="alert">
                  {company.formError}
                </strong>
              )}
            </div>
          </form>
        </section>

        <section className="legal-section" aria-label={`${t.privacyTitle}, ${t.accessibilityTitle}`}>
          <details id="privacy">
            <summary>{t.privacyTitle}</summary>
            <div>
              <p>{t.privacyBody}</p>
              <small>{t.legalUpdated}</small>
            </div>
          </details>
          <details id="accessibility">
            <summary>{t.accessibilityTitle}</summary>
            <div>
              <p>{t.accessibilityBody}</p>
              <a href="#contact">{t.contact}</a>
              <small>{t.legalUpdated}</small>
            </div>
          </details>
        </section>
      </main>

      {formStatus === "success" && (
        <div
          className="success-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
          onClick={() => setFormStatus("idle")}
        >
          <div className="success-modal-card" onClick={(event) => event.stopPropagation()}>
            <span className="success-modal-check" aria-hidden="true" />
            <p className="success-modal-eyebrow">SpaPlus Global</p>
            <h2 id="success-modal-title">{company.formSuccessTitle}</h2>
            <p>{company.formReady}</p>
            <button
              ref={successCloseRef}
              className="button button-primary success-modal-close"
              type="button"
              onClick={() => setFormStatus("idle")}
            >
              {company.formSuccessClose}
            </button>
          </div>
        </div>
      )}

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
            <a href="#products">{t.productsEyebrow}</a>
            <a href="#global-partners">{t.growthEyebrow}</a>
            <a href={israelUrl}>{t.israelName}</a>
            <a href={canadaUrl}>{t.canadaName}</a>
            <span>
              {t.usaName} {t.comingSoon}
            </span>
            <a href="#about">{t.aboutEyebrow}</a>
            <a href="#contact">{t.contact}</a>
            <a href="#privacy" onClick={() => openLegalSection("privacy")}>
              {t.privacyTitle}
            </a>
            <a
              href="#accessibility"
              onClick={() => openLegalSection("accessibility")}
            >
              {t.accessibilityTitle}
            </a>
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
