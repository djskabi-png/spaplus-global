import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const locales = ["en", "he", "fr-CA", "ru", "el", "it", "hu", "pl", "es"];
const translations = {};
const companyData = JSON.parse(
  await readFile(path.join(root, "app", "company-data.json"), "utf8"),
);
const sourceCss = await readFile(path.join(root, "app", "globals.css"), "utf8");
const pageSource = await readFile(path.join(root, "app", "page.tsx"), "utf8");
const showcaseAssignment = pageSource.indexOf("=", pageSource.indexOf("const productShowcase"));
const showcaseStart = pageSource.indexOf("{", showcaseAssignment);
const showcaseEnd = pageSource.indexOf("\n};", showcaseStart);
const productShowcase = Function(
  `"use strict"; return (${pageSource.slice(showcaseStart, showcaseEnd + 2)});`,
)();
const previewCss = sourceCss.replace(
  '@import "tailwindcss";',
  '@import url("https://fonts.googleapis.com/css2?family=Heebo:wght@100..900&family=Noto+Sans:wdth,wght@75..100,100..900&display=swap");',
).replaceAll('url("/', 'url("./');
const founderPhoto = await readFile(
  path.join(root, "public", "adir-naor-founder.jpg"),
);
const founderPhotoDataUri = `data:image/jpeg;base64,${founderPhoto.toString("base64")}`;

for (const locale of locales) {
  const source = await readFile(path.join(root, "app", "i18n", `${locale}.ts`), "utf8");
  const assignment = source.indexOf("=");
  const start = source.indexOf("{", assignment);
  const end = source.lastIndexOf("};");
  translations[locale] = Function(`"use strict"; return (${source.slice(start, end + 1)});`)();
}

const runtime = `const translations = ${JSON.stringify(translations, null, 2)};
const companyData = ${JSON.stringify(companyData, null, 2)};
const productShowcase = ${JSON.stringify(productShowcase, null, 2)};
const companyContent = companyData.copy;
const teamMembers = companyData.team;
const localeStorageKey = "spaplus-global-locale";
const supportedLocales = Object.keys(translations);
const platformPillars = ${JSON.stringify({
  en: ["Discovery", "Booking", "Business tools", "Data and automation"],
  he: ["חיפוש וגילוי", "הזמנה", "כלים לעסקים", "מידע ואוטומציה"],
  "fr-CA": ["Découverte", "Réservation", "Outils d’affaires", "Données et automatisation"],
  ru: ["Поиск", "Бронирование", "Инструменты для бизнеса", "Данные и автоматизация"],
  el: ["Ανακάλυψη", "Κράτηση", "Εργαλεία επιχειρήσεων", "Δεδομένα και αυτοματισμοί"],
  it: ["Scoperta", "Prenotazione", "Strumenti gestionali", "Dati e automazione"],
  hu: ["Felfedezés", "Foglalás", "Üzleti eszközök", "Adatok és automatizálás"],
  pl: ["Odkrywanie", "Rezerwacja", "Narzędzia biznesowe", "Dane i automatyzacja"],
  es: ["Descubrimiento", "Reserva", "Herramientas de gestión", "Datos y automatización"],
}, null, 2)};
const atmosphereAlts = ${JSON.stringify({
  en: ["A spa resort at dusk with a warm pool and guests walking in robes", "Two friends relaxing together beside a thermal spa pool", "A wellness ritual with warm towels, tea and natural oils"],
  he: ["ריזורט ספא בשעת ערב עם בריכה חמה ואורחים בחלוקים", "שתי חברות נרגעות יחד לצד בריכת ספא תרמית", "טקס וולנס עם מגבות חמות, תה ושמנים טבעיים"],
  "fr-CA": ["Un centre de villégiature spa au crépuscule avec piscine chaude et invités en peignoir", "Deux amies se détendent près d’un bassin thermal", "Un rituel bien-être avec serviettes chaudes, thé et huiles naturelles"],
  ru: ["Спа-курорт на закате с теплым бассейном и гостями в халатах", "Две подруги отдыхают у термального бассейна", "Велнес-ритуал с теплыми полотенцами, чаем и натуральными маслами"],
  el: ["Θέρετρο σπα στο σούρουπο με ζεστή πισίνα και επισκέπτες με μπουρνούζια", "Δύο φίλες χαλαρώνουν δίπλα σε θερμική πισίνα", "Τελετουργία ευεξίας με ζεστές πετσέτες, τσάι και φυσικά έλαια"],
  it: ["Resort spa al tramonto con piscina calda e ospiti in accappatoio", "Due amiche si rilassano accanto a una piscina termale", "Rituale wellness con asciugamani caldi, tè e oli naturali"],
  hu: ["Spa üdülőhely alkonyatkor meleg medencével és köntösben sétáló vendégekkel", "Két barát pihen egy termálmedence mellett", "Wellness rituálé meleg törölközőkkel, teával és természetes olajokkal"],
  pl: ["Resort spa o zmierzchu z ciepłym basenem i gośćmi w szlafrokach", "Dwie przyjaciółki odpoczywają przy basenie termalnym", "Rytuał wellness z ciepłymi ręcznikami, herbatą i naturalnymi olejkami"],
  es: ["Resort de spa al atardecer con piscina cálida y huéspedes en albornoz", "Dos amigas descansan junto a una piscina termal", "Ritual de bienestar con toallas calientes, té y aceites naturales"],
}, null, 2)};
const header = document.querySelector(".site-header");
const scrollProgress = document.querySelector(".scroll-progress");
const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector(".mobile-menu");
const languageSelect = document.querySelector(".language-switcher select");
const contactForm = document.querySelector(".contact-form");
const backToTopButton = document.querySelector(".back-to-top");
const successModal = document.querySelector(".success-modal");
const successModalCard = document.querySelector(".success-modal-card");
const successModalClose = document.querySelector(".success-modal-close");
const contactFormEndpoint =
  "https://formsubmit.co/ajax/93567c940af3bbace0ca1b462708c256";
const founderPhotoDataUri = ${JSON.stringify(founderPhotoDataUri)};
document.querySelector(".founder-photo").src = founderPhotoDataUri;

const createBrandLockup = (footer = false) => {
  const wrapper = document.createElement("span");
  wrapper.className = "brand-lockup" + (footer ? " footer-lockup" : "");
  wrapper.innerHTML =
    '<img class="brand-mark" src="./spaplus-mark.png" alt="">' +
    '<img class="brand-wordmark" src="./spaplus-wordmark.png" alt="SpaPlus">';
  return wrapper;
};

const headerLogo = document.querySelector(".brand > img");
if (headerLogo) headerLogo.replaceWith(createBrandLockup());
const visionLogo = document.querySelector(".logo-card > img");
if (visionLogo) visionLogo.replaceWith(createBrandLockup());
const footerLogo = document.querySelector(".footer-main > img");
if (footerLogo) footerLogo.replaceWith(createBrandLockup(true));

const browserLocale = () => {
  for (const language of navigator.languages || [navigator.language]) {
    const value = language.toLowerCase();
    if (value.startsWith("he")) return "he";
    if (value.startsWith("fr")) return "fr-CA";
    if (value.startsWith("ru")) return "ru";
    if (value.startsWith("el")) return "el";
    if (value.startsWith("it")) return "it";
    if (value.startsWith("hu")) return "hu";
    if (value.startsWith("pl")) return "pl";
    if (value.startsWith("es")) return "es";
    if (value.startsWith("en")) return "en";
  }
  return "en";
};

const queryLocale = new URLSearchParams(location.search).get("lang");
const storedLocale = localStorage.getItem(localeStorageKey);
let activeLocale = supportedLocales.includes(queryLocale)
  ? queryLocale
  : supportedLocales.includes(storedLocale)
    ? storedLocale
    : browserLocale();

const setText = (selector, value) => {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
};

const setAllText = (selector, values) => {
  document.querySelectorAll(selector).forEach((element, index) => {
    if (values[index] !== undefined) element.textContent = values[index];
  });
};

const initialsFor = (name) =>
  name.split(/\\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("");

const renderTeam = (locale, company) => {
  document.querySelectorAll("[data-team-group]").forEach((groupElement) => {
    const group = groupElement.dataset.teamGroup;
    groupElement.querySelector("h3").textContent = company.groups[group];
    const cards = teamMembers.filter((member) => member.group === group).map((member, index) => {
      const displayName = locale === "he" ? member.nameHe : member.nameLatin;
      const card = document.createElement("article");
      card.className = "team-member";
      card.hidden = index >= 3;
      const initials = document.createElement("span");
      initials.className = "team-initials";
      initials.setAttribute("aria-hidden", "true");
      initials.textContent = initialsFor(displayName);
      const copy = document.createElement("div");
      const name = document.createElement("h4");
      name.textContent = displayName;
      const role = document.createElement("p");
      role.textContent = company.roles[member.role];
      copy.append(name, role);
      card.append(initials, copy);
      return card;
    });
    groupElement.querySelector(".team-list").replaceChildren(...cards);
    groupElement.querySelector(".team-toggle")?.remove();
    if (cards.length > 3) {
      const toggle = document.createElement("button");
      toggle.className = "team-toggle";
      toggle.type = "button";
      toggle.setAttribute("aria-expanded", "false");
      const label = document.createElement("span");
      label.textContent = company.teamShowMore;
      const arrow = document.createElement("i");
      arrow.setAttribute("aria-hidden", "true");
      toggle.append(label, arrow);
      toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        cards.forEach((card, index) => {
          card.hidden = expanded ? index >= 3 : false;
        });
        label.textContent = expanded ? company.teamShowMore : company.teamShowLess;
      });
      groupElement.append(toggle);
    }
  });
};

const renderTimeline = (company) => {
  const articles = document.querySelectorAll(".timeline-grid article");
  company.timeline.forEach((item, index) => {
    const article = articles[index];
    if (!article) return;
    article.querySelector("span").textContent = item.year;
    article.querySelector("h4").textContent = item.title;
    article.querySelector("p").textContent = item.body;
  });
};

const renderTopics = (company) => {
  const select = contactForm.querySelector('select[name="topic"]');
  select.replaceChildren(...company.topics.map((topic) => {
    const option = document.createElement("option");
    option.value = topic;
    option.textContent = topic;
    return option;
  }));
};

const applyLocale = (locale) => {
  const t = translations[locale] || translations.en;
  const company = companyContent[locale] || companyContent.en;
  activeLocale = locale;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
  document.title = t.pageTitle;
  localStorage.setItem(localeStorageKey, locale);
  languageSelect.value = locale;
  languageSelect.setAttribute("aria-label", t.languageLabel);
  document.querySelector(".language-switcher .sr-only").textContent = t.languageLabel;

  const url = new URL(location.href);
  if (locale === "en") {
    url.searchParams.delete("lang");
  } else {
    url.searchParams.set("lang", locale);
  }
  history.replaceState({}, "", url.pathname + url.search + url.hash);

  setText(".skip-link", t.skip);
  backToTopButton.setAttribute("aria-label", companyData.backToTop[locale]);
  backToTopButton.title = companyData.backToTop[locale];
  document.querySelector(".brand").setAttribute("aria-label", t.homeLabel);
  document.querySelector(".desktop-nav").setAttribute("aria-label", t.mainNavigation);
  mobileMenu.setAttribute("aria-label", t.mobileNavigation);
  document.querySelector(".footer-main nav").setAttribute("aria-label", t.footerNavigation);
  setAllText(".desktop-nav a", [
    t.navVision, t.navCountries, t.productsEyebrow, t.navStory, t.aboutEyebrow, t.contact, t.chooseCountry,
  ]);
  setAllText(".mobile-menu a", [
    t.navVision, t.navCountries, t.productsEyebrow, t.navStory, t.aboutEyebrow, t.contact, t.chooseCountry,
  ]);
  menuButton.setAttribute(
    "aria-label",
    menuButton.getAttribute("aria-expanded") === "true" ? t.closeMenu : t.openMenu,
  );

  setText(".hero-copy .eyebrow", t.heroEyebrow);
  document.querySelector(".hero-copy h1").innerHTML =
    t.heroTitle + " <span>" + t.heroTitleAccent + "</span>";
  setText(".hero-intro", t.heroIntro);
  setText(".hero-actions .button", t.chooseCountry);
  setText(".hero-actions .text-link", t.discoverVision);
  document.querySelector(".hero-image").setAttribute("aria-label", t.promiseBody);
  setText(".promise-card strong", t.promiseTitle);
  setText(".promise-card span", t.promiseBody);

  setAllText("#countries > .section-heading > *", [t.worldEyebrow, t.worldTitle, t.worldBody]);
  document.querySelector(".israel-card").setAttribute("aria-label", t.israelAria);
  setAllText(".israel-card .country-content > *", [
    t.israelLabel, t.israelName, t.israelBody, t.israelButton,
  ]);
  const canadaCard = document.querySelector(".canada-card");
  canadaCard.setAttribute("aria-label", t.canadaAria);
  canadaCard.href = locale === "fr-CA" ? "https://spaplus.ca/fr/" : "https://spaplus.ca/en/";
  setAllText(".canada-card .country-content > *", [
    t.canadaLabel, t.canadaName, t.canadaBody, t.canadaButton,
  ]);
  document.querySelector(".coming-card").setAttribute("aria-label", t.usaAria);
  setText(".coming-card h3", t.usaName);
  setText(".coming-card p", t.usaBody);
  setText(".usa-status-local", t.comingSoon);
  setText(".route-israel strong", t.israelName);
  setText(".route-israel small", t.israelLabel);
  setText(".route-canada strong", t.canadaName);
  setText(".route-canada small", t.canadaLabel);
  setText(".route-usa strong", t.usaName);
  setText(".route-usa small", t.comingSoon);
  document.querySelectorAll(".route-proof div").forEach((item, index) => {
    const timelineItem = company.timeline[index];
    if (!timelineItem) return;
    item.querySelector("strong").textContent = timelineItem.year;
    item.querySelector("span").textContent = timelineItem.title;
  });

  setAllText(".vision-copy > .eyebrow, .vision-copy > h2, .vision-copy > p", [
    t.visionEyebrow, t.visionTitle, t.visionBodyOne, t.visionBodyTwo,
  ]);
  setAllText(".proof-grid span", [t.proofYears, t.proofMarkets, t.proofPromise]);
  setAllText(".atmosphere-heading > *", [
    company.technologyEyebrow,
    company.technologyTitle,
    company.technologyStatement,
  ]);
  document.querySelector(".atmosphere-section").setAttribute("aria-label", t.visionEyebrow);
  document.querySelectorAll(".atmosphere-gallery img").forEach((image, index) => {
    image.alt = atmosphereAlts[locale][index];
  });
  setAllText(".audience-heading > *", [t.audienceEyebrow, t.audienceTitle]);
  const audienceCards = document.querySelectorAll(".audience-grid article");
  [
    [t.coupleTitle, t.coupleBody],
    [t.groupTitle, t.groupBody],
    [t.soloTitle, t.soloBody],
  ].forEach((content, index) => {
    audienceCards[index].querySelector("h3").textContent = content[0];
    audienceCards[index].querySelector("p").textContent = content[1];
  });
  setAllText(".products-heading > *", [t.productsEyebrow, t.productsTitle, t.productsIntro]);
  const showcase = productShowcase[locale] || productShowcase.en;
  setAllText(".ecosystem-copy > *", [showcase.eyebrow, showcase.title, showcase.body]);
  setAllText(".experience-shot figcaption > *", [
    showcase.guestLabel, showcase.guestTitle, showcase.guestBody,
  ]);
  document.querySelector(".experience-shot img").alt = showcase.guestAlt;
  document.querySelector(".dashboard-shot img").alt = showcase.dashboardAlt;
  document.querySelector(".booking-shot img").alt = showcase.bookingAlt;
  setAllText(".business-caption > *", [
    showcase.businessLabel, showcase.businessTitle, showcase.businessBody,
  ]);
  const productCards = document.querySelectorAll(".products-grid article");
  [
    [t.marketplaceTitle, t.marketplaceBody],
    [t.bizSpaTitle, t.bizSpaBody],
    [t.aiServiceTitle, t.aiServiceBody],
    [t.marketingTitle, t.marketingBody],
    [t.spaSitesTitle, t.spaSitesBody],
    [t.giftCardsTitle, t.giftCardsBody],
    [showcase.dayPlusTitle, showcase.dayPlusBody],
  ].forEach((content, index) => {
    productCards[index].querySelector("h3").textContent = content[0];
    productCards[index].querySelector("p").textContent = content[1];
  });
  setText(".dayplus-card small", showcase.dayPlusTag);
  setAllText(".growth-section > div > *", [
    t.growthEyebrow,
    t.growthTitle,
    t.growthBody,
    t.growthStatus,
  ]);
  setText(".growth-section > .button", t.growthCta);
  setAllText(".story-copy > *", [t.storyEyebrow, t.storyTitle, t.storyBodyOne, t.storyBodyTwo]);
  setText(".story-image span", t.storyImage);
  setAllText(".benefits-section .section-heading > *", [t.experienceEyebrow, t.experienceTitle]);
  const benefits = document.querySelectorAll(".benefit-grid article");
  [
    [t.benefitOneTitle, t.benefitOneBody],
    [t.benefitTwoTitle, t.benefitTwoBody],
    [t.benefitThreeTitle, t.benefitThreeBody],
  ].forEach((content, index) => {
    benefits[index].querySelector("h3").textContent = content[0];
    benefits[index].querySelector("p").textContent = content[1];
  });
  setAllText(".about-intro-copy > *", [t.aboutEyebrow, t.aboutTitle, t.aboutBody]);
  setText(".technology-principle > .eyebrow", company.technologyEyebrow);
  setText(".technology-principle > h3", company.technologyTitle);
  setText(".technology-principle > p:not(.eyebrow)", company.technologyBody);
  setText(".technology-principle > strong", company.technologyStatement);
  setAllText(".platform-pillars span", platformPillars[locale]);
  document.querySelector(".platform-pillars").setAttribute("aria-label", company.technologyEyebrow);
  setText(".timeline-block > h3", company.timelineTitle);
  renderTimeline(company);
  setText(".founder-identity span", t.founderRole);
  setText(".founder-card h3", locale === "he" ? "אדיר נאור" : "Adir Naor");
  document.querySelector(".founder-photo").alt = locale === "he" ? "אדיר נאור" : "Adir Naor";
  setText(".founder-card > p", t.founderBio);
  setText(".founder-card blockquote", t.founderQuote);
  setAllText(".team-heading > *", [company.teamEyebrow, company.teamTitle, company.teamIntro]);
  renderTeam(locale, company);
  setAllText(".service-team-note > *", [company.serviceTeamTitle, company.serviceTeamBody]);

  setAllText(".contact-copy > .eyebrow, .contact-copy > h2, .contact-copy > p", [
    t.contact, company.contactTitle, company.contactBody,
  ]);
  setText(".contact-assurance > p", company.formNote);
  setAllText(".contact-form label:not(.form-honey):not(.privacy-consent) > span", [
    company.formName,
    company.formEmail,
    company.formCompany,
    company.formTopic,
    company.formMessage,
  ]);
  const consentText = document.querySelector(".privacy-consent > span");
  consentText.textContent = t.privacyConsent + " ";
  const privacyLink = document.createElement("a");
  privacyLink.href = "#privacy";
  privacyLink.textContent = t.privacyTitle;
  consentText.append(privacyLink);
  document.querySelector(".legal-section").setAttribute(
    "aria-label",
    t.privacyTitle + ", " + t.accessibilityTitle,
  );
  setText("#privacy summary", t.privacyTitle);
  setText("#privacy p", t.privacyBody);
  setText("#privacy small", t.legalUpdated);
  setText("#accessibility summary", t.accessibilityTitle);
  setText("#accessibility p", t.accessibilityBody);
  setText("#accessibility a", t.contact);
  setText("#accessibility small", t.legalUpdated);
  renderTopics(company);
  setText(".form-submit button", company.formSubmit);
  setText(".form-submit > p", company.formNote);
  setText(".form-status", "");
  setText("#success-modal-title", company.formSuccessTitle);
  setText(".success-modal-message", company.formReady);
  setText(".success-modal-close", company.formSuccessClose);

  setText(".footer-main > p", t.footerTagline);
  const footerItems = document.querySelectorAll(".footer-main nav > *");
  footerItems[0].textContent = t.navVision;
  footerItems[1].textContent = t.productsEyebrow;
  footerItems[2].textContent = t.growthEyebrow;
  footerItems[3].textContent = t.israelName;
  footerItems[4].textContent = t.canadaName;
  footerItems[4].href = canadaCard.href;
  footerItems[5].textContent = t.usaName + " " + t.comingSoon;
  footerItems[6].textContent = t.aboutEyebrow;
  footerItems[7].textContent = t.contact;
  footerItems[8].textContent = t.privacyTitle;
  footerItems[9].textContent = t.accessibilityTitle;
  setText(
    ".footer-bottom span:first-child",
    "© " + new Date().getFullYear() + " SpaPlus Global. " + t.rights,
  );
};

const closeMenu = () => {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", translations[activeLocale].openMenu);
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  mobileMenu.inert = true;
};

const closeSuccessModal = () => {
  successModal.hidden = true;
  document.body.classList.remove("modal-open");
};

const openSuccessModal = () => {
  successModal.hidden = false;
  document.body.classList.add("modal-open");
  successModalClose.focus();
};

successModalClose.addEventListener("click", closeSuccessModal);
successModal.addEventListener("click", closeSuccessModal);
successModalCard.addEventListener("click", (event) => event.stopPropagation());

window.addEventListener(
  "scroll",
  () => {
    header.classList.toggle("is-scrolled", window.scrollY > 18);
    backToTopButton.classList.toggle("is-visible", window.scrollY > 640);
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    scrollProgress.style.transform = "scaleX(" + progress + ")";
  },
  { passive: true },
);

backToTopButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  menuButton.setAttribute(
    "aria-label",
    open ? translations[activeLocale].openMenu : translations[activeLocale].closeMenu,
  );
  mobileMenu.classList.toggle("is-open", !open);
  mobileMenu.setAttribute("aria-hidden", String(open));
  mobileMenu.inert = open;
});

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const company = companyContent[activeLocale] || companyContent.en;
  const data = new FormData(contactForm);
  const name = String(data.get("name") || "");
  const email = String(data.get("email") || "");
  const organization = String(data.get("organization") || "");
  const topic = String(data.get("topic") || company.topics[0]);
  const message = String(data.get("message") || "");
  const privacyAccepted = data.get("privacy") === "accepted";
  const honey = String(data.get("_honey") || "");
  const button = contactForm.querySelector('button[type="submit"]');
  const status = contactForm.querySelector(".form-status");

  button.disabled = true;
  button.textContent = company.formSending;
  status.className = "form-status";
  status.textContent = "";

  try {
    const response = await fetch(contactFormEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: company.formSubject + " | " + topic + " | " + name,
        _template: "box",
        _captcha: "false",
        _honey: honey,
        _replyto: email,
        [company.formName]: name,
        Email: email,
        [company.formCompany]: organization || "Not provided",
        [company.formTopic]: topic,
        [company.formMessage]: message,
        "Privacy consent": privacyAccepted ? "Accepted" : "Not accepted",
        Language: activeLocale,
        Source: location.href,
      }),
    });
    const result = await response.json();
    if (!response.ok || String(result.success) !== "true") {
      throw new Error("Submission failed");
    }
    contactForm.reset();
    renderTopics(company);
    status.textContent = "";
    openSuccessModal();
  } catch {
    status.classList.add("is-error");
    status.textContent = company.formError;
  } finally {
    button.disabled = false;
    button.textContent = company.formSubmit;
  }
});

languageSelect.addEventListener("change", (event) => applyLocale(event.target.value));
mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
const openLegalFromHash = () => {
  if (!location.hash) return;
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target && target.matches(".legal-section details")) target.open = true;
};
document.querySelectorAll('a[href="#privacy"], a[href="#accessibility"]').forEach((link) => {
  link.addEventListener("click", () => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) target.open = true;
  });
});
window.addEventListener("hashchange", openLegalFromHash);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    closeSuccessModal();
  }
});

const revealElements = document.querySelectorAll("[data-reveal]");
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.14 },
  );
  revealElements.forEach((element) => observer.observe(element));
}

applyLocale(activeLocale);
openLegalFromHash();
`;

await Promise.all([
  writeFile(path.join(root, "codepen", "script.js"), runtime, "utf8"),
  writeFile(path.join(root, "codepen", "style.css"), previewCss, "utf8"),
]);
