import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(root, "codepen");
const previewOrigin = "https://djskabi-png.github.io/spaplus-global";

const ui = {
  en: {
    navMarkets: "Global markets",
    navSpa: "For spa businesses",
    navPartners: "Country partners",
    status: "COMING SOON",
    heroLead: (market) =>
      `SpaPlus is preparing a local home for spa and wellness in ${market}. One trusted place to discover experiences, compare options and book a better day.`,
    guestCta: "See the future experience",
    partnerCta: "Lead SpaPlus in this market",
    previewLabel: "CONCEPT PREVIEW",
    previewTitle: (market) => `A first look at SpaPlus ${market}`,
    previewBody:
      "The names, prices and listings below are illustrative. They show how the local marketplace could feel when verified spa partners join.",
    searchWhere: "Where would you like to relax?",
    searchWhen: "Choose a date",
    searchGuests: "Guests",
    searchButton: "Find a spa",
    sample: "Sample listing",
    from: "From",
    marketplaceEyebrow: "BUILT FOR A BETTER DAY",
    marketplaceTitle: "A local marketplace with global strength",
    marketplaceBody:
      "SpaPlus brings together discovery, booking and trusted business tools. Guests get a simple way to choose. Spa businesses get a stronger route to new demand.",
    benefits: [
      ["For guests", "Discover day spas, hotel spas, couples experiences, solo escapes, groups and gift cards in one clear place."],
      ["For spa businesses", "Present the right experience, receive qualified demand and use technology that saves time behind the scenes."],
      ["For the local market", "Local language, local culture and local operators, supported by the SpaPlus brand, technology and operating knowledge."],
    ],
    entrepreneurEyebrow: "COUNTRY PARTNERSHIP",
    entrepreneurTitle: (market) => `Are you the entrepreneur who can build SpaPlus in ${market}?`,
    entrepreneurBody:
      "You bring the local relationships, commercial drive and understanding of the market. SpaPlus brings the brand, website, booking platform, systems and know-how.",
    entrepreneurPoints: [
      "Build a network of quality spa partners",
      "Lead local growth, service and commercial activity",
      "Work with the SpaPlus team on launch and scale",
    ],
    apply: "Explore the country partnership",
    spaEyebrow: "FOR SPA OWNERS",
    spaTitle: "Want to be among the first spa partners?",
    spaBody:
      "Tell us about your spa and market. We will keep the details for the launch process and contact suitable businesses as the local network takes shape.",
    spaCta: "Introduce your spa",
    marketsTitle: "Markets on our map",
    marketsBody:
      "Israel and Canada are active. These are the next markets being prepared for local partners and future launches.",
    home: "SpaPlus Global",
    legal:
      "SpaPlus Global is operated by GLOBAL SPA MANAGEMENT LTD, Israeli Company No. 516106911.",
    conceptNotice:
      "Concept preview only. No displayed spa, price or availability represents a live listing.",
    languageLabel: "Language",
  },
  it: {
    navMarkets: "Mercati globali",
    navSpa: "Per le strutture spa",
    navPartners: "Partner nazionali",
    status: "PROSSIMAMENTE",
    heroLead: () =>
      "SpaPlus sta preparando una nuova casa italiana per il mondo spa e wellness. Un luogo affidabile dove scoprire esperienze, confrontare proposte e prenotare una giornata migliore.",
    guestCta: "Scopri l’esperienza futura",
    partnerCta: "Guida SpaPlus in Italia",
    previewLabel: "ANTEPRIMA DEL PROGETTO",
    previewTitle: () => "Un primo sguardo a SpaPlus Italia",
    previewBody:
      "Nomi, prezzi e strutture sono esempi illustrativi. Mostrano come potrà apparire il marketplace italiano quando entreranno i partner spa selezionati.",
    searchWhere: "Dove vuoi rilassarti?",
    searchWhen: "Scegli una data",
    searchGuests: "Ospiti",
    searchButton: "Trova una spa",
    sample: "Struttura di esempio",
    from: "Da",
    marketplaceEyebrow: "PENSATO PER UNA GIORNATA MIGLIORE",
    marketplaceTitle: "Un marketplace italiano con una forza globale",
    marketplaceBody:
      "SpaPlus unisce scoperta, prenotazione e strumenti professionali. Le persone scelgono con più semplicità e le strutture spa raggiungono una nuova domanda qualificata.",
    benefits: [
      ["Per gli ospiti", "Day spa, hotel spa, esperienze di coppia, momenti individuali, gruppi e gift card in un unico ambiente chiaro."],
      ["Per le strutture spa", "Presentare l’esperienza giusta, ricevere richieste qualificate e utilizzare una tecnologia che fa risparmiare tempo."],
      ["Per il mercato italiano", "Lingua, cultura e gestione locale, con il supporto del brand, della tecnologia e dell’esperienza SpaPlus."],
    ],
    entrepreneurEyebrow: "PARTNERSHIP NAZIONALE",
    entrepreneurTitle: () => "Sei l’imprenditore giusto per guidare SpaPlus in Italia?",
    entrepreneurBody:
      "Tu porti relazioni locali, capacità commerciale e conoscenza del mercato. SpaPlus mette a disposizione il brand, il sito, la piattaforma di prenotazione, i sistemi e il metodo.",
    entrepreneurPoints: [
      "Creare una rete selezionata di strutture spa",
      "Guidare la crescita, il servizio e l’attività commerciale locale",
      "Lavorare con il team SpaPlus al lancio e allo sviluppo del mercato",
    ],
    apply: "Scopri la partnership per l’Italia",
    spaEyebrow: "PER LE STRUTTURE SPA",
    spaTitle: "Vuoi essere tra i primi partner SpaPlus in Italia?",
    spaBody:
      "Presentaci la tua struttura. Valuteremo il profilo per la prima rete italiana e ti contatteremo durante il percorso di lancio.",
    spaCta: "Presenta la tua spa",
    marketsTitle: "I mercati sulla nostra mappa",
    marketsBody:
      "Israele e Canada sono già attivi. L’Italia fa parte dei mercati che SpaPlus sta preparando con partner locali.",
    home: "SpaPlus Global",
    legal:
      "SpaPlus Global is operated by GLOBAL SPA MANAGEMENT LTD, Israeli Company No. 516106911.",
    conceptNotice:
      "Anteprima illustrativa. Le spa, i prezzi e le disponibilità mostrate non rappresentano offerte attive.",
    languageLabel: "Lingua",
  },
  he: {
    navMarkets: "שווקים בעולם",
    navSpa: "לבתי ספא",
    navPartners: "שותפי מדינה",
    status: "בקרוב",
    heroLead: (market) =>
      `SpaPlus מכינה בית מקומי לעולם הספא והוולנס ב${market}. מקום אחד אמין לגלות חוויות, להשוות ולהזמין יום טוב יותר.`,
    guestCta: "הצצה לחוויה העתידית",
    partnerCta: "להוביל את SpaPlus בשוק הזה",
    previewLabel: "המחשת קונספט",
    previewTitle: (market) => `כך SpaPlus ${market} עשויה להיראות`,
    previewBody:
      "השמות, המחירים והמתחמים המוצגים הם להמחשה בלבד. הם נועדו להראות כיצד ייראה השוק המקומי לאחר הצטרפות ספקי ספא מאומתים.",
    searchWhere: "איפה תרצו להתפנק?",
    searchWhen: "בחירת תאריך",
    searchGuests: "אורחים",
    searchButton: "מצאו ספא",
    sample: "מתחם לדוגמה",
    from: "החל מ",
    marketplaceEyebrow: "בונים יום טוב יותר",
    marketplaceTitle: "שוק מקומי עם עוצמה גלובלית",
    marketplaceBody:
      "SpaPlus מחברת בין גילוי, הזמנה וכלים עסקיים אמינים. האורחים מקבלים דרך פשוטה לבחור, ובתי הספא מקבלים דרך חזקה להגיע לביקוש חדש.",
    benefits: [
      ["לאורחים", "ספא יומי, ספא במלון, חוויות לזוגות, יחידים, קבוצות וגיפט קארד במקום אחד ברור."],
      ["לבתי ספא", "להציג את החוויה הנכונה, לקבל ביקוש איכותי ולהשתמש בטכנולוגיה שחוסכת זמן מאחורי הקלעים."],
      ["לשוק המקומי", "שפה, תרבות ותפעול מקומיים, עם המותג, הטכנולוגיה והידע של SpaPlus."],
    ],
    entrepreneurEyebrow: "שותפות במדינה",
    entrepreneurTitle: (market) => `האם אתם היזמים שיכולים לבנות את SpaPlus ב${market}?`,
    entrepreneurBody:
      "אתם מביאים את הקשרים המקומיים, היכולת המסחרית וההיכרות עם השוק. SpaPlus מביאה את המותג, האתר, מערכת ההזמנות, המערכות והידע.",
    entrepreneurPoints: [
      "לבנות רשת של בתי ספא איכותיים",
      "להוביל את הצמיחה, השירות והפעילות המסחרית המקומית",
      "לעבוד עם צוות SpaPlus על ההשקה והגדילה",
    ],
    apply: "להכיר את שותפות המדינות",
    spaEyebrow: "לבעלי בתי ספא",
    spaTitle: "רוצים להיות בין בתי הספא הראשונים?",
    spaBody:
      "ספרו לנו על בית הספא והשוק שלכם. נשמור את הפרטים לתהליך ההשקה ונפנה לעסקים מתאימים כאשר הרשת המקומית תתחיל להיבנות.",
    spaCta: "להציג את בית הספא שלכם",
    marketsTitle: "השווקים שעל המפה שלנו",
    marketsBody:
      "ישראל וקנדה פעילות. אלה השווקים הבאים שאנחנו מכינים לשותפים מקומיים ולהשקות עתידיות.",
    home: "SpaPlus Global",
    legal:
      "SpaPlus Global is operated by GLOBAL SPA MANAGEMENT LTD, Israeli Company No. 516106911.",
    conceptNotice:
      "המחשת קונספט בלבד. בתי הספא, המחירים והזמינות המוצגים אינם רשימות פעילות.",
    languageLabel: "שפה",
  },
  elCy: {
    navMarkets: "Αγορές",
    navSpa: "Για επιχειρήσεις spa",
    navPartners: "Συνεργάτες χώρας",
    status: "ΣΥΝΤΟΜΑ",
    heroLead: () =>
      "Το SpaPlus ετοιμάζει έναν τοπικό προορισμό για spa και ευεξία στην Κύπρο. Ένα αξιόπιστο μέρος για να ανακαλύπτετε εμπειρίες, να συγκρίνετε επιλογές και να κλείνετε μια καλύτερη μέρα.",
    guestCta: "Δείτε πώς θα λειτουργεί",
    partnerCta: "Ηγηθείτε του SpaPlus στην Κύπρο",
    previewLabel: "ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΙΔΕΑΣ",
    previewTitle: () => "Μια πρώτη ματιά στο SpaPlus Cyprus",
    previewBody:
      "Τα ονόματα, οι τιμές και οι καταχωρίσεις είναι ενδεικτικά. Δείχνουν πώς μπορεί να μοιάζει η τοπική πλατφόρμα όταν ενταχθούν επιλεγμένοι συνεργάτες spa.",
    searchWhere: "Πού θέλετε να χαλαρώσετε;",
    searchWhen: "Επιλέξτε ημερομηνία",
    searchGuests: "Άτομα",
    searchButton: "Βρείτε spa",
    sample: "Ενδεικτική καταχώριση",
    from: "Από",
    marketplaceEyebrow: "ΓΙΑ ΜΙΑ ΚΑΛΥΤΕΡΗ ΜΕΡΑ",
    marketplaceTitle: "Τοπική εμπειρία με παγκόσμια υποδομή",
    marketplaceBody:
      "Το SpaPlus συνδέει την αναζήτηση, την κράτηση και τα εργαλεία διαχείρισης. Οι επισκέπτες επιλέγουν πιο εύκολα και οι επιχειρήσεις spa αποκτούν έναν ισχυρότερο δρόμο προς νέα πελατεία.",
    benefits: [
      ["Για επισκέπτες", "Day spa, hotel spa, εμπειρίες για ζευγάρια, προσωπικές αποδράσεις, ομάδες και δωροκάρτες σε ένα ξεκάθαρο περιβάλλον."],
      ["Για επιχειρήσεις spa", "Σωστή παρουσίαση, ποιοτικά αιτήματα και τεχνολογία που εξοικονομεί χρόνο στην καθημερινή λειτουργία."],
      ["Για την Κύπρο", "Ελληνικά προσαρμοσμένα στην κυπριακή αγορά, αγγλικά για τη διεθνή πελατεία και τοπική ομάδα με την υποστήριξη του SpaPlus."],
    ],
    entrepreneurEyebrow: "ΣΥΝΕΡΓΑΣΙΑ ΧΩΡΑΣ",
    entrepreneurTitle: () => "Είστε ο επιχειρηματίας που μπορεί να φέρει το SpaPlus στην Κύπρο;",
    entrepreneurBody:
      "Εσείς φέρνετε τις τοπικές σχέσεις, την εμπορική δυναμική και τη γνώση της αγοράς. Το SpaPlus προσφέρει το brand, την ιστοσελίδα, την πλατφόρμα κρατήσεων, τα συστήματα και την τεχνογνωσία.",
    entrepreneurPoints: [
      "Δημιουργία δικτύου ποιοτικών συνεργατών spa",
      "Ηγεσία στην τοπική ανάπτυξη, εξυπηρέτηση και εμπορική δραστηριότητα",
      "Συνεργασία με την ομάδα SpaPlus για το λανσάρισμα και την ανάπτυξη",
    ],
    apply: "Δείτε τη συνεργασία για την Κύπρο",
    spaEyebrow: "ΓΙΑ ΙΔΙΟΚΤΗΤΕΣ SPA",
    spaTitle: "Θέλετε να είστε ανάμεσα στους πρώτους συνεργάτες;",
    spaBody:
      "Πείτε μας για το spa και την περιοχή σας. Θα κρατήσουμε τα στοιχεία για τη διαδικασία λανσαρίσματος και θα επικοινωνήσουμε με τις κατάλληλες επιχειρήσεις καθώς διαμορφώνεται το τοπικό δίκτυο.",
    spaCta: "Παρουσιάστε το spa σας",
    marketsTitle: "Οι αγορές στον χάρτη μας",
    marketsBody:
      "Το Ισραήλ και ο Καναδάς λειτουργούν ήδη. Αυτές είναι οι επόμενες αγορές που προετοιμάζουμε με τοπικούς συνεργάτες.",
    home: "SpaPlus Global",
    legal:
      "SpaPlus Global is operated by GLOBAL SPA MANAGEMENT LTD, Israeli Company No. 516106911.",
    conceptNotice:
      "Πρόκειται για προεπισκόπηση ιδέας. Κανένα spa, τιμή ή διαθεσιμότητα δεν αποτελεί ενεργή καταχώριση.",
    languageLabel: "Γλώσσα",
  },
};

const markets = [
  {
    slug: "united-states",
    name: "United States",
    display: "United States",
    flag: "🇺🇸",
    locale: "en-us",
    lang: "en-US",
    ui: "en",
    cities: ["Miami", "New York", "Los Angeles"],
    listings: ["Atlantic Ritual Spa", "Manhattan Wellness House", "Pacific Day Retreat"],
    image: "vision-resort.webp",
  },
  {
    slug: "cyprus",
    name: "Cyprus",
    display: "Cyprus",
    flag: "🇨🇾",
    locale: "en",
    lang: "en",
    ui: "en",
    cities: ["Limassol", "Paphos", "Nicosia"],
    listings: ["Aphrodite Bay Spa", "Paphos Sea Rituals", "Nicosia Urban Retreat"],
    image: "cyprus-market-hero.png",
    alternates: [
      ["en", "English"],
      ["el-cy", "Ελληνικά Κύπρου"],
    ],
  },
  {
    slug: "cyprus",
    name: "Cyprus",
    display: "Κύπρος",
    flag: "🇨🇾",
    locale: "el-cy",
    lang: "el-CY",
    ui: "elCy",
    cities: ["Λεμεσός", "Πάφος", "Λευκωσία"],
    listings: ["Aphrodite Bay Spa", "Paphos Sea Rituals", "Nicosia Urban Retreat"],
    image: "cyprus-market-hero.png",
    alternates: [
      ["en", "English"],
      ["el-cy", "Ελληνικά Κύπρου"],
    ],
  },
  {
    slug: "greece",
    name: "Greece",
    display: "Ελλάδα",
    flag: "🇬🇷",
    locale: "el-gr",
    lang: "el-GR",
    ui: "en",
    cities: ["Athens", "Thessaloniki", "Crete"],
    listings: ["Attica Wellness Club", "Aegean Ritual Spa", "Thessaloniki Day Retreat"],
    image: "vision-ritual.webp",
  },
  {
    slug: "hungary",
    name: "Hungary",
    display: "Magyarország",
    flag: "🇭🇺",
    locale: "hu-hu",
    lang: "hu-HU",
    ui: "en",
    cities: ["Budapest", "Hévíz", "Szeged"],
    listings: ["Danube Thermal House", "Hévíz Wellness Retreat", "Budapest Spa Studio"],
    image: "vision-people.webp",
  },
  {
    slug: "italy",
    name: "Italy",
    display: "Italia",
    flag: "🇮🇹",
    locale: "it-it",
    lang: "it-IT",
    ui: "it",
    cities: ["Milan", "Rome", "Tuscany"],
    listings: ["Terme Toscana", "Milano Wellness House", "Roma Day Spa"],
    image: "vision-resort.webp",
  },
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    display: "United Kingdom",
    flag: "🇬🇧",
    locale: "en-gb",
    lang: "en-GB",
    ui: "en",
    cities: ["London", "Bath", "Manchester"],
    listings: ["Bath Ritual House", "London Spa Rooms", "Northern Wellness Club"],
    image: "vision-ritual.webp",
  },
  {
    slug: "germany",
    name: "Germany",
    display: "Deutschland",
    flag: "🇩🇪",
    locale: "de-de",
    lang: "de-DE",
    ui: "en",
    cities: ["Berlin", "Munich", "Baden-Baden"],
    listings: ["Baden Wellness Haus", "Berlin Day Spa", "Munich Thermal Club"],
    image: "vision-people.webp",
  },
  {
    slug: "france",
    name: "France",
    display: "France",
    flag: "🇫🇷",
    locale: "fr-fr",
    lang: "fr-FR",
    ui: "en",
    cities: ["Paris", "Lyon", "Nice"],
    listings: ["Maison Bien-Être Paris", "Riviera Spa Club", "Lyon Rituel Urbain"],
    image: "vision-resort.webp",
  },
  {
    slug: "netherlands",
    name: "Netherlands",
    display: "Nederland",
    flag: "🇳🇱",
    locale: "nl-nl",
    lang: "nl-NL",
    ui: "en",
    cities: ["Amsterdam", "Rotterdam", "Utrecht"],
    listings: ["Canal Wellness House", "Rotterdam Day Spa", "Utrecht Ritual Club"],
    image: "vision-ritual.webp",
  },
  {
    slug: "sweden",
    name: "Sweden",
    display: "Sverige",
    flag: "🇸🇪",
    locale: "sv-se",
    lang: "sv-SE",
    ui: "en",
    cities: ["Stockholm", "Gothenburg", "Malmö"],
    listings: ["Stockholm Calm House", "Nordic Coast Spa", "Malmö Wellness Rooms"],
    image: "vision-people.webp",
  },
  {
    slug: "norway",
    name: "Norway",
    display: "Norge",
    flag: "🇳🇴",
    locale: "nb-no",
    lang: "nb-NO",
    ui: "en",
    cities: ["Oslo", "Bergen", "Tromsø"],
    listings: ["Oslo Fjord Spa", "Bergen Ritual House", "Northern Calm Retreat"],
    image: "vision-resort.webp",
  },
  {
    slug: "switzerland",
    name: "Switzerland",
    display: "Schweiz",
    flag: "🇨🇭",
    locale: "de-ch",
    lang: "de-CH",
    ui: "en",
    cities: ["Zurich", "Geneva", "Lucerne"],
    listings: ["Alpine Wellness House", "Zurich Day Retreat", "Lake Geneva Spa"],
    image: "vision-ritual.webp",
  },
  {
    slug: "united-arab-emirates",
    name: "Dubai, United Arab Emirates",
    display: "Dubai, United Arab Emirates",
    flag: "🇦🇪",
    locale: "en-ae",
    lang: "en-AE",
    ui: "en",
    cities: ["Dubai Marina", "Downtown Dubai", "Palm Jumeirah"],
    listings: ["Marina Wellness Club", "Desert Ritual Spa", "Palm Day Retreat"],
    image: "vision-people.webp",
  },
];

const marketPath = (market) => `/${market.locale}/markets/${market.slug}/`;
const entrepreneurPath = (market) => `/${market.locale}/partners/${market.slug}/`;
const spaJoinPath = (market) => `/${market.locale}/spas/join/`;
const previewUrl = (market) => `${previewOrigin}${marketPath(market)}`;

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const renderCards = (market, copy) =>
  market.listings
    .map(
      (listing, index) => `
        <article class="sample-card">
          <div class="sample-card-image sample-${index + 1}" aria-hidden="true"></div>
          <div class="sample-card-copy">
            <span>${escapeHtml(copy.sample)}</span>
            <h3>${escapeHtml(listing)}</h3>
            <p>${escapeHtml(market.cities[index])}</p>
            <strong>${escapeHtml(copy.from)} ${index === 0 ? "€89" : index === 1 ? "€119" : "€149"}</strong>
          </div>
        </article>`,
    )
    .join("");

function renderAlternates(market) {
  const siblings = markets.filter((candidate) => candidate.slug === market.slug);
  const links = siblings
    .map(
      (candidate) =>
        `<link rel="alternate" hreflang="${candidate.lang}" href="${previewUrl(candidate)}">`,
    )
    .join("\n  ");
  return `${links}\n  <link rel="alternate" hreflang="x-default" href="${previewUrl(
    siblings.find((candidate) => candidate.locale === "en") || market,
  )}">`;
}

function renderLanguageSwitcher(market, copy) {
  const siblings = markets.filter((candidate) => candidate.slug === market.slug);
  if (siblings.length < 2) return "";
  return `
    <label class="market-language">
      <span>${escapeHtml(copy.languageLabel)}</span>
      <select data-market-language>
        ${siblings
          .map(
            (candidate) =>
              `<option value="${marketPath(candidate)}"${
                candidate.locale === market.locale ? " selected" : ""
              }>${candidate.locale === "el-cy" ? "Ελληνικά Κύπρου" : "English"}</option>`,
          )
          .join("")}
      </select>
    </label>`;
}

const funnelCopy = {
  entrepreneur: {
    eyebrow: "COUNTRY PARTNERSHIP",
    title: (market) => `Lead SpaPlus in ${market}`,
    lead:
      "Build the local market with a global brand, proven operating knowledge and the technology already behind SpaPlus.",
    tabPrimary: "For country entrepreneurs",
    tabSecondary: "For spa businesses",
    whatTitle: "A local business with a global foundation",
    whatBody:
      "You lead local relationships, supplier growth, service and commercial activity. SpaPlus provides the brand, marketplace, booking technology, business systems and launch support.",
    points: [
      "Develop relationships with quality spa and wellness businesses",
      "Build local demand and manage the market day to day",
      "Launch with the systems, experience and support of SpaPlus",
    ],
    formTitle: "Tell us why you are the right local partner",
    formLead: "Your enquiry is tagged automatically with the selected country and campaign.",
    submit: "Send partnership enquiry",
    success: "Thank you. Your country partnership enquiry was sent successfully.",
  },
  spa: {
    eyebrow: "FOR SPA BUSINESSES",
    title: (market) => `Bring your spa to SpaPlus ${market}`,
    lead:
      "Join the first group of local spa businesses preparing for the future SpaPlus marketplace in your country.",
    tabPrimary: "For spa businesses",
    tabSecondary: "For country entrepreneurs",
    whatTitle: "A stronger route to new guests",
    whatBody:
      "Present your experiences clearly, receive qualified demand and prepare for online booking with a platform built specifically for spa and wellness.",
    points: [
      "Showcase day spa, treatments, packages, groups and gift cards",
      "Reach couples, individuals and groups looking for a better day",
      "Be considered for the first verified local partner network",
    ],
    formTitle: "Introduce your spa",
    formLead: "Your enquiry is tagged automatically with the selected country and campaign.",
    submit: "Send spa details",
    success: "Thank you. Your spa details were sent successfully.",
  },
};

const italyFunnelCopy = {
  entrepreneur: {
    eyebrow: "PARTNERSHIP NAZIONALE",
    title: () => "Guida SpaPlus in Italia",
    lead:
      "Costruisci il mercato italiano con un brand internazionale, una piattaforma già sviluppata e l’esperienza operativa di SpaPlus.",
    tabPrimary: "Per imprenditori",
    tabSecondary: "Per centri spa",
    whatTitle: "Un’impresa locale con una base globale",
    whatBody:
      "Tu sviluppi le relazioni sul territorio, la rete di strutture, il servizio e la crescita commerciale. SpaPlus mette a disposizione il brand, il marketplace, la tecnologia di prenotazione, i sistemi e il supporto al lancio.",
    points: [
      "Creare una rete selezionata di spa e strutture wellness",
      "Sviluppare il mercato e guidare l’attività locale",
      "Lanciare SpaPlus Italia con tecnologia, metodo e supporto già pronti",
    ],
    formTitle: "Raccontaci perché sei il partner giusto per l’Italia",
    formLead: "La candidatura viene associata automaticamente al mercato italiano.",
    submit: "Invia la candidatura",
    success: "Grazie. La tua candidatura per SpaPlus Italia è stata inviata.",
  },
  spa: {
    eyebrow: "PER LE STRUTTURE SPA",
    title: () => "Porta la tua spa su SpaPlus Italia",
    lead:
      "Entra nel primo gruppo di strutture italiane che stiamo selezionando per il futuro marketplace SpaPlus.",
    tabPrimary: "Per centri spa",
    tabSecondary: "Per imprenditori",
    whatTitle: "Un canale più forte per raggiungere nuovi ospiti",
    whatBody:
      "Presenta con chiarezza esperienze, trattamenti e pacchetti. Raggiungi persone realmente interessate al benessere e preparati alle prenotazioni online con una piattaforma pensata per il settore spa.",
    points: [
      "Promuovere day spa, trattamenti, pacchetti, gruppi e gift card",
      "Raggiungere coppie, singoli e gruppi in cerca di una giornata migliore",
      "Essere valutati per la prima rete italiana di partner verificati",
    ],
    formTitle: "Presentaci la tua struttura",
    formLead: "La richiesta viene associata automaticamente al mercato italiano.",
    submit: "Invia i dati della spa",
    success: "Grazie. I dati della tua spa sono stati inviati.",
  },
};

function renderFunnelPage(market, type) {
  const copy =
    market.slug === "italy" ? italyFunnelCopy[type] : funnelCopy[type];
  const isSpa = type === "spa";
  const currentPath = isSpa ? spaJoinPath(market) : entrepreneurPath(market);
  const otherPath = isSpa ? entrepreneurPath(market) : spaJoinPath(market);
  const canonical = `${previewOrigin}${currentPath}`;
  const title = copy.title(market.display);
  const formType = isSpa ? "spa_business" : "country_entrepreneur";
  const labels =
    market.slug === "italy"
      ? {
          name: "Nome e cognome",
          email: "Email",
          phone: "Telefono",
          company: isSpa ? "Nome della spa o dell’azienda" : "Azienda o esperienza professionale",
          website: isSpa ? "Sito o profilo social" : "LinkedIn o sito",
          message: "Raccontaci di più",
          consent:
            "Accetto che SpaPlus utilizzi questi dati per valutare e rispondere alla richiesta.",
        }
      : {
          name: "Full name",
          email: "Email",
          phone: "Phone",
          company: isSpa ? "Spa or company name" : "Company or professional background",
          website: isSpa ? "Website or social profile" : "LinkedIn or website",
          message: "Tell us more",
          consent:
            "I agree that SpaPlus may use these details to assess and respond to this enquiry.",
        };
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://global.spaplus.co/#organization",
        name: "SpaPlus Global",
        legalName: "GLOBAL SPA MANAGEMENT LTD",
        url: "https://global.spaplus.co/",
      },
      {
        "@type": "WebPage",
        "@id": `https://global.spaplus.co${currentPath}#webpage`,
        url: `https://global.spaplus.co${currentPath}`,
        name: title,
        description: copy.lead,
        inLanguage: market.lang,
        about: { "@id": "https://global.spaplus.co/#organization" },
      },
    ],
  };
  return `<!doctype html>
<html lang="${market.lang}" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(copy.lead)}">
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="SpaPlus Global">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(copy.lead)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${previewOrigin}/${market.image}">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>
  <title>${escapeHtml(title)} | SpaPlus Global</title>
  <link rel="icon" href="/spaplus-global/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/spaplus-global/markets/market.css">
</head>
<body class="funnel-page">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="market-header">
    <a class="market-brand" href="/spaplus-global${marketPath(market)}" aria-label="SpaPlus ${escapeHtml(market.display)}">
      <img src="/spaplus-global/spaplus-mark.png" alt="">
      <img src="/spaplus-global/spaplus-wordmark.png" alt="SpaPlus">
    </a>
    <nav aria-label="Campaign routes">
      <a href="/spaplus-global${entrepreneurPath(market)}">${escapeHtml(
        isSpa ? copy.tabSecondary : copy.tabPrimary,
      )}</a>
      <a href="/spaplus-global${spaJoinPath(market)}">${escapeHtml(
        isSpa ? copy.tabPrimary : copy.tabSecondary,
      )}</a>
      <a href="/spaplus-global${marketPath(market)}">SpaPlus ${escapeHtml(market.display)}</a>
    </nav>
  </header>
  <main id="main">
    <section class="funnel-hero" style="--market-image:url('/spaplus-global/${market.image}')">
      <div class="funnel-hero-copy">
        <div class="market-status"><span>${market.flag}</span>${escapeHtml(market.display)}</div>
        <p class="eyebrow">${escapeHtml(copy.eyebrow)}</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(copy.lead)}</p>
        <div class="funnel-tabs" aria-label="Choose enquiry type">
          <a class="${isSpa ? "is-active" : ""}" href="/spaplus-global${spaJoinPath(market)}">${escapeHtml(
            isSpa ? copy.tabPrimary : copy.tabSecondary,
          )}</a>
          <a class="${isSpa ? "" : "is-active"}" href="/spaplus-global${entrepreneurPath(market)}">${escapeHtml(
            isSpa ? copy.tabSecondary : copy.tabPrimary,
          )}</a>
        </div>
      </div>
    </section>
    <section class="funnel-content section">
      <div class="funnel-explainer">
        <p class="eyebrow">SpaPlus ${escapeHtml(market.display)}</p>
        <h2>${escapeHtml(copy.whatTitle)}</h2>
        <p>${escapeHtml(copy.whatBody)}</p>
        <ul>${copy.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
        <a class="text-link" href="/spaplus-global${otherPath}">${escapeHtml(copy.tabSecondary)}</a>
      </div>
      <form class="funnel-form" data-country-funnel data-success="${escapeHtml(copy.success)}">
        <div>
          <p class="eyebrow">${escapeHtml(copy.formTitle)}</p>
          <h2>${escapeHtml(copy.formTitle)}</h2>
          <p>${escapeHtml(copy.formLead)}</p>
        </div>
        <input type="hidden" name="leadType" value="${formType}">
        <input type="hidden" name="market" value="${escapeHtml(market.slug)}">
        <input type="hidden" name="locale" value="${escapeHtml(market.locale)}">
        <input type="hidden" name="pageUrl" value="${canonical}">
        <input type="hidden" name="utm_source">
        <input type="hidden" name="utm_medium">
        <input type="hidden" name="utm_campaign">
        <input type="hidden" name="utm_content">
        <input type="hidden" name="utm_term">
        <input type="hidden" name="gclid">
        <input type="hidden" name="fbclid">
        <input type="hidden" name="referrer">
        <label>${escapeHtml(labels.name)}<input name="name" autocomplete="name" required></label>
        <label>${escapeHtml(labels.email)}<input name="email" type="email" autocomplete="email" required></label>
        <label>${escapeHtml(labels.phone)}<input name="phone" type="tel" autocomplete="tel" required></label>
        <label>${escapeHtml(labels.company)}<input name="company" autocomplete="organization" required></label>
        <label class="field-wide">${escapeHtml(labels.website)}<input name="website" type="url" inputmode="url"></label>
        <label class="field-wide">${escapeHtml(labels.message)}<textarea name="message" rows="5" required></textarea></label>
        <label class="consent field-wide"><input name="privacyConsent" type="checkbox" required value="accepted"><span>${escapeHtml(
          labels.consent,
        )}</span></label>
        <button class="button button-primary field-wide" type="submit">${escapeHtml(copy.submit)}</button>
        <p class="form-status field-wide" role="status" aria-live="polite"></p>
      </form>
    </section>
  </main>
  <footer class="market-footer">
    <div><p>${escapeHtml(ui.en.legal)}</p></div>
    <nav><a href="/spaplus-global${marketPath(market)}">Market preview</a><a href="/spaplus-global/en/#privacy">Privacy</a></nav>
  </footer>
  <script src="/spaplus-global/markets/market.js"></script>
</body>
</html>`;
}

function renderMarketPage(market) {
  const copy = ui[market.ui] || ui.en;
  const pageTitle = `${copy.status}: SpaPlus ${market.display} | SpaPlus Global`;
  const description = copy.heroLead(market.display);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://global.spaplus.co/#organization",
        name: "SpaPlus Global",
        legalName: "GLOBAL SPA MANAGEMENT LTD",
        identifier: "516106911",
        url: "https://global.spaplus.co/",
      },
      {
        "@type": "WebPage",
        "@id": `https://global.spaplus.co${marketPath(market)}#webpage`,
        url: `https://global.spaplus.co${marketPath(market)}`,
        name: pageTitle,
        description,
        inLanguage: market.lang,
        isPartOf: { "@id": "https://global.spaplus.co/#website" },
        about: { "@id": "https://global.spaplus.co/#organization" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "SpaPlus Global",
            item: "https://global.spaplus.co/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: copy.navMarkets,
            item: `https://global.spaplus.co/${market.locale}/markets/`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: market.display,
            item: `https://global.spaplus.co${marketPath(market)}`,
          },
        ],
      },
    ],
  };

  return `<!doctype html>
<html lang="${market.lang}" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#14243d">
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="${previewUrl(market)}">
  ${renderAlternates(market)}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="SpaPlus Global">
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${previewUrl(market)}">
  <meta property="og:image" content="${previewOrigin}/${market.image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${previewOrigin}/${market.image}">
  <title>${escapeHtml(pageTitle)}</title>
  <link rel="icon" href="/spaplus-global/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/spaplus-global/markets/market.css">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="market-header">
    <a class="market-brand" href="/spaplus-global/en/" aria-label="${escapeHtml(copy.home)}">
      <img src="/spaplus-global/spaplus-mark.png" alt="">
      <img src="/spaplus-global/spaplus-wordmark.png" alt="SpaPlus">
    </a>
    <nav aria-label="Market navigation">
      <a href="/spaplus-global/en/markets/">${escapeHtml(copy.navMarkets)}</a>
      <a href="/spaplus-global${spaJoinPath(market)}">${escapeHtml(copy.navSpa)}</a>
      <a href="/spaplus-global${entrepreneurPath(market)}">${escapeHtml(copy.navPartners)}</a>
    </nav>
    ${renderLanguageSwitcher(market, copy)}
  </header>

  <main id="main">
    <section class="market-hero" style="--market-image:url('/spaplus-global/${market.image}')">
      <div class="market-hero-shade"></div>
      <div class="market-hero-copy">
        <div class="market-status"><span>${market.flag}</span>${escapeHtml(copy.status)}</div>
        <p class="eyebrow">SpaPlus ${escapeHtml(market.display)}</p>
        <h1>${escapeHtml(
          market.ui === "elCy"
            ? "Το SpaPlus έρχεται στην Κύπρο"
            : market.ui === "it"
              ? "SpaPlus sta arrivando in Italia"
            : `SpaPlus is coming to ${market.display}`,
        )}</h1>
        <p>${escapeHtml(description)}</p>
        <div class="hero-actions">
          <a class="button button-primary" href="#preview">${escapeHtml(copy.guestCta)}</a>
          <a class="button button-glass" href="#entrepreneur">${escapeHtml(copy.partnerCta)}</a>
        </div>
      </div>
    </section>

    <section class="market-preview section" id="preview">
      <div class="section-heading">
        <p class="eyebrow">${escapeHtml(copy.previewLabel)}</p>
        <h2>${escapeHtml(copy.previewTitle(market.display))}</h2>
        <p>${escapeHtml(copy.previewBody)}</p>
      </div>
      <div class="marketplace-window">
        <div class="marketplace-topbar">
          <span class="mini-brand">SpaPlus <b>${escapeHtml(market.display)}</b></span>
          <span>${escapeHtml(copy.status)}</span>
        </div>
        <div class="search-mockup" aria-label="${escapeHtml(copy.previewTitle(market.display))}">
          <label><span>${escapeHtml(copy.searchWhere)}</span><strong>${escapeHtml(
            market.cities.join(" · "),
          )}</strong></label>
          <label><span>${escapeHtml(copy.searchWhen)}</span><strong>Saturday</strong></label>
          <label><span>${escapeHtml(copy.searchGuests)}</span><strong>2</strong></label>
          <button type="button" disabled>${escapeHtml(copy.searchButton)}</button>
        </div>
        <div class="sample-grid">${renderCards(market, copy)}</div>
        <p class="concept-notice">${escapeHtml(copy.conceptNotice)}</p>
      </div>
    </section>

    <section class="marketplace-story section">
      <div class="section-heading">
        <p class="eyebrow">${escapeHtml(copy.marketplaceEyebrow)}</p>
        <h2>${escapeHtml(copy.marketplaceTitle)}</h2>
        <p>${escapeHtml(copy.marketplaceBody)}</p>
      </div>
      <div class="benefit-grid">
        ${copy.benefits
          .map(
            ([title, body], index) => `
          <article>
            <span>0${index + 1}</span>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(body)}</p>
          </article>`,
          )
          .join("")}
      </div>
    </section>

    <section class="entrepreneur-section" id="entrepreneur">
      <div>
        <p class="eyebrow">${escapeHtml(copy.entrepreneurEyebrow)}</p>
        <h2>${escapeHtml(copy.entrepreneurTitle(market.display))}</h2>
        <p>${escapeHtml(copy.entrepreneurBody)}</p>
      </div>
      <div class="entrepreneur-panel">
        <ul>
          ${copy.entrepreneurPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
        <a class="button button-light" href="/spaplus-global${entrepreneurPath(market)}">${escapeHtml(
          copy.apply,
        )}</a>
      </div>
    </section>

    <section class="spa-section section" id="spa-businesses">
      <div>
        <p class="eyebrow">${escapeHtml(copy.spaEyebrow)}</p>
        <h2>${escapeHtml(copy.spaTitle)}</h2>
        <p>${escapeHtml(copy.spaBody)}</p>
      </div>
      <a class="button button-primary" href="/spaplus-global${spaJoinPath(market)}">${escapeHtml(
        copy.spaCta,
      )}</a>
    </section>
  </main>

  <footer class="market-footer">
    <div>
      <a class="market-brand" href="/spaplus-global/en/">
        <img src="/spaplus-global/spaplus-mark.png" alt="">
        <img src="/spaplus-global/spaplus-wordmark.png" alt="SpaPlus">
      </a>
      <p>${escapeHtml(copy.legal)}</p>
    </div>
    <nav aria-label="Legal navigation">
      <a href="/spaplus-global/en/#privacy">Privacy</a>
      <a href="/spaplus-global/en/#privacy">Terms</a>
      <a href="/spaplus-global/en/#accessibility">Accessibility</a>
    </nav>
  </footer>

  <button class="share-market" type="button" aria-label="Share this page">Share</button>
  <div class="share-toast" role="status" aria-live="polite"></div>
  <script src="/spaplus-global/markets/market.js"></script>
</body>
</html>`;
}

function renderMarketsHub(locale) {
  const copy = locale === "he" ? ui.he : ui.en;
  const lang = locale === "he" ? "he" : "en";
  const cards = [];
  const seen = new Set();
  for (const market of markets) {
    if (seen.has(market.slug)) continue;
    seen.add(market.slug);
    const preferred =
      markets.find((candidate) => candidate.slug === market.slug && candidate.locale === locale) ||
      markets.find((candidate) => candidate.slug === market.slug && candidate.locale === "en") ||
      market;
    cards.push(`
      <a class="hub-card" href="/spaplus-global${marketPath(preferred)}">
        <span class="hub-flag">${preferred.flag}</span>
        <span class="hub-status">${escapeHtml(copy.status)}</span>
        <h2>${escapeHtml(preferred.display)}</h2>
        <p>${escapeHtml(preferred.cities.join(" · "))}</p>
        <strong>${escapeHtml(copy.partnerCta)}</strong>
      </a>`);
  }
  const title = locale === "he" ? "SpaPlus בדרך לעולם" : "SpaPlus is building its next markets";
  const description =
    locale === "he"
      ? "מפת השווקים הבאה של SpaPlus והזמנה ליזמים מקומיים להוביל את הפעילות במדינה שלהם."
      : "Explore the next SpaPlus markets and the opportunity for strong local entrepreneurs to lead the brand in their country.";
  return `<!doctype html>
<html lang="${lang}" dir="${locale === "he" ? "rtl" : "ltr"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="${previewOrigin}/${locale}/markets/">
  <link rel="alternate" hreflang="en" href="${previewOrigin}/en/markets/">
  <link rel="alternate" hreflang="he" href="${previewOrigin}/he/markets/">
  <link rel="alternate" hreflang="x-default" href="${previewOrigin}/en/markets/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="SpaPlus Global">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${previewOrigin}/${locale}/markets/">
  <meta property="og:image" content="${previewOrigin}/cyprus-market-hero.png">
  <meta name="twitter:card" content="summary_large_image">
  <title>${escapeHtml(title)} | SpaPlus Global</title>
  <link rel="icon" href="/spaplus-global/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/spaplus-global/markets/market.css">
</head>
<body class="hub-page">
  <header class="market-header">
    <a class="market-brand" href="/spaplus-global/${locale}/">
      <img src="/spaplus-global/spaplus-mark.png" alt="">
      <img src="/spaplus-global/spaplus-wordmark.png" alt="SpaPlus">
    </a>
    <nav><a href="/spaplus-global/${locale}/">${escapeHtml(copy.home)}</a><a href="/spaplus-global/${
      locale === "he" ? "he" : "en"
    }/country-partners/">${escapeHtml(copy.navPartners)}</a></nav>
  </header>
  <main id="main">
    <section class="hub-hero">
      <p class="eyebrow">SpaPlus Global</p>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
      <div class="live-markets"><span>🇮🇱 Israel</span><span>🇨🇦 Canada</span><strong>LIVE</strong></div>
    </section>
    <section class="hub-grid section">${cards.join("")}</section>
    <section class="entrepreneur-section">
      <div><p class="eyebrow">${escapeHtml(copy.entrepreneurEyebrow)}</p><h2>${escapeHtml(
        locale === "he" ? "המדינה שלכם לא מופיעה עדיין?" : "Do you see the next SpaPlus market?",
      )}</h2><p>${escapeHtml(copy.entrepreneurBody)}</p></div>
      <a class="button button-light" href="/spaplus-global/${
        locale === "he" ? "he" : "en"
      }/country-partners/">${escapeHtml(copy.apply)}</a>
    </section>
  </main>
  <footer class="market-footer"><p>${escapeHtml(copy.legal)}</p></footer>
</body>
</html>`;
}

const marketCss = `
:root{--navy:#142b4b;--navy-deep:#0d1f37;--pink:#ed1764;--rose:#fff2f6;--cream:#fbf9f7;--ink:#172d4f;--muted:#667289;--line:#dce2e8;--white:#fff}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--cream);color:var(--ink);font-family:Inter,"Noto Sans","Noto Sans Hebrew",Arial,sans-serif;line-height:1.6}
a{color:inherit}
img{max-width:100%}
.skip-link{position:fixed;inset-block-start:8px;inset-inline-start:8px;z-index:50;transform:translateY(-140%);background:#fff;padding:10px 14px;border-radius:8px}.skip-link:focus{transform:none}
.market-header{min-height:82px;padding:14px clamp(20px,5vw,72px);display:flex;align-items:center;justify-content:space-between;gap:26px;background:rgba(255,255,255,.96);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:20;backdrop-filter:blur(16px)}
.market-brand{display:inline-flex;align-items:center;gap:10px;text-decoration:none}.market-brand img:first-child{width:45px;height:45px}.market-brand img:last-child{width:105px;height:auto}
.market-header nav{display:flex;align-items:center;gap:26px}.market-header nav a{text-decoration:none;font-weight:700;font-size:14px}
.market-header nav a:hover,.market-header nav a:focus-visible{color:var(--pink)}
.market-language{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:800}.market-language select{border:1px solid var(--line);border-radius:999px;background:#fff;padding:9px 30px 9px 12px;color:var(--ink)}
.market-hero{min-height:720px;position:relative;display:grid;align-items:end;background-image:var(--market-image);background-size:cover;background-position:center}
.market-hero-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,29,52,.88),rgba(10,29,52,.5) 46%,rgba(10,29,52,.1)),linear-gradient(0deg,rgba(10,29,52,.55),transparent 55%)}
.market-hero-copy{position:relative;z-index:1;max-width:770px;padding:clamp(56px,9vw,120px) clamp(24px,7vw,110px);color:#fff}
.market-status{display:inline-flex;align-items:center;gap:12px;background:rgba(255,255,255,.95);color:var(--navy);padding:8px 15px;border-radius:999px;font-weight:900;letter-spacing:.12em;font-size:12px}.market-status span{font-size:22px}
.eyebrow{color:var(--pink);font-size:12px;font-weight:900;letter-spacing:.17em;text-transform:uppercase;margin:0 0 14px}
.market-hero .eyebrow{color:#ff75a7;margin-top:28px}
h1,h2,h3,p{margin-top:0}
.market-hero h1{font-size:clamp(48px,7vw,96px);line-height:.96;letter-spacing:-.055em;margin-bottom:28px}
.market-hero-copy>p:last-of-type{font-size:clamp(18px,2vw,24px);max-width:680px;color:rgba(255,255,255,.9)}
.hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:32px}
.button{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:900;border:1px solid transparent;transition:.2s}
.button:hover{transform:translateY(-2px)}.button-primary{background:var(--pink);color:#fff}.button-glass{background:rgba(255,255,255,.11);color:#fff;border-color:rgba(255,255,255,.4)}.button-light{background:#fff;color:var(--navy)}
.section{padding:clamp(70px,9vw,130px) clamp(20px,6vw,92px)}
.section-heading{max-width:820px;margin:0 auto 48px;text-align:center}.section-heading h2,.entrepreneur-section h2,.spa-section h2,.hub-hero h1{font-size:clamp(38px,5vw,68px);line-height:1.02;letter-spacing:-.045em}.section-heading>p:last-child{font-size:18px;color:var(--muted)}
.market-preview{background:#fff}.marketplace-window{max-width:1240px;margin:auto;border:1px solid var(--line);border-radius:30px;overflow:hidden;background:#f4f7fb;box-shadow:0 30px 90px rgba(20,43,75,.14)}
.marketplace-topbar{padding:18px 24px;background:var(--navy);color:#fff;display:flex;justify-content:space-between;gap:20px;font-weight:800}.marketplace-topbar>span:last-child{color:#ff75a7;letter-spacing:.1em;font-size:12px}.mini-brand{font-size:19px}.mini-brand b{color:#ff75a7}
.search-mockup{display:grid;grid-template-columns:2fr 1fr .7fr auto;gap:10px;padding:22px;background:#fff;border-bottom:1px solid var(--line)}.search-mockup label{padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:#fff}.search-mockup label span{display:block;color:var(--muted);font-size:11px;font-weight:800}.search-mockup strong{font-size:14px}.search-mockup button{border:0;border-radius:14px;background:var(--pink);color:#fff;padding:12px 20px;font-weight:900;opacity:1}
.sample-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding:24px}.sample-card{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 12px 28px rgba(20,43,75,.09)}.sample-card-image{height:190px;background-size:cover;background-position:center}.sample-1{background-image:linear-gradient(0deg,rgba(11,30,54,.2),transparent),url('/spaplus-global/vision-resort.webp')}.sample-2{background-image:linear-gradient(0deg,rgba(11,30,54,.2),transparent),url('/spaplus-global/vision-ritual.webp')}.sample-3{background-image:linear-gradient(0deg,rgba(11,30,54,.2),transparent),url('/spaplus-global/vision-people.webp')}.sample-card-copy{padding:18px}.sample-card-copy span{color:var(--pink);font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.1em}.sample-card-copy h3{margin:7px 0 0;font-size:21px}.sample-card-copy p{color:var(--muted);margin-bottom:12px}.concept-notice{margin:0;padding:0 24px 24px;color:var(--muted);font-size:12px;text-align:center}
.marketplace-story{background:linear-gradient(135deg,#fff5f8,#f2f6fb)}.benefit-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:1180px;margin:auto}.benefit-grid article{background:#fff;border:1px solid rgba(20,43,75,.1);border-radius:22px;padding:30px}.benefit-grid article>span{font-size:12px;color:var(--pink);font-weight:900}.benefit-grid h3{font-size:24px;margin:30px 0 10px}.benefit-grid p{color:var(--muted)}
.entrepreneur-section{padding:clamp(70px,9vw,125px) clamp(20px,7vw,110px);background:var(--navy);color:#fff;display:grid;grid-template-columns:1.15fr .85fr;gap:clamp(38px,8vw,120px);align-items:center}.entrepreneur-section>div>p:last-child{color:rgba(255,255,255,.76);font-size:18px}.entrepreneur-panel{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:26px;padding:32px}.entrepreneur-panel ul{padding-inline-start:20px;margin:0 0 28px}.entrepreneur-panel li{margin:12px 0}.spa-section{display:flex;align-items:center;justify-content:space-between;gap:40px;background:#fff}.spa-section>div{max-width:760px}.spa-section>div>p:last-child{color:var(--muted);font-size:18px}
.market-footer{padding:38px clamp(20px,6vw,92px);background:#091a30;color:#fff;display:flex;justify-content:space-between;gap:30px;align-items:center}.market-footer>div{max-width:680px}.market-footer .market-brand{filter:brightness(0) invert(1);margin-bottom:16px}.market-footer p{margin:0;color:rgba(255,255,255,.68);font-size:13px}.market-footer nav{display:flex;gap:18px;flex-wrap:wrap}.market-footer nav a{color:#fff}
.share-market{position:fixed;right:20px;bottom:20px;z-index:15;border:0;border-radius:999px;background:var(--pink);color:#fff;padding:13px 18px;font-weight:900;box-shadow:0 12px 30px rgba(237,23,100,.32)}.share-toast{position:fixed;right:20px;bottom:78px;z-index:16;background:var(--navy);color:#fff;border-radius:10px;padding:10px 14px;opacity:0;transform:translateY(8px);pointer-events:none;transition:.2s}.share-toast.is-visible{opacity:1;transform:none}
.hub-page{background:linear-gradient(180deg,#fff5f8,#f4f7fb 55%,#fff)}.hub-hero{padding:clamp(80px,12vw,160px) clamp(20px,7vw,110px) 60px;max-width:1200px}.hub-hero>p:last-of-type{max-width:780px;color:var(--muted);font-size:20px}.live-markets{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.live-markets span{background:#fff;border:1px solid var(--line);padding:10px 15px;border-radius:999px;font-weight:800}.live-markets strong{color:#168263;font-size:12px;letter-spacing:.12em}.hub-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding-top:20px}.hub-card{text-decoration:none;background:#fff;border:1px solid var(--line);border-radius:24px;padding:26px;min-height:250px;position:relative;transition:.2s;box-shadow:0 12px 30px rgba(20,43,75,.06)}.hub-card:hover{transform:translateY(-5px);box-shadow:0 20px 45px rgba(20,43,75,.13)}.hub-flag{font-size:42px}.hub-status{position:absolute;top:26px;right:26px;color:var(--pink);font-size:10px;font-weight:900;letter-spacing:.12em}.hub-card h2{font-size:30px;margin:32px 0 4px}.hub-card p{color:var(--muted)}.hub-card strong{display:block;margin-top:30px;color:var(--pink)}
.funnel-page{background:#f6f7fa}.funnel-hero{min-height:590px;display:grid;align-items:end;background-image:linear-gradient(90deg,rgba(9,26,48,.94),rgba(9,26,48,.55)),var(--market-image);background-size:cover;background-position:center}.funnel-hero-copy{color:#fff;max-width:920px;padding:clamp(70px,10vw,135px) clamp(20px,7vw,110px)}.funnel-hero h1{font-size:clamp(48px,7vw,92px);line-height:.98;letter-spacing:-.055em;margin:24px 0}.funnel-hero-copy>p{font-size:clamp(18px,2vw,24px);color:rgba(255,255,255,.82);max-width:760px}.funnel-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-top:34px}.funnel-tabs a{padding:12px 17px;border:1px solid rgba(255,255,255,.38);border-radius:999px;color:#fff;text-decoration:none;font-weight:850}.funnel-tabs a.is-active{background:#fff;color:var(--navy)}.funnel-content{display:grid;grid-template-columns:.85fr 1.15fr;gap:clamp(36px,7vw,100px);align-items:start}.funnel-explainer{position:sticky;top:120px}.funnel-explainer h2,.funnel-form h2{font-size:clamp(34px,4vw,56px);line-height:1.03;letter-spacing:-.04em}.funnel-explainer>p,.funnel-form>div>p{color:var(--muted);font-size:17px}.funnel-explainer ul{padding-inline-start:22px;margin:28px 0}.funnel-explainer li{margin:14px 0}.text-link{color:var(--pink);font-weight:850}.funnel-form{display:grid;grid-template-columns:1fr 1fr;gap:18px;background:#fff;border:1px solid var(--line);border-radius:28px;padding:clamp(24px,4vw,48px);box-shadow:0 24px 70px rgba(20,43,75,.1)}.funnel-form>div,.field-wide{grid-column:1/-1}.funnel-form label{font-weight:800;font-size:13px}.funnel-form input,.funnel-form textarea{display:block;width:100%;margin-top:7px;border:1px solid #cfd6df;border-radius:13px;background:#fff;color:var(--ink);padding:13px 14px;font:inherit}.funnel-form input:focus,.funnel-form textarea:focus{outline:3px solid rgba(237,23,100,.17);border-color:var(--pink)}.funnel-form .consent{display:flex;gap:10px;align-items:flex-start;font-weight:500;color:var(--muted)}.funnel-form .consent input{width:18px;height:18px;margin:3px 0 0;flex:0 0 auto}.form-status{min-height:24px;margin:0;color:#11684f;font-weight:800}.funnel-form.is-sending{opacity:.72;pointer-events:none}
@media(max-width:900px){.market-header nav{display:none}.market-hero{min-height:650px}.market-hero-shade{background:linear-gradient(0deg,rgba(10,29,52,.9),rgba(10,29,52,.22))}.search-mockup{grid-template-columns:1fr 1fr}.search-mockup button{grid-column:1/-1}.sample-grid,.benefit-grid,.hub-grid{grid-template-columns:1fr 1fr}.entrepreneur-section{grid-template-columns:1fr}.spa-section,.market-footer{align-items:flex-start;flex-direction:column}}
@media(max-width:900px){.funnel-content{grid-template-columns:1fr}.funnel-explainer{position:static}}
@media(max-width:620px){.market-header{min-height:70px;padding:10px 16px}.market-brand img:first-child{width:38px;height:38px}.market-brand img:last-child{width:90px}.market-language>span{display:none}.market-hero{min-height:630px}.market-hero-copy{padding:70px 20px 42px}.market-hero h1{font-size:48px}.section{padding:70px 16px}.search-mockup,.sample-grid,.benefit-grid,.hub-grid{grid-template-columns:1fr}.sample-grid{padding:16px}.sample-card-image{height:170px}.entrepreneur-section{padding:70px 20px}.spa-section{padding:70px 20px}.market-footer{padding:34px 20px}.share-market{right:14px;bottom:14px}.hub-status{right:20px}.funnel-hero{min-height:540px}.funnel-hero-copy{padding:76px 18px 42px}.funnel-hero h1{font-size:47px}.funnel-form{grid-template-columns:1fr}.funnel-form label{grid-column:1/-1}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.button,.hub-card{transition:none}}
`;

const marketJs = `
const switcher = document.querySelector("[data-market-language]");
if (switcher) {
  switcher.addEventListener("change", (event) => {
    const root = location.hostname.endsWith("github.io") ? "/spaplus-global" : "";
    location.href = root + event.target.value;
  });
}
const shareButton = document.querySelector(".share-market");
const shareToast = document.querySelector(".share-toast");
if (shareButton) {
  shareButton.addEventListener("click", async () => {
    const shareUrl =
      document.querySelector('link[rel="canonical"]')?.href ||
      location.origin + location.pathname;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      if (error && error.name === "AbortError") return;
      const field = document.createElement("textarea");
      field.value = shareUrl;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    shareToast.textContent = "Link copied";
    shareToast.classList.add("is-visible");
    window.setTimeout(() => shareToast.classList.remove("is-visible"), 2200);
  });
}
const funnelForm = document.querySelector("[data-country-funnel]");
if (funnelForm) {
  const attributionKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "fbclid",
  ];
  const attributionParams = new URLSearchParams(location.search);
  const storedAttribution = JSON.parse(sessionStorage.getItem("spaplus_attribution") || "{}");
  attributionKeys.forEach((key) => {
    const value = attributionParams.get(key) || storedAttribution[key] || "";
    if (value) storedAttribution[key] = value;
    const field = funnelForm.elements.namedItem(key);
    if (field) field.value = value;
  });
  sessionStorage.setItem("spaplus_attribution", JSON.stringify(storedAttribution));
  funnelForm.elements.namedItem("referrer").value = document.referrer;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "spaplus_funnel_view",
    lead_type: funnelForm.elements.namedItem("leadType").value,
    market: funnelForm.elements.namedItem("market").value,
    locale: funnelForm.elements.namedItem("locale").value,
  });
  funnelForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = funnelForm.querySelector(".form-status");
    const submit = funnelForm.querySelector("button[type='submit']");
    const payload = Object.fromEntries(new FormData(funnelForm).entries());
    payload.subject = payload.leadType === "spa_business"
      ? "Spa business lead | " + payload.market
      : "Country entrepreneur lead | " + payload.market;
    funnelForm.classList.add("is-sending");
    submit.disabled = true;
    status.textContent = "Sending...";
    try {
      const response = await fetch("https://spaplus-global-brand.adir-naor-7510.chatgpt.site/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Primary endpoint failed");
      window.dataLayer.push({
        event: "generate_lead",
        lead_type: payload.leadType,
        market: payload.market,
        locale: payload.locale,
      });
      funnelForm.reset();
      status.textContent = funnelForm.dataset.success;
    } catch {
      status.textContent = "The message could not be sent. Please try again.";
    } finally {
      funnelForm.classList.remove("is-sending");
      submit.disabled = false;
    }
  });
}
`;

await mkdir(path.join(outputRoot, "markets"), { recursive: true });
await Promise.all([
  writeFile(path.join(outputRoot, "markets", "market.css"), marketCss, "utf8"),
  writeFile(path.join(outputRoot, "markets", "market.js"), marketJs, "utf8"),
]);

for (const market of markets) {
  const directory = path.join(outputRoot, market.locale, "markets", market.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), renderMarketPage(market), "utf8");

  const entrepreneurDirectory = path.join(outputRoot, market.locale, "partners", market.slug);
  await mkdir(entrepreneurDirectory, { recursive: true });
  await writeFile(
    path.join(entrepreneurDirectory, "index.html"),
    renderFunnelPage(market, "entrepreneur"),
    "utf8",
  );

  const spaDirectory = path.join(outputRoot, market.locale, "spas", "join");
  await mkdir(spaDirectory, { recursive: true });
  await writeFile(
    path.join(spaDirectory, "index.html"),
    renderFunnelPage(market, "spa"),
    "utf8",
  );
}

for (const locale of ["en", "he"]) {
  const directory = path.join(outputRoot, locale, "markets");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), renderMarketsHub(locale), "utf8");
}

console.log(
  `Generated ${markets.length} market pages, ${markets.length * 2} campaign funnels and 2 market hubs.`,
);
