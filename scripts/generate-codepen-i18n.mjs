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
const previewCss = sourceCss.replace(
  '@import "tailwindcss";',
  '@import url("https://fonts.googleapis.com/css2?family=Noto+Sans:wdth,wght@75..100,100..900&family=Noto+Sans+Hebrew:wdth,wght@75..100,100..900&display=swap");',
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
const companyContent = companyData.copy;
const teamMembers = companyData.team;
const localeStorageKey = "spaplus-global-locale";
const supportedLocales = Object.keys(translations);
const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector(".mobile-menu");
const languageSelect = document.querySelector(".language-switcher select");
const copyEmailButton = document.querySelector(".copy-email");
const contactForm = document.querySelector(".contact-form");
const backToTopButton = document.querySelector(".back-to-top");
const contactEmail = "info@spaplus.ca";
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
    const cards = teamMembers.filter((member) => member.group === group).map((member) => {
      const displayName = locale === "he" ? member.nameHe : member.nameLatin;
      const card = document.createElement("article");
      card.className = "team-member";
      const initials = document.createElement("span");
      initials.className = "team-initials";
      initials.setAttribute("aria-hidden", "true");
      initials.textContent = initialsFor(displayName);
      const copy = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = displayName;
      const role = document.createElement("span");
      role.textContent = company.roles[member.role];
      copy.append(name, role);
      card.append(initials, copy);
      return card;
    });
    groupElement.querySelector(".team-list").replaceChildren(...cards);
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
  locale === "en" ? url.searchParams.delete("lang") : url.searchParams.set("lang", locale);
  history.replaceState({}, "", url.pathname + url.search + url.hash);

  setText(".skip-link", t.skip);
  backToTopButton.setAttribute("aria-label", companyData.backToTop[locale]);
  backToTopButton.title = companyData.backToTop[locale];
  document.querySelector(".brand").setAttribute("aria-label", t.homeLabel);
  document.querySelector(".desktop-nav").setAttribute("aria-label", t.mainNavigation);
  mobileMenu.setAttribute("aria-label", t.mobileNavigation);
  document.querySelector(".footer-main nav").setAttribute("aria-label", t.footerNavigation);
  setAllText(".desktop-nav a", [
    t.navVision, t.navCountries, t.navStory, t.aboutEyebrow, t.contact, t.chooseCountry,
  ]);
  setAllText(".mobile-menu a", [
    t.navVision, t.navCountries, t.navStory, t.aboutEyebrow, t.contact, t.chooseCountry,
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
  setText(".coming-card strong", t.usaName);
  setText(".coming-card p", t.usaBody);
  setText(".coming-card > span", t.comingSoon);

  setAllText(".vision-copy > .eyebrow, .vision-copy > h2, .vision-copy > p", [
    t.visionEyebrow, t.visionTitle, t.visionBodyOne, t.visionBodyTwo,
  ]);
  setAllText(".proof-grid span", [t.proofYears, t.proofMarkets, t.proofPromise]);
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
  setAllText(".partner-section > div > *", [t.partnerEyebrow, t.partnerTitle, t.partnerBody]);
  setText(".partner-section > .button", t.partnerButton);

  setAllText(".about-intro-copy > *", [t.aboutEyebrow, t.aboutTitle, t.aboutBody]);
  setAllText(".technology-principle > *", [
    company.technologyEyebrow,
    company.technologyTitle,
    company.technologyBody,
    company.technologyStatement,
  ]);
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
  setText(".direct-email > span", company.directEmail);
  if (copyEmailButton.dataset.copied !== "true") copyEmailButton.textContent = t.copyEmail;
  setAllText(".contact-form label > span", [
    company.formName,
    company.formEmail,
    company.formCompany,
    company.formTopic,
    company.formMessage,
  ]);
  renderTopics(company);
  setText(".form-submit button", company.formSubmit);
  setText(".form-submit > p", company.formNote);
  setText(".form-status", "");

  setText(".footer-main > p", t.footerTagline);
  const footerItems = document.querySelectorAll(".footer-main nav > *");
  footerItems[0].textContent = t.navVision;
  footerItems[1].textContent = t.israelName;
  footerItems[2].textContent = t.canadaName;
  footerItems[2].href = canadaCard.href;
  footerItems[3].textContent = t.usaName + " " + t.comingSoon;
  footerItems[4].textContent = t.aboutEyebrow;
  footerItems[5].textContent = t.contact;
  setText(
    ".footer-bottom span:first-child",
    "© " + new Date().getFullYear() + " SpaPlus Global. " + t.rights,
  );
};

const closeMenu = () => {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", translations[activeLocale].openMenu);
  mobileMenu.classList.remove("is-open");
};

window.addEventListener(
  "scroll",
  () => {
    header.classList.toggle("is-scrolled", window.scrollY > 18);
    backToTopButton.classList.toggle("is-visible", window.scrollY > 640);
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
});

const copyContactEmail = async () => {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(contactEmail);
  } catch {
    const input = document.createElement("textarea");
    input.value = contactEmail;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
};

copyEmailButton.addEventListener("click", async () => {
  await copyContactEmail();
  copyEmailButton.dataset.copied = "true";
  copyEmailButton.textContent = translations[activeLocale].emailCopied;
  window.setTimeout(() => {
    copyEmailButton.dataset.copied = "false";
    copyEmailButton.textContent = translations[activeLocale].copyEmail;
  }, 2200);
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const company = companyContent[activeLocale] || companyContent.en;
  const data = new FormData(contactForm);
  const lines = [
    company.formName + ": " + data.get("name"),
    company.formEmail + ": " + data.get("email"),
    company.formCompany + ": " + (data.get("organization") || ""),
    company.formTopic + ": " + data.get("topic"),
    "",
    company.formMessage + ":",
    data.get("message"),
  ];
  setText(".form-status", company.formReady);
  window.location.href =
    "mailto:" + contactEmail +
    "?subject=" + encodeURIComponent(company.formSubject) +
    "&body=" + encodeURIComponent(lines.join("\\n"));
});

languageSelect.addEventListener("change", (event) => applyLocale(event.target.value));
mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
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
`;

await Promise.all([
  writeFile(path.join(root, "codepen", "script.js"), runtime, "utf8"),
  writeFile(path.join(root, "codepen", "style.css"), previewCss, "utf8"),
]);
