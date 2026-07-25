import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const locales = ["en", "he", "fr-CA", "ru", "el", "it", "hu", "pl", "es"];
const translations = {};
const siteEnhancements = {
  en: {
    navPartners: "Country Partners",
    pathEyebrow: "Your way into SpaPlus",
    pathTitle: "What would you like to do with SpaPlus?",
    pathIntro: "Choose the path that fits you and go straight to the right place.",
    paths: [
      ["Book a spa experience", "Find the spa experience that fits your moment and book with confidence.", "Choose your country"],
      ["For spa owners", "Reach new guests, grow bookings and manage your business with SpaPlus tools.", "Join SpaPlus"],
      ["For country entrepreneurs", "Lead SpaPlus in your market and build a local network with our brand, technology and know-how.", "Explore country partnerships"],
      ["For business partners", "Wellness brands, hospitality groups and strategic partners are invited to build new opportunities with us.", "Talk to our team"],
    ],
    productAction: "Discuss this solution",
    productGuestAction: "Find SpaPlus near you",
    footerStory: "Our Story",
    metaDescription: "SpaPlus connects guests, spa businesses and local partners through trusted wellness marketplaces, booking technology and business tools.",
    interfaceAria: "SpaPlus booking and management interface",
  },
  he: {
    navPartners: "שותפים בעולם",
    pathEyebrow: "הדרך שלכם ל־SpaPlus",
    pathTitle: "מה תרצו לעשות עם SpaPlus?",
    pathIntro: "בחרו את המסלול שמתאים לכם וניקח אתכם ישירות למקום הנכון.",
    paths: [
      ["להזמין חוויית ספא", "מצאו את חוויית הספא שמתאימה לרגע שלכם והזמינו בראש שקט.", "בחרו מדינה"],
      ["לבעלי בתי ספא", "הגיעו לאורחים חדשים, הגדילו הזמנות ונהלו את הפעילות עם הכלים של SpaPlus.", "הצטרפו ל־SpaPlus"],
      ["ליזמי מדינה", "הובילו את SpaPlus בשוק שלכם ובנו רשת מקומית עם המותג, הטכנולוגיה והידע שלנו.", "הכירו את שותפות המדינות"],
      ["לשותפים עסקיים", "מותגי וולנס, קבוצות אירוח ושותפים אסטרטגיים מוזמנים לבנות איתנו הזדמנויות חדשות.", "דברו עם הצוות שלנו"],
    ],
    productAction: "דברו איתנו על הפתרון",
    productGuestAction: "מצאו את SpaPlus במדינה שלכם",
    footerStory: "הסיפור שלנו",
    metaDescription: "SpaPlus מחברת בין אורחים, בתי ספא ושותפים מקומיים באמצעות זירות וולנס, טכנולוגיית הזמנות וכלים לניהול העסק.",
    interfaceAria: "ממשק ההזמנות והניהול של SpaPlus",
  },
  "fr-CA": {
    navPartners: "Partenaires internationaux",
    pathEyebrow: "Votre porte d’entrée chez SpaPlus",
    pathTitle: "Que souhaitez-vous faire avec SpaPlus?",
    pathIntro: "Choisissez le parcours qui vous convient et accédez directement au bon endroit.",
    paths: [
      ["Réserver une expérience spa", "Trouvez l’expérience qui correspond à votre moment et réservez en toute confiance.", "Choisir un pays"],
      ["Pour les propriétaires de spas", "Rejoignez de nouveaux clients, développez les réservations et gérez vos activités avec les outils SpaPlus.", "Rejoindre SpaPlus"],
      ["Pour les entrepreneurs locaux", "Développez SpaPlus dans votre marché avec notre marque, notre technologie et notre savoir-faire.", "Découvrir les partenariats"],
      ["Pour les partenaires d’affaires", "Marques de mieux-être, groupes hôteliers et partenaires stratégiques peuvent bâtir de nouvelles occasions avec nous.", "Parler à notre équipe"],
    ],
    productAction: "Discuter de cette solution",
    productGuestAction: "Trouver SpaPlus dans votre marché",
    footerStory: "Notre histoire",
    metaDescription: "SpaPlus relie les clients, les spas et les partenaires locaux grâce à des plateformes de mieux-être, des réservations et des outils d’affaires.",
    interfaceAria: "Interface de réservation et de gestion SpaPlus",
  },
  ru: {
    navPartners: "Партнёры в странах",
    pathEyebrow: "Ваш путь в SpaPlus",
    pathTitle: "Что вы хотите сделать вместе со SpaPlus?",
    pathIntro: "Выберите подходящее направление и сразу перейдите к нужному разделу.",
    paths: [
      ["Забронировать спа", "Найдите подходящий формат отдыха и бронируйте с уверенностью.", "Выбрать страну"],
      ["Для владельцев спа", "Привлекайте новых гостей, увеличивайте бронирования и управляйте бизнесом с помощью SpaPlus.", "Присоединиться к SpaPlus"],
      ["Для предпринимателей", "Развивайте SpaPlus в своей стране с нашим брендом, технологиями и опытом.", "Узнать о партнёрстве"],
      ["Для деловых партнёров", "Велнес-бренды, гостиничные группы и стратегические партнёры могут создавать новые проекты вместе с нами.", "Связаться с командой"],
    ],
    productAction: "Обсудить решение",
    productGuestAction: "Найти SpaPlus в своей стране",
    footerStory: "Наша история",
    metaDescription: "SpaPlus объединяет гостей, спа-бизнес и местных партнёров через велнес-платформы, технологии бронирования и бизнес-инструменты.",
    interfaceAria: "Интерфейс бронирования и управления SpaPlus",
  },
  el: {
    navPartners: "Συνεργάτες ανά χώρα",
    pathEyebrow: "Ο δρόμος σας προς το SpaPlus",
    pathTitle: "Τι θα θέλατε να κάνετε με το SpaPlus;",
    pathIntro: "Επιλέξτε τη διαδρομή που σας ταιριάζει και μεταβείτε στο σωστό σημείο.",
    paths: [
      ["Κλείστε μια εμπειρία spa", "Βρείτε την εμπειρία που ταιριάζει στη στιγμή σας και κάντε κράτηση με σιγουριά.", "Επιλέξτε χώρα"],
      ["Για ιδιοκτήτες spa", "Προσεγγίστε νέους επισκέπτες, αυξήστε τις κρατήσεις και οργανώστε την επιχείρησή σας με τα εργαλεία SpaPlus.", "Γίνετε μέλος του SpaPlus"],
      ["Για επιχειρηματίες χώρας", "Αναπτύξτε το SpaPlus στην αγορά σας με το brand, την τεχνολογία και την τεχνογνωσία μας.", "Δείτε τις συνεργασίες χωρών"],
      ["Για επιχειρηματικούς συνεργάτες", "Brands ευεξίας, ξενοδοχειακοί όμιλοι και στρατηγικοί συνεργάτες μπορούν να δημιουργήσουν νέες ευκαιρίες μαζί μας.", "Μιλήστε με την ομάδα μας"],
    ],
    productAction: "Συζητήστε τη λύση",
    productGuestAction: "Βρείτε το SpaPlus στη χώρα σας",
    footerStory: "Η ιστορία μας",
    metaDescription: "Το SpaPlus συνδέει επισκέπτες, επιχειρήσεις spa και τοπικούς συνεργάτες με πλατφόρμες ευεξίας, κρατήσεις και επιχειρηματικά εργαλεία.",
    interfaceAria: "Περιβάλλον κρατήσεων και διαχείρισης SpaPlus",
  },
  it: {
    navPartners: "Partner nei Paesi",
    pathEyebrow: "Il vostro percorso in SpaPlus",
    pathTitle: "Cosa volete fare con SpaPlus?",
    pathIntro: "Scegliete il percorso più adatto e andate direttamente al punto giusto.",
    paths: [
      ["Prenotare un’esperienza spa", "Trovate l’esperienza giusta per il vostro momento e prenotate con fiducia.", "Scegliere il Paese"],
      ["Per i titolari di spa", "Raggiungete nuovi ospiti, aumentate le prenotazioni e gestite l’attività con gli strumenti SpaPlus.", "Entrare in SpaPlus"],
      ["Per gli imprenditori locali", "Portate SpaPlus nel vostro mercato con il nostro brand, la tecnologia e il know-how.", "Scoprire le partnership"],
      ["Per i partner commerciali", "Brand wellness, gruppi alberghieri e partner strategici possono creare nuove opportunità insieme a noi.", "Parlare con il team"],
    ],
    productAction: "Parliamo di questa soluzione",
    productGuestAction: "Trovate SpaPlus nel vostro Paese",
    footerStory: "La nostra storia",
    metaDescription: "SpaPlus collega ospiti, attività spa e partner locali attraverso marketplace wellness, tecnologia di prenotazione e strumenti gestionali.",
    interfaceAria: "Interfaccia SpaPlus per prenotazioni e gestione",
  },
  hu: {
    navPartners: "Országos partnerek",
    pathEyebrow: "Az Ön útja a SpaPlushoz",
    pathTitle: "Mit szeretne elérni a SpaPlusszal?",
    pathIntro: "Válassza ki az Önnek megfelelő utat, és lépjen közvetlenül a megfelelő részhez.",
    paths: [
      ["Spaélmény foglalása", "Találja meg az alkalomhoz illő spaélményt, és foglaljon magabiztosan.", "Ország kiválasztása"],
      ["Spaüzemeltetőknek", "Érjen el új vendégeket, növelje a foglalásokat, és irányítsa vállalkozását a SpaPlus eszközeivel.", "Csatlakozás a SpaPlushoz"],
      ["Helyi vállalkozóknak", "Építse fel a SpaPlust saját piacán márkánkkal, technológiánkkal és szakértelmünkkel.", "Országos partnerségek"],
      ["Üzleti partnereknek", "Wellnessmárkák, szállodacsoportok és stratégiai partnerek új lehetőségeket építhetnek velünk.", "Kapcsolat a csapatunkkal"],
    ],
    productAction: "Beszéljünk a megoldásról",
    productGuestAction: "SpaPlus az Ön országában",
    footerStory: "A történetünk",
    metaDescription: "A SpaPlus wellness piacterekkel, foglalási technológiával és üzleti eszközökkel köti össze a vendégeket, a spaüzleteket és a helyi partnereket.",
    interfaceAria: "SpaPlus foglalási és kezelési felület",
  },
  pl: {
    navPartners: "Partnerzy krajowi",
    pathEyebrow: "Twoja droga do SpaPlus",
    pathTitle: "Co chcesz zrobić ze SpaPlus?",
    pathIntro: "Wybierz właściwą ścieżkę i przejdź bezpośrednio do odpowiedniego miejsca.",
    paths: [
      ["Zarezerwować pobyt w spa", "Znajdź doświadczenie dopasowane do chwili i rezerwuj z pewnością.", "Wybierz kraj"],
      ["Dla właścicieli spa", "Docieraj do nowych gości, zwiększaj liczbę rezerwacji i zarządzaj firmą z narzędziami SpaPlus.", "Dołącz do SpaPlus"],
      ["Dla lokalnych przedsiębiorców", "Rozwijaj SpaPlus na swoim rynku z naszą marką, technologią i wiedzą.", "Poznaj partnerstwa krajowe"],
      ["Dla partnerów biznesowych", "Marki wellness, grupy hotelowe i partnerzy strategiczni mogą tworzyć z nami nowe możliwości.", "Porozmawiaj z zespołem"],
    ],
    productAction: "Porozmawiajmy o rozwiązaniu",
    productGuestAction: "Znajdź SpaPlus w swoim kraju",
    footerStory: "Nasza historia",
    metaDescription: "SpaPlus łączy gości, firmy spa i lokalnych partnerów poprzez platformy wellness, technologię rezerwacji i narzędzia biznesowe.",
    interfaceAria: "Interfejs rezerwacji i zarządzania SpaPlus",
  },
  es: {
    navPartners: "Socios por país",
    pathEyebrow: "Tu camino hacia SpaPlus",
    pathTitle: "¿Qué quieres hacer con SpaPlus?",
    pathIntro: "Elige el camino que mejor encaje contigo y ve directamente al lugar adecuado.",
    paths: [
      ["Reservar una experiencia de spa", "Encuentra la experiencia ideal para tu momento y reserva con confianza.", "Elegir país"],
      ["Para propietarios de spas", "Llega a nuevos clientes, aumenta las reservas y gestiona tu negocio con las herramientas de SpaPlus.", "Unirse a SpaPlus"],
      ["Para emprendedores locales", "Desarrolla SpaPlus en tu mercado con nuestra marca, tecnología y experiencia.", "Conocer las alianzas por país"],
      ["Para socios comerciales", "Marcas de bienestar, grupos hoteleros y socios estratégicos pueden crear nuevas oportunidades con nosotros.", "Hablar con el equipo"],
    ],
    productAction: "Hablemos de esta solución",
    productGuestAction: "Encuentra SpaPlus en tu país",
    footerStory: "Nuestra historia",
    metaDescription: "SpaPlus conecta a clientes, negocios de spa y socios locales mediante plataformas de bienestar, reservas y herramientas de gestión.",
    interfaceAria: "Interfaz de reservas y gestión de SpaPlus",
  },
};
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
const siteEnhancements = ${JSON.stringify(siteEnhancements, null, 2)};
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
  "https://spaplus-global-brand.adir-naor-7510.chatgpt.site/api/contact";
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
  const previewCount = 1;
  document.querySelectorAll("[data-team-group]").forEach((groupElement) => {
    const group = groupElement.dataset.teamGroup;
    groupElement.querySelector("h3").textContent = company.groups[group];
    const cards = teamMembers.filter((member) => member.group === group).map((member, index) => {
      const displayName = locale === "he" ? member.nameHe : member.nameLatin;
      const card = document.createElement("article");
      card.className = "team-member";
      card.hidden = index >= previewCount;
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
    if (cards.length > previewCount) {
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
          card.hidden = expanded ? index >= previewCount : false;
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
  const enhancement = siteEnhancements[locale] || siteEnhancements.en;
  activeLocale = locale;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
  document.title = t.pageTitle;
  document.querySelector('meta[name="description"]').content = enhancement.metaDescription;
  document.querySelector('meta[property="og:title"]').content = t.pageTitle;
  document.querySelector('meta[property="og:description"]').content = enhancement.metaDescription;
  const canonicalUrl = locale === "en"
    ? "https://djskabi-png.github.io/spaplus-global/"
    : "https://djskabi-png.github.io/spaplus-global/?lang=" + encodeURIComponent(locale);
  document.querySelector('link[rel="canonical"]').href = canonicalUrl;
  document.querySelector('meta[property="og:url"]').content = canonicalUrl;
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
    t.navVision, t.navCountries, t.productsEyebrow, enhancement.navPartners, t.aboutEyebrow, t.contact, t.chooseCountry,
  ]);
  setAllText(".mobile-menu a", [
    t.navVision, t.navCountries, t.productsEyebrow, enhancement.navPartners, t.aboutEyebrow, t.contact, t.chooseCountry,
  ]);
  const partnerHref = "./country-partners/?lang=" + (locale === "he" ? "he" : "en");
  document.querySelectorAll(".desktop-nav a, .mobile-menu a").forEach((link) => {
    if (link.textContent === enhancement.navPartners) link.href = partnerHref;
  });
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

  setAllText(".pathways-heading > *", [
    enhancement.pathEyebrow,
    enhancement.pathTitle,
    enhancement.pathIntro,
  ]);
  const pathwayCards = document.querySelectorAll(".pathway-card");
  enhancement.paths.forEach((content, index) => {
    pathwayCards[index].querySelector("h3").textContent = content[0];
    pathwayCards[index].querySelector("p").textContent = content[1];
    pathwayCards[index].querySelector("a").textContent = content[2];
  });
  document.querySelector(".pathway-countries a").href = partnerHref;

  setAllText("#countries > .section-heading > *", [t.worldEyebrow, t.worldTitle, t.worldBody]);
  document.querySelector(".israel-card").setAttribute("aria-label", t.israelAria);
  setAllText(".israel-card .country-content > *", [
    t.israelLabel, t.israelName, t.israelBody, t.israelButton,
  ]);
  const canadaCard = document.querySelector(".canada-card");
  canadaCard.setAttribute("aria-label", t.canadaAria);
  canadaCard.href = "#contact";
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
  document.querySelector(".booking-shot").setAttribute("aria-label", enhancement.interfaceAria);
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
  document.querySelectorAll(".product-action").forEach((link, index) => {
    link.textContent = index === 0 ? enhancement.productGuestAction : enhancement.productAction;
  });
  setAllText(".growth-section > div > *", [
    t.growthEyebrow,
    t.growthTitle,
    t.growthBody,
    t.growthStatus,
  ]);
  setText(".growth-section > .button", t.growthCta);
  document.querySelector(".growth-section > .button").href = partnerHref;
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
  footerItems[2].textContent = enhancement.navPartners;
  footerItems[2].href = partnerHref;
  footerItems[3].textContent = t.bizSpaTitle;
  footerItems[4].textContent = showcase.dayPlusTitle;
  footerItems[5].textContent = t.israelName;
  footerItems[6].textContent = t.canadaName;
  footerItems[6].href = "#countries";
  footerItems[7].textContent = t.usaName + " " + t.comingSoon;
  footerItems[8].textContent = enhancement.footerStory;
  footerItems[9].textContent = t.aboutEyebrow;
  footerItems[10].textContent = t.contact;
  footerItems[11].textContent = t.privacyTitle;
  footerItems[12].textContent = t.accessibilityTitle;
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

document.querySelectorAll("[data-topic-index]").forEach((link) => {
  link.addEventListener("click", () => {
    const topicIndex = Number(link.dataset.topicIndex);
    const select = contactForm.querySelector('select[name="topic"]');
    if (Number.isInteger(topicIndex) && select.options[topicIndex]) {
      select.selectedIndex = topicIndex;
    }
  });
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
        submissionId: crypto.randomUUID(),
        privacyAccepted,
        honey,
        name,
        email,
        organization,
        topic,
        message,
        locale: activeLocale,
        source: location.href,
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
