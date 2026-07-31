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
    entrepreneurTitle: (market) => `האם אתם היזמים שיובילו את SpaPlus ב${market}?`,
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

const baseMarkets = [
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
    cities: ["Αθήνα", "Θεσσαλονίκη", "Κρήτη"],
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
    cities: ["Milano", "Roma", "Toscana"],
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
    cities: ["Berlin", "München", "Baden-Baden"],
    listings: ["Baden Wellness Haus", "Berlin Day Spa", "München Thermal Club"],
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
    cities: ["Stockholm", "Göteborg", "Malmö"],
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
    cities: ["Zürich", "Genf", "Luzern"],
    listings: ["Alpine Wellness House", "Zürich Day Retreat", "Genfersee Spa"],
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

const marketNames = {
  "united-states": {
    en: "United States",
    he: "ארצות הברית",
    enCities: ["Miami", "New York", "Los Angeles"],
    heCities: ["מיאמי", "ניו יורק", "לוס אנג׳לס"],
  },
  cyprus: {
    en: "Cyprus",
    he: "קפריסין",
    enCities: ["Limassol", "Paphos", "Nicosia"],
    heCities: ["לימסול", "פאפוס", "ניקוסיה"],
  },
  greece: {
    en: "Greece",
    he: "יוון",
    enCities: ["Athens", "Thessaloniki", "Crete"],
    heCities: ["אתונה", "סלוניקי", "כרתים"],
  },
  hungary: {
    en: "Hungary",
    he: "הונגריה",
    enCities: ["Budapest", "Hévíz", "Szeged"],
    heCities: ["בודפשט", "הוויז", "סגד"],
  },
  italy: {
    en: "Italy",
    he: "איטליה",
    enCities: ["Milan", "Rome", "Tuscany"],
    heCities: ["מילאנו", "רומא", "טוסקנה"],
  },
  "united-kingdom": {
    en: "United Kingdom",
    he: "בריטניה",
    enCities: ["London", "Bath", "Manchester"],
    heCities: ["לונדון", "באת׳", "מנצ׳סטר"],
  },
  germany: {
    en: "Germany",
    he: "גרמניה",
    enCities: ["Berlin", "Munich", "Baden-Baden"],
    heCities: ["ברלין", "מינכן", "באדן באדן"],
  },
  france: {
    en: "France",
    he: "צרפת",
    enCities: ["Paris", "Lyon", "Nice"],
    heCities: ["פריז", "ליון", "ניס"],
  },
  netherlands: {
    en: "Netherlands",
    he: "הולנד",
    enCities: ["Amsterdam", "Rotterdam", "Utrecht"],
    heCities: ["אמסטרדם", "רוטרדם", "אוטרכט"],
  },
  sweden: {
    en: "Sweden",
    he: "שוודיה",
    enCities: ["Stockholm", "Gothenburg", "Malmö"],
    heCities: ["סטוקהולם", "גטבורג", "מאלמו"],
  },
  norway: {
    en: "Norway",
    he: "נורווגיה",
    enCities: ["Oslo", "Bergen", "Tromsø"],
    heCities: ["אוסלו", "ברגן", "טרומסה"],
  },
  switzerland: {
    en: "Switzerland",
    he: "שווייץ",
    enCities: ["Zurich", "Geneva", "Lucerne"],
    heCities: ["ציריך", "ז׳נבה", "לוצרן"],
  },
  "united-arab-emirates": {
    en: "Dubai, United Arab Emirates",
    he: "דובאי, איחוד האמירויות",
    enCities: ["Dubai Marina", "Downtown Dubai", "Palm Jumeirah"],
    heCities: ["דובאי מרינה", "מרכז דובאי", "פאלם ג׳ומיירה"],
  },
};

const languageNames = {
  en: "English",
  he: "עברית",
  "en-US": "English",
  "en-GB": "English",
  "en-AE": "English",
  "el-CY": "Ελληνικά",
  "el-GR": "Ελληνικά",
  "hu-HU": "Magyar",
  "it-IT": "Italiano",
  "de-DE": "Deutsch",
  "de-CH": "Deutsch",
  "fr-FR": "Français",
  "nl-NL": "Nederlands",
  "sv-SE": "Svenska",
  "nb-NO": "Norsk",
};

const markets = [];
for (const slug of [...new Set(baseMarkets.map((market) => market.slug))]) {
  const variants = baseMarkets.filter((market) => market.slug === slug);
  markets.push(...variants);

  const source =
    variants.find((market) => market.lang.startsWith("en")) || variants[0];
  const names = marketNames[slug];

  if (!variants.some((market) => market.lang.startsWith("en"))) {
    markets.push({
      ...source,
      display: names.en,
      locale: "en",
      lang: "en",
      ui: "en",
      cities: names.enCities,
    });
  }

  markets.push({
    ...source,
    display: names.he,
    locale: "he",
    lang: "he",
    ui: "he",
    cities: names.heCities,
  });
}

const marketPath = (market) => `/${market.locale}/markets/${market.slug}/`;
const entrepreneurPath = (market) => `/${market.locale}/partners/${market.slug}/`;
const spaJoinPath = (market) =>
  market.locale === "en" || market.locale === "he"
    ? `/${market.locale}/spas/join/${market.slug}/`
    : `/${market.locale}/spas/join/`;
const productionOrigin = "https://global.spaplus.co";

function alternateLanguageLinks(market, routeForMarket) {
  const siblings = markets.filter((candidate) => candidate.slug === market.slug);
  if (siblings.length < 2) return "";
  const links = siblings
    .map(
      (candidate) =>
        `<link rel="alternate" hreflang="${candidate.lang}" href="${previewOrigin}${routeForMarket(candidate)}">`,
    )
    .join("\n  ");
  const fallback =
    siblings.find((candidate) => candidate.lang.startsWith("en")) || siblings[0];
  return `${links}\n  <link rel="alternate" hreflang="x-default" href="${previewOrigin}${routeForMarket(fallback)}">`;
}
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

function renderLanguageSwitcher(market, languageLabel, routeForMarket = marketPath) {
  const siblings = markets.filter((candidate) => candidate.slug === market.slug);
  if (siblings.length < 2) return "";
  return `
    <label class="market-language">
      <span>${escapeHtml(languageLabel)}</span>
      <select data-market-language>
        ${siblings
          .map(
            (candidate) =>
              `<option value="${routeForMarket(candidate)}"${
                candidate.locale === market.locale ? " selected" : ""
              }>${escapeHtml(languageNames[candidate.lang] || candidate.lang)}</option>`,
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

const hebrewFunnelCopy = {
  entrepreneur: {
    eyebrow: "שותפות במדינה",
    title: (market) => `להוביל את SpaPlus ב${market}`,
    lead:
      "לבנות את השוק המקומי עם מותג בינלאומי, ניסיון תפעולי מוכח והטכנולוגיה שכבר פועלת מאחורי SpaPlus.",
    tabPrimary: "ליזמים במדינה",
    tabSecondary: "לבתי ספא",
    whatTitle: "עסק מקומי עם בסיס גלובלי",
    whatBody:
      "אתם מובילים את הקשרים המקומיים, צירוף הספקים, השירות והפעילות המסחרית. SpaPlus מספקת את המותג, זירת החיפוש וההזמנות, הטכנולוגיה, המערכות והליווי להשקה.",
    points: [
      "לבנות קשרים עם בתי ספא ועסקי וולנס איכותיים",
      "לפתח ביקוש מקומי ולנהל את הפעילות השוטפת",
      "להשיק עם המערכות, הניסיון והליווי של SpaPlus",
    ],
    formTitle: "ספרו לנו למה אתם השותפים המתאימים למדינה",
    formLead: "הפנייה משויכת אוטומטית למדינה ולקמפיין שבחרתם.",
    submit: "שליחת פנייה לשותפות",
    success: "תודה. הפנייה לשותפות במדינה נשלחה בהצלחה.",
  },
  spa: {
    eyebrow: "לבתי ספא",
    title: (market) => `לצרף את בית הספא שלכם ל-SpaPlus ${market}`,
    lead:
      "הצטרפו לקבוצה הראשונה של בתי הספא המקומיים שמתכוננים לזירת SpaPlus במדינה.",
    tabPrimary: "לבתי ספא",
    tabSecondary: "ליזמים במדינה",
    whatTitle: "דרך חזקה יותר להגיע לאורחים חדשים",
    whatBody:
      "הציגו את החוויות, הטיפולים והחבילות בצורה ברורה, קבלו ביקוש איכותי והתכוננו להזמנות אונליין עם מערכת שנבנתה במיוחד לעולם הספא והוולנס.",
    points: [
      "להציג ספא יומי, טיפולים, חבילות, קבוצות וגיפט קארד",
      "להגיע לזוגות, יחידים וקבוצות שמחפשים יום טוב יותר",
      "להיבחן להצטרפות לרשת השותפים המקומית הראשונה",
    ],
    formTitle: "הציגו את בית הספא שלכם",
    formLead: "הפנייה משויכת אוטומטית למדינה ולקמפיין שבחרתם.",
    submit: "שליחת פרטי הספא",
    success: "תודה. פרטי בית הספא נשלחו בהצלחה.",
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

const campaignLocalizations = {
  "el-CY": {
    marketH1: "Η Κύπρος μπορεί να γίνει η επόμενη αγορά της SpaPlus.",
    marketLead: "Αναζητούμε τον κατάλληλο επιχειρηματία και επιλεγμένους χώρους spa και ευεξίας, για να χτίσουμε μια δυνατή τοπική παρουσία με τη διεθνή υποδομή της SpaPlus.",
    entrepreneurH1: "Αναπτύξτε τη SpaPlus στην Κύπρο.",
    entrepreneurLead: "Εσείς γνωρίζετε την κυπριακή αγορά, δημιουργείτε τις τοπικές συνεργασίες και αναλαμβάνετε την καθημερινή ανάπτυξη. Εμείς προσφέρουμε το brand, την τεχνολογία, τα συστήματα και την τεχνογνωσία.",
    spaH1: "Εντάξτε το spa σας στη SpaPlus Κύπρου.",
    spaLead: "Μπείτε από νωρίς στο δίκτυο που σχεδιάζουμε για να συνδέει ποιοτικές εμπειρίες spa με ντόπιους και επισκέπτες που αναζητούν μια καλύτερη μέρα.",
    entrepreneurCta: "Ενδιαφέρομαι για τη συνεργασία στην Κύπρο",
    spaCta: "Ενδιαφέρομαι για το spa μου",
    formTitle: "Πείτε μας για εσάς και την επιχείρησή σας",
    consent: "Συμφωνώ η SpaPlus να χρησιμοποιήσει τα στοιχεία που υποβάλλω για την αξιολόγηση του αιτήματός μου και την επικοινωνία μαζί μου.",
    labels: {
      name: "Ονοματεπώνυμο",
      email: "Email",
      phone: "Τηλέφωνο",
      entrepreneurCompany: "Εταιρεία ή επαγγελματική εμπειρία",
      spaCompany: "Όνομα spa ή επιχείρησης",
      entrepreneurWebsite: "LinkedIn ή ιστοσελίδα",
      spaWebsite: "Ιστοσελίδα ή προφίλ στα social media",
      message: "Πείτε μας περισσότερα",
    },
  },
  "el-GR": {
    marketH1: "Η Ελλάδα μπορεί να γίνει η επόμενη αγορά της SpaPlus.",
    marketLead: "Αναζητούμε έναν ισχυρό τοπικό συνεργάτη και ποιοτικούς χώρους spa και ευεξίας, ώστε να δημιουργήσουμε μια εμπειρία που ταιριάζει πραγματικά στην ελληνική αγορά.",
    entrepreneurH1: "Αναπτύξτε τη SpaPlus στην Ελλάδα.",
    entrepreneurLead: "Εσείς γνωρίζετε την αγορά, τους ανθρώπους και τις τοπικές επιχειρήσεις. Εμείς προσφέρουμε το brand, την τεχνολογία, τα συστήματα και την τεχνογνωσία για να χτίσουμε μαζί μια ισχυρή παρουσία.",
    spaH1: "Εντάξτε το spa σας στη SpaPlus.",
    spaLead: "Γίνετε μέρος ενός δικτύου που βοηθά περισσότερους ανθρώπους να ανακαλύπτουν και να επιλέγουν αξιόλογες εμπειρίες spa με σιγουριά.",
    entrepreneurCta: "Εκδήλωση ενδιαφέροντος για συνεργασία",
    spaCta: "Εκδήλωση ενδιαφέροντος για το spa μου",
    formTitle: "Πείτε μας για εσάς και την αγορά σας",
    consent: "Συμφωνώ η SpaPlus να χρησιμοποιήσει τα στοιχεία που υποβάλλω για την αξιολόγηση του αιτήματός μου και την επικοινωνία μαζί μου.",
    labels: {
      name: "Ονοματεπώνυμο",
      email: "Email",
      phone: "Τηλέφωνο",
      entrepreneurCompany: "Εταιρεία ή επαγγελματική εμπειρία",
      spaCompany: "Όνομα spa ή επιχείρησης",
      entrepreneurWebsite: "LinkedIn ή ιστοσελίδα",
      spaWebsite: "Ιστοσελίδα ή προφίλ στα social media",
      message: "Πείτε μας περισσότερα",
    },
  },
  "hu-HU": {
    marketH1: "Magyarország lehet a SpaPlus következő piaca.",
    marketLead: "Olyan erős helyi vállalkozót és minőségi spa- és wellnesspartnereket keresünk, akikkel a magyar piacra szabott, megbízható szolgáltatást építhetünk.",
    entrepreneurH1: "Vezesse a SpaPlus magyarországi bevezetését.",
    entrepreneurLead: "Ön hozza a helyi piacismeretet, az üzleti kapcsolatokat és az operatív vezetést. Mi adjuk a márkát, a technológiát, a rendszereket és a több mint húsz év alatt felhalmozott tudást.",
    spaH1: "Legyen spa vállalkozása a SpaPlus partnere.",
    spaLead: "Érjen el új vendégeket egy olyan hálózaton keresztül, amely egyszerűbbé és megbízhatóbbá teszi a spaélmények felfedezését és foglalását.",
    entrepreneurCta: "Jelentkezem országpartnernek",
    spaCta: "Érdekel a spa partnerség",
    formTitle: "Mutatkozzon be, és meséljen a piacáról",
    consent: "Hozzájárulok, hogy a SpaPlus a megadott adataimat a jelentkezésem értékelésére és a kapcsolatfelvételre használja.",
    labels: {
      name: "Teljes név",
      email: "E-mail",
      phone: "Telefonszám",
      entrepreneurCompany: "Vállalkozás vagy szakmai háttér",
      spaCompany: "A spa vagy vállalkozás neve",
      entrepreneurWebsite: "LinkedIn vagy weboldal",
      spaWebsite: "Weboldal vagy közösségi oldal",
      message: "Mutatkozzon be röviden",
    },
  },
  "de-DE": {
    marketH1: "Deutschland könnte der nächste SpaPlus-Markt werden.",
    marketLead: "Wir suchen eine unternehmerisch starke Partnerin oder einen Partner vor Ort sowie hochwertige Spa- und Wellnessbetriebe, um SpaPlus passend für den deutschen Markt aufzubauen.",
    entrepreneurH1: "Bauen Sie SpaPlus in Deutschland auf.",
    entrepreneurLead: "Sie kennen den Markt, gewinnen passende Spa-Partner und führen das lokale Geschäft. Wir bringen Marke, Technologie, Systeme und mehr als zwanzig Jahre Branchenerfahrung ein.",
    spaH1: "Werden Sie mit Ihrem Spa Teil von SpaPlus.",
    spaLead: "Erreichen Sie neue Gäste über eine Plattform, die hochwertige Spa-Erlebnisse leichter auffindbar, verständlich und buchbar macht.",
    entrepreneurCta: "Als Länderpartner bewerben",
    spaCta: "Interesse als Spa-Betrieb anmelden",
    formTitle: "Erzählen Sie uns von sich und Ihrem Markt",
    consent: "Ich bin damit einverstanden, dass SpaPlus meine Angaben zur Prüfung meiner Anfrage und zur Kontaktaufnahme verwendet.",
    labels: {
      name: "Vor- und Nachname",
      email: "E-Mail",
      phone: "Telefon",
      entrepreneurCompany: "Unternehmen oder beruflicher Hintergrund",
      spaCompany: "Name des Spa-Betriebs",
      entrepreneurWebsite: "LinkedIn oder Website",
      spaWebsite: "Website oder Social-Media-Profil",
      message: "Erzählen Sie uns mehr",
    },
  },
  "fr-FR": {
    marketH1: "Et si la France devenait le prochain marché SpaPlus ?",
    marketLead: "Nous recherchons une entrepreneuse ou un entrepreneur solidement implanté en France, ainsi que des établissements spa et bien-être de qualité, pour construire une offre réellement adaptée au marché français.",
    entrepreneurH1: "Développez SpaPlus en France.",
    entrepreneurLead: "Vous apportez votre connaissance du terrain, votre réseau et votre capacité à piloter l’activité locale. Nous apportons la marque, la technologie, les outils et plus de vingt ans d’expérience du secteur.",
    spaH1: "Rejoignez le futur réseau SpaPlus en France.",
    spaLead: "Faites découvrir votre établissement à de nouveaux clients grâce à une expérience pensée pour faciliter la recherche, le choix et la réservation d’un spa de qualité.",
    entrepreneurCta: "Proposer ma candidature",
    spaCta: "Préinscrire mon établissement",
    formTitle: "Parlez-nous de votre parcours et de votre marché",
    consent: "J’accepte que SpaPlus utilise les informations transmises afin d’étudier ma demande et de me recontacter.",
    labels: {
      name: "Nom et prénom",
      email: "E-mail",
      phone: "Téléphone",
      entrepreneurCompany: "Entreprise ou parcours professionnel",
      spaCompany: "Nom de l’établissement",
      entrepreneurWebsite: "LinkedIn ou site internet",
      spaWebsite: "Site internet ou réseaux sociaux",
      message: "Parlez-nous de votre projet",
    },
  },
  "nl-NL": {
    marketH1: "Nederland kan de volgende SpaPlus-markt worden.",
    marketLead: "We zoeken een ondernemende lokale partner en hoogwaardige spa- en wellnesslocaties om samen een aanbod te bouwen dat echt aansluit op de Nederlandse markt.",
    entrepreneurH1: "Bouw SpaPlus op in Nederland.",
    entrepreneurLead: "Jij kent de markt, bouwt het lokale netwerk op en leidt de dagelijkse groei. Wij leveren het merk, de technologie, de systemen en ruim twintig jaar ervaring in de spa-branche.",
    spaH1: "Laat jouw spa groeien met SpaPlus.",
    spaLead: "Bereik nieuwe gasten via een platform dat het ontdekken, vergelijken en boeken van kwalitatieve spa-ervaringen eenvoudiger maakt.",
    entrepreneurCta: "Meld je aan als landpartner",
    spaCta: "Meld je spa aan",
    formTitle: "Vertel ons over jezelf en jouw markt",
    consent: "Ik ga ermee akkoord dat SpaPlus mijn gegevens gebruikt om mijn aanvraag te beoordelen en contact met mij op te nemen.",
    labels: {
      name: "Volledige naam",
      email: "E-mail",
      phone: "Telefoonnummer",
      entrepreneurCompany: "Bedrijf of professionele achtergrond",
      spaCompany: "Naam van de spa of onderneming",
      entrepreneurWebsite: "LinkedIn of website",
      spaWebsite: "Website of socialmediaprofiel",
      message: "Vertel ons meer",
    },
  },
  "sv-SE": {
    marketH1: "Sverige kan bli nästa marknad för SpaPlus.",
    marketLead: "Vi söker en driven lokal partner och kvalitativa spa- och wellnessanläggningar för att tillsammans bygga ett erbjudande som passar den svenska marknaden.",
    entrepreneurH1: "Bygg SpaPlus i Sverige.",
    entrepreneurLead: "Du bidrar med lokal marknadskännedom, affärsrelationer och operativt ledarskap. Vi bidrar med varumärket, tekniken, systemen och mer än tjugo års erfarenhet av spa-branschen.",
    spaH1: "Låt ditt spa växa med SpaPlus.",
    spaLead: "Nå nya gäster genom en plattform som gör det enklare att upptäcka, välja och boka spa-upplevelser av hög kvalitet.",
    entrepreneurCta: "Anmäl intresse som landspartner",
    spaCta: "Anmäl mitt spa",
    formTitle: "Berätta om dig och din marknad",
    consent: "Jag godkänner att SpaPlus använder de uppgifter jag lämnar för att bedöma min förfrågan och kontakta mig.",
    labels: {
      name: "För- och efternamn",
      email: "E-post",
      phone: "Telefonnummer",
      entrepreneurCompany: "Företag eller yrkesbakgrund",
      spaCompany: "Namn på spa eller företag",
      entrepreneurWebsite: "LinkedIn eller webbplats",
      spaWebsite: "Webbplats eller sociala medier",
      message: "Berätta mer",
    },
  },
  "nb-NO": {
    marketH1: "Norge kan bli det neste markedet for SpaPlus.",
    marketLead: "Vi ser etter en sterk lokal samarbeidspartner og spa- og velværebedrifter av høy kvalitet for å bygge et tilbud som er tilpasset det norske markedet.",
    entrepreneurH1: "Bygg SpaPlus i Norge.",
    entrepreneurLead: "Du bidrar med lokalkunnskap, forretningsnettverk og operativ ledelse. Vi bidrar med merkevaren, teknologien, systemene og mer enn tjue års erfaring fra spa-bransjen.",
    spaH1: "La spaet ditt vokse med SpaPlus.",
    spaLead: "Nå ut til nye gjester gjennom en plattform som gjør det enklere å oppdage, velge og bestille spaopplevelser av høy kvalitet.",
    entrepreneurCta: "Meld interesse som landspartner",
    spaCta: "Meld interesse for spaet mitt",
    formTitle: "Fortell oss om deg og markedet ditt",
    consent: "Jeg samtykker til at SpaPlus bruker opplysningene jeg sender inn for å vurdere henvendelsen min og kontakte meg.",
    labels: {
      name: "Fullt navn",
      email: "E-post",
      phone: "Telefonnummer",
      entrepreneurCompany: "Bedrift eller yrkesbakgrunn",
      spaCompany: "Navn på spa eller bedrift",
      entrepreneurWebsite: "LinkedIn eller nettsted",
      spaWebsite: "Nettsted eller profil i sosiale medier",
      message: "Fortell oss mer",
    },
  },
  "de-CH": {
    marketH1: "Die Schweiz könnte der nächste SpaPlus-Markt werden.",
    marketLead: "Wir suchen eine unternehmerisch starke Partnerin oder einen Partner mit lokalem Netzwerk sowie hochwertige Spa- und Wellnessbetriebe, um SpaPlus passend für den mehrsprachigen Schweizer Markt aufzubauen.",
    entrepreneurH1: "Bauen Sie SpaPlus in der Schweiz auf.",
    entrepreneurLead: "Sie kennen die regionalen Besonderheiten, gewinnen passende Spa-Partner und führen das lokale Geschäft. Wir bringen Marke, Technologie, Systeme und mehr als zwanzig Jahre Branchenerfahrung ein.",
    spaH1: "Werden Sie mit Ihrem Spa Teil von SpaPlus.",
    spaLead: "Erreichen Sie neue Gäste über eine Plattform, die hochwertige Spa-Erlebnisse leichter auffindbar, verständlich und buchbar macht.",
    entrepreneurCta: "Interesse als Länderpartner anmelden",
    spaCta: "Spa-Betrieb vormerken",
    formTitle: "Erzählen Sie uns von sich und Ihrem Markt",
    consent: "Ich bin damit einverstanden, dass SpaPlus meine Angaben zur Prüfung meiner Anfrage und zur Kontaktaufnahme verwendet.",
    labels: {
      name: "Vor- und Nachname",
      email: "E-Mail",
      phone: "Telefon",
      entrepreneurCompany: "Unternehmen oder beruflicher Hintergrund",
      spaCompany: "Name des Spa-Betriebs",
      entrepreneurWebsite: "LinkedIn oder Website",
      spaWebsite: "Website oder Social-Media-Profil",
      message: "Erzählen Sie uns mehr",
    },
  },
};

const funnelLanguageUi = {
  "el-CY": {
    entrepreneur: {
      eyebrow: "ΣΥΝΕΡΓΑΣΙΑ ΧΩΡΑΣ",
      tabPrimary: "Για επιχειρηματίες",
      tabSecondary: "Για επιχειρήσεις spa",
      whatTitle: "Τοπική επιχείρηση με διεθνή υποδομή",
      whatBody: "Εσείς αναπτύσσετε τις τοπικές συνεργασίες, το δίκτυο και την καθημερινή λειτουργία. Η SpaPlus προσφέρει το brand, την πλατφόρμα κρατήσεων, τα συστήματα και την υποστήριξη για το λανσάρισμα.",
      points: ["Δημιουργήστε ένα επιλεγμένο δίκτυο επιχειρήσεων spa", "Αναπτύξτε την τοπική ζήτηση και την εμπορική δραστηριότητα", "Ξεκινήστε με έτοιμη τεχνολογία, εμπειρία και υποστήριξη"],
      formLead: "Η αίτησή σας συνδέεται αυτόματα με την αγορά της Κύπρου και την καμπάνια.",
      success: "Ευχαριστούμε. Η αίτησή σας για τη SpaPlus Κύπρου στάλθηκε με επιτυχία.",
    },
    spa: {
      eyebrow: "ΓΙΑ ΕΠΙΧΕΙΡΗΣΕΙΣ SPA",
      tabPrimary: "Για επιχειρήσεις spa",
      tabSecondary: "Για επιχειρηματίες",
      whatTitle: "Ένας νέος δρόμος προς περισσότερους επισκέπτες",
      whatBody: "Παρουσιάστε καθαρά τις εμπειρίες, τις θεραπείες και τα πακέτα σας και προετοιμαστείτε για online κρατήσεις μέσα από μια πλατφόρμα σχεδιασμένη για το spa και την ευεξία.",
      points: ["Προβάλετε day spa, θεραπείες, πακέτα, ομάδες και δωροκάρτες", "Προσεγγίστε ζευγάρια, μεμονωμένους επισκέπτες και ομάδες", "Μπείτε στη διαδικασία επιλογής του πρώτου τοπικού δικτύου"],
      formLead: "Η εκδήλωση ενδιαφέροντος συνδέεται αυτόματα με την αγορά της Κύπρου και την καμπάνια.",
      success: "Ευχαριστούμε. Τα στοιχεία του spa σας στάλθηκαν με επιτυχία.",
    },
  },
  "el-GR": null,
  "hu-HU": {
    entrepreneur: {
      eyebrow: "ORSZÁGOS PARTNERSÉG", tabPrimary: "Országpartnereknek", tabSecondary: "Spa vállalkozásoknak",
      whatTitle: "Helyi vállalkozás nemzetközi háttérrel",
      whatBody: "Ön építi a helyi kapcsolatokat, a partnerhálózatot és a napi működést. A SpaPlus biztosítja a márkát, a foglalási technológiát, az üzleti rendszereket és a bevezetés támogatását.",
      points: ["Építsen minőségi spa- és wellnesspartneri hálózatot", "Fejlessze a helyi keresletet és vezesse a napi működést", "Induljon kész technológiával, tapasztalattal és támogatással"],
      formLead: "Jelentkezését automatikusan a magyar piachoz és a kampányhoz kapcsoljuk.",
      success: "Köszönjük. Országpartneri jelentkezését sikeresen elküldtük.",
    },
    spa: {
      eyebrow: "SPA VÁLLALKOZÁSOKNAK", tabPrimary: "Spa vállalkozásoknak", tabSecondary: "Országpartnereknek",
      whatTitle: "Erősebb út az új vendégekhez",
      whatBody: "Mutassa be átláthatóan élményeit, kezeléseit és csomagjait, és készüljön fel az online foglalásokra egy kifejezetten spa- és wellnessvállalkozások számára készült platformon.",
      points: ["Mutassa be day spa ajánlatait, kezeléseit, csomagjait, csoportos programjait és ajándékkártyáit", "Érjen el párokat, egyéni vendégeket és csoportokat", "Kerüljön be az első ellenőrzött helyi partnerhálózat kiválasztásába"],
      formLead: "Érdeklődését automatikusan a magyar piachoz és a kampányhoz kapcsoljuk.",
      success: "Köszönjük. Spa vállalkozásának adatait sikeresen elküldtük.",
    },
  },
  "de-DE": {
    entrepreneur: {
      eyebrow: "LÄNDERPARTNERSCHAFT", tabPrimary: "Für Länderpartner", tabSecondary: "Für Spa-Betriebe",
      whatTitle: "Ein lokales Unternehmen mit globalem Fundament",
      whatBody: "Sie bauen Beziehungen, Partnernetzwerk und Tagesgeschäft vor Ort auf. SpaPlus stellt Marke, Marktplatz, Buchungstechnologie, Geschäftssysteme und Unterstützung für den Marktstart bereit.",
      points: ["Ein Netzwerk hochwertiger Spa- und Wellnessbetriebe aufbauen", "Lokale Nachfrage entwickeln und das Tagesgeschäft führen", "Mit erprobter Technologie, Erfahrung und Unterstützung starten"],
      formLead: "Ihre Anfrage wird automatisch dem deutschen Markt und der Kampagne zugeordnet.",
      success: "Vielen Dank. Ihre Bewerbung als Länderpartner wurde erfolgreich gesendet.",
    },
    spa: {
      eyebrow: "FÜR SPA-BETRIEBE", tabPrimary: "Für Spa-Betriebe", tabSecondary: "Für Länderpartner",
      whatTitle: "Ein stärkerer Weg zu neuen Gästen",
      whatBody: "Präsentieren Sie Erlebnisse, Anwendungen und Pakete klar und bereiten Sie Online-Buchungen mit einer Plattform vor, die speziell für Spa und Wellness entwickelt wird.",
      points: ["Day Spa, Anwendungen, Pakete, Gruppen und Gutscheine präsentieren", "Paare, Einzelgäste und Gruppen mit echtem Interesse erreichen", "Für das erste geprüfte lokale Partnernetzwerk berücksichtigt werden"],
      formLead: "Ihre Anfrage wird automatisch dem deutschen Markt und der Kampagne zugeordnet.",
      success: "Vielen Dank. Die Angaben zu Ihrem Spa wurden erfolgreich gesendet.",
    },
  },
  "de-CH": null,
  "fr-FR": {
    entrepreneur: {
      eyebrow: "PARTENARIAT NATIONAL", tabPrimary: "Pour les entrepreneurs", tabSecondary: "Pour les établissements spa",
      whatTitle: "Une entreprise locale portée par une base internationale",
      whatBody: "Vous développez les relations, le réseau de partenaires et l’activité au quotidien. SpaPlus fournit la marque, la plateforme, la technologie de réservation, les outils et l’accompagnement au lancement.",
      points: ["Constituer un réseau d’établissements spa et bien-être de qualité", "Développer la demande locale et piloter l’activité", "Lancer le marché avec une technologie, une expérience et un accompagnement déjà prêts"],
      formLead: "Votre demande est automatiquement rattachée au marché français et à la campagne.",
      success: "Merci. Votre candidature pour développer SpaPlus en France a bien été envoyée.",
    },
    spa: {
      eyebrow: "POUR LES ÉTABLISSEMENTS SPA", tabPrimary: "Pour les établissements spa", tabSecondary: "Pour les entrepreneurs",
      whatTitle: "Un nouveau levier pour toucher davantage de clients",
      whatBody: "Présentez clairement vos expériences, soins et forfaits, et préparez la réservation en ligne avec une plateforme conçue pour le spa et le bien-être.",
      points: ["Valoriser day spa, soins, forfaits, groupes et cartes cadeaux", "Toucher couples, clients individuels et groupes en recherche active", "Être étudié pour intégrer le premier réseau local d’établissements sélectionnés"],
      formLead: "Votre demande est automatiquement rattachée au marché français et à la campagne.",
      success: "Merci. Les informations de votre établissement ont bien été envoyées.",
    },
  },
  "nl-NL": {
    entrepreneur: {
      eyebrow: "LANDPARTNERSCHAP", tabPrimary: "Voor ondernemers", tabSecondary: "Voor spa-ondernemingen",
      whatTitle: "Een lokale onderneming met een internationaal fundament",
      whatBody: "Jij bouwt lokale relaties, het partnernetwerk en de dagelijkse operatie op. SpaPlus levert het merk, de marktplaats, boekingstechnologie, bedrijfssystemen en ondersteuning bij de lancering.",
      points: ["Bouw een netwerk van hoogwaardige spa- en wellnesslocaties", "Ontwikkel lokale vraag en leid de dagelijkse activiteiten", "Start met bewezen technologie, ervaring en ondersteuning"],
      formLead: "Je aanvraag wordt automatisch gekoppeld aan de Nederlandse markt en campagne.",
      success: "Bedankt. Je aanvraag als landpartner is succesvol verzonden.",
    },
    spa: {
      eyebrow: "VOOR SPA-ONDERNEMINGEN", tabPrimary: "Voor spa-ondernemingen", tabSecondary: "Voor ondernemers",
      whatTitle: "Een sterkere route naar nieuwe gasten",
      whatBody: "Presenteer je ervaringen, behandelingen en arrangementen helder en bereid online boekingen voor met een platform dat speciaal voor spa en wellness wordt ontwikkeld.",
      points: ["Presenteer day spa, behandelingen, arrangementen, groepen en cadeaubonnen", "Bereik stellen, individuele gasten en groepen die actief zoeken", "Kom in aanmerking voor het eerste gecontroleerde lokale partnernetwerk"],
      formLead: "Je aanvraag wordt automatisch gekoppeld aan de Nederlandse markt en campagne.",
      success: "Bedankt. De gegevens van je spa zijn succesvol verzonden.",
    },
  },
  "sv-SE": {
    entrepreneur: {
      eyebrow: "LANDSPARTNERSKAP", tabPrimary: "För entreprenörer", tabSecondary: "För spa-verksamheter",
      whatTitle: "Ett lokalt företag med en global grund",
      whatBody: "Du bygger lokala relationer, partnernätverket och den dagliga verksamheten. SpaPlus bidrar med varumärket, marknadsplatsen, bokningstekniken, affärssystemen och stöd inför lanseringen.",
      points: ["Bygg ett nätverk av kvalitetssäkrade spa- och wellnessverksamheter", "Utveckla lokal efterfrågan och led den dagliga verksamheten", "Starta med beprövad teknik, erfarenhet och stöd"],
      formLead: "Din ansökan kopplas automatiskt till den svenska marknaden och kampanjen.",
      success: "Tack. Din ansökan som landspartner har skickats.",
    },
    spa: {
      eyebrow: "FÖR SPA-VERKSAMHETER", tabPrimary: "För spa-verksamheter", tabSecondary: "För entreprenörer",
      whatTitle: "En starkare väg till nya gäster",
      whatBody: "Presentera upplevelser, behandlingar och paket tydligt och förbered onlinebokning med en plattform som utvecklas särskilt för spa och wellness.",
      points: ["Visa day spa, behandlingar, paket, grupper och presentkort", "Nå par, enskilda gäster och grupper som aktivt söker", "Bli aktuell för det första kvalitetssäkrade lokala partnernätverket"],
      formLead: "Din intresseanmälan kopplas automatiskt till den svenska marknaden och kampanjen.",
      success: "Tack. Uppgifterna om ditt spa har skickats.",
    },
  },
  "nb-NO": {
    entrepreneur: {
      eyebrow: "LANDPARTNERSKAP", tabPrimary: "For gründere", tabSecondary: "For spa-bedrifter",
      whatTitle: "En lokal virksomhet med et globalt fundament",
      whatBody: "Du bygger lokale relasjoner, partnernettverket og den daglige driften. SpaPlus leverer merkevaren, markedsplassen, bookingteknologien, forretningssystemene og støtte til lanseringen.",
      points: ["Bygg et nettverk av spa- og velværebedrifter med høy kvalitet", "Utvikle lokal etterspørsel og led den daglige driften", "Start med velprøvd teknologi, erfaring og støtte"],
      formLead: "Søknaden din knyttes automatisk til det norske markedet og kampanjen.",
      success: "Takk. Søknaden din som landspartner er sendt.",
    },
    spa: {
      eyebrow: "FOR SPA-BEDRIFTER", tabPrimary: "For spa-bedrifter", tabSecondary: "For gründere",
      whatTitle: "En sterkere vei til nye gjester",
      whatBody: "Presenter opplevelser, behandlinger og pakker tydelig, og forbered nettbestilling med en plattform som utvikles spesielt for spa og velvære.",
      points: ["Vis frem day spa, behandlinger, pakker, grupper og gavekort", "Nå par, enkeltgjester og grupper som aktivt søker", "Bli vurdert for det første kvalitetssikrede lokale partnernettverket"],
      formLead: "Interessen din knyttes automatisk til det norske markedet og kampanjen.",
      success: "Takk. Opplysningene om spaet ditt er sendt.",
    },
  },
};

funnelLanguageUi["el-GR"] = {
  entrepreneur: {
    ...funnelLanguageUi["el-CY"].entrepreneur,
    formLead: "Η αίτησή σας συνδέεται αυτόματα με την ελληνική αγορά και την καμπάνια.",
    success: "Ευχαριστούμε. Η αίτησή σας για τη SpaPlus Ελλάδα στάλθηκε με επιτυχία.",
  },
  spa: {
    ...funnelLanguageUi["el-CY"].spa,
    formLead: "Η εκδήλωση ενδιαφέροντος συνδέεται αυτόματα με την ελληνική αγορά και την καμπάνια.",
  },
};
funnelLanguageUi["de-CH"] = {
  entrepreneur: {
    ...funnelLanguageUi["de-DE"].entrepreneur,
    formLead: "Ihre Anfrage wird automatisch dem Schweizer Markt und der Kampagne zugeordnet.",
    success: "Vielen Dank. Ihre Bewerbung als Länderpartner für die Schweiz wurde erfolgreich gesendet.",
  },
  spa: {
    ...funnelLanguageUi["de-DE"].spa,
    formLead: "Ihre Anfrage wird automatisch dem Schweizer Markt und der Kampagne zugeordnet.",
  },
};

const funnelCommonUi = {
  he: { skip: "דילוג לתוכן", routes: "אפשרויות פנייה", choose: "בחירת סוג הפנייה", market: "תצוגת השוק", privacy: "מדיניות פרטיות" },
  "el-CY": { skip: "Μετάβαση στο περιεχόμενο", routes: "Επιλογές ενδιαφέροντος", choose: "Επιλέξτε τύπο ενδιαφέροντος", market: "Προεπισκόπηση αγοράς", privacy: "Πολιτική απορρήτου" },
  "el-GR": { skip: "Μετάβαση στο περιεχόμενο", routes: "Επιλογές ενδιαφέροντος", choose: "Επιλέξτε τύπο ενδιαφέροντος", market: "Προεπισκόπηση αγοράς", privacy: "Πολιτική απορρήτου" },
  "hu-HU": { skip: "Ugrás a tartalomhoz", routes: "Érdeklődési lehetőségek", choose: "Válasszon jelentkezési típust", market: "Piaci előnézet", privacy: "Adatvédelmi tájékoztató" },
  "it-IT": { skip: "Vai al contenuto", routes: "Percorsi di contatto", choose: "Scegli il tipo di richiesta", market: "Anteprima del mercato", privacy: "Privacy" },
  "de-DE": { skip: "Zum Inhalt springen", routes: "Kontaktmöglichkeiten", choose: "Art der Anfrage wählen", market: "Marktvorschau", privacy: "Datenschutz" },
  "de-CH": { skip: "Zum Inhalt springen", routes: "Kontaktmöglichkeiten", choose: "Art der Anfrage wählen", market: "Marktvorschau", privacy: "Datenschutz" },
  "fr-FR": { skip: "Aller au contenu", routes: "Parcours de contact", choose: "Choisissez votre demande", market: "Aperçu du marché", privacy: "Confidentialité" },
  "nl-NL": { skip: "Naar de inhoud", routes: "Contactroutes", choose: "Kies het type aanvraag", market: "Marktvoorbeeld", privacy: "Privacy" },
  "sv-SE": { skip: "Gå till innehållet", routes: "Kontaktalternativ", choose: "Välj typ av intresse", market: "Förhandsvisning av marknaden", privacy: "Integritet" },
  "nb-NO": { skip: "Gå til innholdet", routes: "Kontaktalternativer", choose: "Velg type henvendelse", market: "Forhåndsvisning av markedet", privacy: "Personvern" },
};

const spaQualificationUi = {
  he: {
    step: (current) => `שלב ${current} מתוך 2`,
    stepOne: "בית הספא ופרטי הקשר",
    stepTwo: "כמה פרטים על העסק",
    city: "עיר או אזור",
    role: "התפקיד שלכם",
    businessType: "סוג העסק",
    rooms: "חדרי טיפול",
    booking: "האם קיימת כיום הזמנה אונליין?",
    choose: "בחירת אפשרות",
    types: ["ספא במלון", "ספא יומי", "מרכז וולנס", "ספא רפואי או אסתטי", "אחר"],
    roomOptions: ["1 עד 3", "4 עד 7", "8 ומעלה"],
    bookingOptions: ["כן", "לא", "בתהליך הקמה"],
    authority: "אני מאשר שיש לי הרשאה למסור את הפרטים בשם בית הספא.",
    next: "המשך",
    back: "חזרה",
    successTitle: "בית הספא שלכם ברשימה",
    successBody: "תודה. קיבלנו את הפרטים והצוות האחראי על השוק יבדוק אותם לפני יצירת קשר.",
    close: "סגירה",
    sending: "שולחים...",
    error: "לא הצלחנו לשלוח את הטופס. נסו שוב.",
  },
  en: {
    step: (current) => `Step ${current} of 2`,
    stepOne: "Your spa and contact details",
    stepTwo: "A little about your business",
    city: "City or region",
    role: "Your role",
    businessType: "Type of business",
    rooms: "Treatment rooms",
    booking: "Do you currently offer online booking?",
    choose: "Select an option",
    types: ["Hotel spa", "Day spa", "Wellness centre", "Medical or aesthetic spa", "Other"],
    roomOptions: ["1 to 3", "4 to 7", "8 or more"],
    bookingOptions: ["Yes", "No", "In progress"],
    authority: "I confirm that I am authorised to provide these details on behalf of the spa.",
    next: "Continue",
    back: "Back",
    successTitle: "Your spa is on our list",
    successBody: "Thank you. We received your details and our market team will review them before getting in touch.",
    close: "Close",
    sending: "Sending...",
    error: "We could not send the form. Please try again.",
  },
  "el-CY": {
    step: (current) => `Βήμα ${current} από 2`,
    stepOne: "Το spa και τα στοιχεία επικοινωνίας",
    stepTwo: "Λίγα στοιχεία για την επιχείρησή σας",
    city: "Πόλη ή περιοχή", role: "Ο ρόλος σας", businessType: "Τύπος επιχείρησης", rooms: "Αίθουσες θεραπειών",
    booking: "Προσφέρετε σήμερα online κρατήσεις;", choose: "Επιλέξτε",
    types: ["Spa ξενοδοχείου", "Day spa", "Κέντρο ευεξίας", "Ιατρικό ή αισθητικό spa", "Άλλο"],
    roomOptions: ["1 έως 3", "4 έως 7", "8 ή περισσότερες"], bookingOptions: ["Ναι", "Όχι", "Σε εξέλιξη"],
    authority: "Επιβεβαιώνω ότι έχω εξουσιοδότηση να υποβάλω τα στοιχεία εκ μέρους του spa.",
    next: "Συνέχεια", back: "Πίσω", successTitle: "Το spa σας είναι στη λίστα μας",
    successBody: "Ευχαριστούμε. Λάβαμε τα στοιχεία σας και η ομάδα της αγοράς θα τα εξετάσει πριν επικοινωνήσει μαζί σας.",
    close: "Κλείσιμο", sending: "Αποστολή...", error: "Η φόρμα δεν στάλθηκε. Δοκιμάστε ξανά.",
  },
  "hu-HU": {
    step: (current) => `${current}. lépés a 2-ből`, stepOne: "A spa és kapcsolattartó adatai", stepTwo: "Néhány adat a vállalkozásról",
    city: "Város vagy régió", role: "Beosztás", businessType: "Vállalkozás típusa", rooms: "Kezelőhelyiségek száma",
    booking: "Van jelenleg online foglalás?", choose: "Válasszon",
    types: ["Szállodai spa", "Day spa", "Wellnessközpont", "Orvosi vagy esztétikai spa", "Egyéb"],
    roomOptions: ["1–3", "4–7", "8 vagy több"], bookingOptions: ["Igen", "Nem", "Bevezetés alatt"],
    authority: "Megerősítem, hogy jogosult vagyok a spa nevében megadni ezeket az adatokat.",
    next: "Tovább", back: "Vissza", successTitle: "Spa vállalkozása felkerült a listánkra",
    successBody: "Köszönjük. Megkaptuk az adatokat, és piaci csapatunk átnézi őket, mielőtt felvesszük Önnel a kapcsolatot.",
    close: "Bezárás", sending: "Küldés...", error: "Az űrlapot nem sikerült elküldeni. Próbálja újra.",
  },
  "it-IT": {
    step: (current) => `Passaggio ${current} di 2`, stepOne: "La spa e il referente", stepTwo: "Qualche informazione sull’attività",
    city: "Città o area", role: "Il tuo ruolo", businessType: "Tipo di struttura", rooms: "Cabine trattamenti",
    booking: "Offrite già la prenotazione online?", choose: "Seleziona",
    types: ["Spa in hotel", "Day spa", "Centro benessere", "Spa medicale o estetica", "Altro"],
    roomOptions: ["Da 1 a 3", "Da 4 a 7", "8 o più"], bookingOptions: ["Sì", "No", "In fase di attivazione"],
    authority: "Confermo di essere autorizzato a inviare questi dati per conto della spa.",
    next: "Continua", back: "Indietro", successTitle: "La tua spa è nella nostra lista",
    successBody: "Grazie. Abbiamo ricevuto i dati e il team dedicato al mercato li esaminerà prima di contattarti.",
    close: "Chiudi", sending: "Invio in corso...", error: "Non è stato possibile inviare il modulo. Riprova.",
  },
  "de-DE": {
    step: (current) => `Schritt ${current} von 2`, stepOne: "Ihr Spa und Ihre Kontaktdaten", stepTwo: "Ein paar Angaben zu Ihrem Betrieb",
    city: "Stadt oder Region", role: "Ihre Position", businessType: "Art des Betriebs", rooms: "Behandlungsräume",
    booking: "Bieten Sie bereits Online-Buchungen an?", choose: "Bitte auswählen",
    types: ["Hotel-Spa", "Day Spa", "Wellnesszentrum", "Medical oder Aesthetic Spa", "Sonstiges"],
    roomOptions: ["1 bis 3", "4 bis 7", "8 oder mehr"], bookingOptions: ["Ja", "Nein", "In Vorbereitung"],
    authority: "Ich bestätige, dass ich berechtigt bin, diese Angaben im Namen des Spa-Betriebs zu übermitteln.",
    next: "Weiter", back: "Zurück", successTitle: "Ihr Spa ist auf unserer Liste",
    successBody: "Vielen Dank. Wir haben Ihre Angaben erhalten. Unser Marktteam prüft sie und meldet sich anschließend bei Ihnen.",
    close: "Schließen", sending: "Wird gesendet...", error: "Das Formular konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
  },
  "fr-FR": {
    step: (current) => `Étape ${current} sur 2`, stepOne: "Votre spa et vos coordonnées", stepTwo: "Quelques informations sur votre établissement",
    city: "Ville ou région", role: "Votre fonction", businessType: "Type d’établissement", rooms: "Cabines de soins",
    booking: "Proposez-vous déjà la réservation en ligne ?", choose: "Sélectionnez",
    types: ["Spa hôtelier", "Day spa", "Centre de bien-être", "Spa médical ou esthétique", "Autre"],
    roomOptions: ["1 à 3", "4 à 7", "8 ou plus"], bookingOptions: ["Oui", "Non", "En cours de mise en place"],
    authority: "Je confirme être habilité à transmettre ces informations au nom de l’établissement.",
    next: "Continuer", back: "Retour", successTitle: "Votre spa est sur notre liste",
    successBody: "Merci. Nous avons bien reçu vos informations. Notre équipe marché va les étudier avant de vous contacter.",
    close: "Fermer", sending: "Envoi en cours...", error: "Le formulaire n’a pas pu être envoyé. Veuillez réessayer.",
  },
  "nl-NL": {
    step: (current) => `Stap ${current} van 2`, stepOne: "Je spa en contactgegevens", stepTwo: "Een paar gegevens over je onderneming",
    city: "Plaats of regio", role: "Je functie", businessType: "Type onderneming", rooms: "Behandelruimtes",
    booking: "Bieden jullie al online boeken aan?", choose: "Maak een keuze",
    types: ["Hotelspa", "Day spa", "Wellnesscentrum", "Medische of esthetische spa", "Anders"],
    roomOptions: ["1 tot 3", "4 tot 7", "8 of meer"], bookingOptions: ["Ja", "Nee", "In voorbereiding"],
    authority: "Ik bevestig dat ik bevoegd ben om deze gegevens namens de spa te verstrekken.",
    next: "Verder", back: "Terug", successTitle: "Je spa staat op onze lijst",
    successBody: "Bedankt. We hebben je gegevens ontvangen. Ons marktteam bekijkt ze voordat we contact opnemen.",
    close: "Sluiten", sending: "Versturen...", error: "Het formulier kon niet worden verzonden. Probeer het opnieuw.",
  },
  "sv-SE": {
    step: (current) => `Steg ${current} av 2`, stepOne: "Ditt spa och kontaktuppgifter", stepTwo: "Lite om verksamheten",
    city: "Ort eller region", role: "Din roll", businessType: "Typ av verksamhet", rooms: "Behandlingsrum",
    booking: "Erbjuder ni onlinebokning i dag?", choose: "Välj ett alternativ",
    types: ["Hotellspa", "Day spa", "Wellnesscenter", "Medicinskt eller estetiskt spa", "Annat"],
    roomOptions: ["1 till 3", "4 till 7", "8 eller fler"], bookingOptions: ["Ja", "Nej", "Under införande"],
    authority: "Jag bekräftar att jag har rätt att lämna dessa uppgifter för spa-verksamheten.",
    next: "Fortsätt", back: "Tillbaka", successTitle: "Ditt spa finns nu på vår lista",
    successBody: "Tack. Vi har tagit emot uppgifterna. Vårt marknadsteam går igenom dem innan vi kontaktar dig.",
    close: "Stäng", sending: "Skickar...", error: "Formuläret kunde inte skickas. Försök igen.",
  },
  "nb-NO": {
    step: (current) => `Trinn ${current} av 2`, stepOne: "Spaet og kontaktinformasjonen", stepTwo: "Litt om virksomheten",
    city: "Sted eller region", role: "Din rolle", businessType: "Type virksomhet", rooms: "Behandlingsrom",
    booking: "Tilbyr dere nettbestilling i dag?", choose: "Velg et alternativ",
    types: ["Hotellspa", "Day spa", "Velværesenter", "Medisinsk eller estetisk spa", "Annet"],
    roomOptions: ["1 til 3", "4 til 7", "8 eller flere"], bookingOptions: ["Ja", "Nei", "Under utvikling"],
    authority: "Jeg bekrefter at jeg har fullmakt til å sende inn disse opplysningene på vegne av spaet.",
    next: "Fortsett", back: "Tilbake", successTitle: "Spaet deres er på listen vår",
    successBody: "Takk. Vi har mottatt opplysningene. Markedsteamet vårt går gjennom dem før vi tar kontakt.",
    close: "Lukk", sending: "Sender...", error: "Skjemaet kunne ikke sendes. Prøv igjen.",
  },
};
spaQualificationUi["el-GR"] = spaQualificationUi["el-CY"];
spaQualificationUi["de-CH"] = spaQualificationUi["de-DE"];

const spaExperienceUi = {
  en: {
    heroCta: "Introduce your spa",
    trust: "Free exposure. No joining fee. No monthly fee.",
    valueEyebrow: "A practical growth channel",
    valueTitle: "More visibility, more control, no fixed cost",
    valueCards: [
      ["Free exposure", "Your presence on SpaPlus costs nothing. If there is no completed booking, there is no booking fee."],
      ["A premium profile", "We prepare your first profile from approved materials, at no cost. You review it before anything is published."],
      ["New guests", "Reach couples, solo guests and groups who are actively looking for a spa and wellness experience."],
      ["Flexible booking", "Approve requests by email, manage availability in SpaPlus, and prepare for future calendar integration."],
    ],
    previewEyebrow: "Illustrative concept",
    previewTitle: "A clear, premium way to present your spa",
    previewBody: "This preview shows the type of profile SpaPlus can prepare. It does not depict a real or active spa listing.",
    bookingEyebrow: "Bookings that fit your operation",
    bookingTitle: "Start simply. Connect more deeply when you are ready.",
    bookingCards: [
      ["Approve by email", "Receive a request by email and in the SpaPlus system, then approve it directly."],
      ["Manage live availability", "Keep availability in SpaPlus and eligible bookings can be confirmed immediately."],
      ["Connect your calendar later", "A future integration can check real availability and place bookings into your calendar."],
    ],
    paymentEyebrow: "Clear payment flow",
    paymentTitle: "The guest chooses how to pay",
    paymentCards: [
      ["Pay on arrival", "Your spa charges the guest when they arrive."],
      ["Pay now", "SpaPlus charges the guest securely at booking."],
      ["Monthly settlement", "A clear report shows bookings, charges, commission and the balance due in either direction."],
    ],
    localTerms: "Local commercial terms, cancellation rules and the applicable fee are presented clearly for approval before activation.",
    fitEyebrow: "Who we are looking for",
    fitTitle: "Established spa and wellness businesses",
    fitBody: "We are looking for active businesses with a permanent location, a professional team and a complete, consistent guest experience.",
    fitPoints: ["A fixed physical location", "A professional team and the required local licences or insurance", "Structured opening hours and the ability to honour confirmed bookings", "An active website or social presence"],
    processEyebrow: "What happens next",
    processTitle: "A personal review, not an automatic listing",
    processSteps: [
      ["1", "Send the initial details", "The short form gives us enough information to understand the business."],
      ["2", "We respond within 72 hours", "The local market team contacts you through your preferred channel."],
      ["3", "A short conversation", "We discuss fit, the local agreement, bookings and the information needed for the profile."],
      ["4", "You approve the profile", "SpaPlus prepares the initial profile from approved material and you review it before publication."],
    ],
    faqTitle: "Before you apply",
    faqs: [
      ["What does it cost to be visible?", "There is no joining fee, monthly fee or charge for exposure. A fee applies only to a completed booking under the local agreement."],
      ["Can we leave later?", "Yes. You can stop with notice, while honouring bookings that were already confirmed. The profile is then removed in an orderly way."],
      ["Who controls our content?", "SpaPlus may prepare and optimise content from materials you approve. You review the profile before it is published and can request updates."],
      ["How are cancellations handled?", "Each spa has a clear policy shown before purchase. It must meet SpaPlus minimum standards and local law."],
    ],
    contactMethod: "How should we contact you?",
    contactOptions: ["Email", "Phone", "WhatsApp"],
    branches: "Number of locations",
    branchOptions: ["1", "2 to 4", "5 or more"],
    facilities: "Facilities available",
    facilityOptions: ["Sauna", "Pool", "Hot tub", "Hammam", "Relaxation lounge"],
    bookingMethod: "Preferred way to handle bookings",
    bookingMethodOptions: ["Approve by email", "Manage availability in SpaPlus", "Interested in future calendar integration"],
    status: "Current operating status",
    statusOptions: ["Open and operating", "Opening soon", "Renovation or relaunch"],
    responseNote: "We review every enquiry personally and respond within 72 hours through your preferred channel.",
  },
  he: {
    heroCta: "הציגו את בית הספא שלכם",
    trust: "חשיפה ללא עלות. בלי דמי הצטרפות ובלי תשלום חודשי.",
    valueEyebrow: "ערוץ צמיחה מעשי",
    valueTitle: "יותר חשיפה ושליטה, בלי עלות קבועה",
    valueCards: [
      ["חשיפה ללא עלות", "הנוכחות ב-SpaPlus אינה כרוכה בתשלום. אם לא הושלמה הזמנה, אין עמלת הזמנה."],
      ["פרופיל ברמה גבוהה", "אנחנו מכינים את הפרופיל הראשוני מחומרים שאישרתם, ללא עלות. אתם עוברים עליו לפני הפרסום."],
      ["לקוחות חדשים", "הגיעו לזוגות, יחידים וקבוצות שמחפשים באופן פעיל חוויית ספא וולנס."],
      ["הזמנות בדרך שמתאימה לכם", "אשרו בקשות במייל, נהלו זמינות ב-SpaPlus ובהמשך תוכלו להתחבר ליומן שלכם."],
    ],
    previewEyebrow: "המחשה בלבד",
    previewTitle: "כך יכול להיראות הפרופיל של בית הספא שלכם",
    previewBody: "ההמחשה מציגה את סוג הפרופיל ש-SpaPlus יכולה להכין. היא אינה מציגה בית ספא אמיתי או עמוד פעיל.",
    bookingEyebrow: "הזמנות שמתאימות לאופן העבודה שלכם",
    bookingTitle: "מתחילים פשוט ומתחברים יותר כשזה נכון לעסק",
    bookingCards: [
      ["אישור במייל", "בקשת ההזמנה מגיעה במייל ובמערכת SpaPlus, ואפשר לאשר אותה ישירות."],
      ["ניהול זמינות ב-SpaPlus", "כאשר הזמינות מנוהלת במערכת, הזמנות מתאימות יכולות להתאשר מיד."],
      ["חיבור ליומן בהמשך", "בעתיד יהיה אפשר לבדוק זמינות אמיתית ולהכניס הזמנות ישירות ליומן שלכם."],
    ],
    paymentEyebrow: "תהליך תשלום ברור",
    paymentTitle: "הלקוח בוחר איך לשלם",
    paymentCards: [
      ["תשלום במקום", "בית הספא מחייב את הלקוח כשהוא מגיע."],
      ["תשלום בזמן ההזמנה", "SpaPlus מחייבת את הלקוח באופן מאובטח בזמן ההזמנה."],
      ["התחשבנות חודשית", "דוח מסודר מציג הזמנות, חיובים, עמלה והיתרה לתשלום לכל צד."],
    ],
    localTerms: "התנאים המסחריים המקומיים, מדיניות הביטול והעמלה יוצגו בצורה ברורה לאישור לפני הפעלת הפרופיל.",
    fitEyebrow: "את מי אנחנו מחפשים",
    fitTitle: "בתי ספא ועסקי וולנס פעילים ומקצועיים",
    fitBody: "אנחנו מחפשים עסקים עם מקום קבוע, צוות מקצועי וחוויית אירוח מלאה ועקבית. השירות אינו מיועד למטפל יחיד שמגיע לבתי לקוחות או עובד מקליניקה פרטית בלבד.",
    fitPoints: [
      "מיקום פיזי קבוע",
      "צוות מקצועי ורישיונות או ביטוחים שנדרשים במדינה",
      "שעות פעילות מסודרות ויכולת לכבד הזמנות שאושרו",
      "אתר פעיל או נוכחות עסקית ברשתות החברתיות",
    ],
    processEyebrow: "מה קורה אחרי ההרשמה",
    processTitle: "בדיקה אישית, לא פרסום אוטומטי",
    processSteps: [
      ["1", "שולחים פרטים ראשוניים", "הטופס הקצר נותן לנו מספיק מידע כדי להכיר את העסק."],
      ["2", "חוזרים בתוך 72 שעות", "הצוות שאחראי על המדינה ייצור קשר בדרך שבחרתם."],
      ["3", "מקיימים שיחה קצרה", "בודקים התאמה, תנאים מקומיים, דרך ניהול ההזמנות והמידע שנדרש לפרופיל."],
      ["4", "אתם מאשרים את הפרופיל", "SpaPlus מכינה פרופיל ראשוני מחומרים מאושרים ואתם בודקים אותו לפני הפרסום."],
    ],
    faqTitle: "לפני שנרשמים",
    faqs: [
      ["כמה עולה להופיע באתר?", "אין דמי הצטרפות, תשלום חודשי או עלות על החשיפה. עמלה חלה רק על הזמנה שהושלמה, בהתאם להסכם המקומי."],
      ["אפשר להפסיק בהמשך?", "כן. אפשר להפסיק בהודעה מראש, תוך כיבוד הזמנות שכבר אושרו. לאחר מכן הפרופיל יוסר בצורה מסודרת."],
      ["מי שולט בתוכן?", "SpaPlus יכולה להכין ולשפר את התוכן מחומרים שאישרתם. אתם עוברים על הפרופיל לפני הפרסום ויכולים לבקש עדכונים."],
      ["איך מטפלים בביטולים?", "לכל בית ספא תהיה מדיניות ברורה שתוצג לפני הרכישה ותעמוד בדרישות המינימום של SpaPlus ובחוק המקומי."],
    ],
    contactMethod: "איך נוח לכם שנחזור אליכם?",
    contactOptions: ["אימייל", "טלפון", "WhatsApp"],
    branches: "מספר סניפים",
    branchOptions: ["1", "2 עד 4", "5 ומעלה"],
    facilities: "מתקנים במקום",
    facilityOptions: ["סאונה", "בריכה", "ג'קוזי", "חמאם", "מתחם מנוחה"],
    bookingMethod: "איך תרצו לנהל הזמנות?",
    bookingMethodOptions: ["אישור במייל", "ניהול זמינות ב-SpaPlus", "מעוניינים בחיבור עתידי ליומן"],
    status: "מצב הפעילות כיום",
    statusOptions: ["פתוח ופעיל", "נפתח בקרוב", "בשיפוץ או בהשקה מחדש"],
    responseNote: "אנחנו בודקים כל פנייה באופן אישי וחוזרים בתוך 72 שעות בדרך שבחרתם.",
  },
  "el-CY": {
    heroCta: "Παρουσιάστε το spa σας", trust: "Δωρεάν προβολή. Χωρίς κόστος εγγραφής ή μηνιαία συνδρομή.",
    valueEyebrow: "Ένα πρακτικό κανάλι ανάπτυξης", valueTitle: "Περισσότερη προβολή και έλεγχος, χωρίς πάγιο κόστος",
    valueCards: [["Δωρεάν προβολή", "Η παρουσία σας στο SpaPlus δεν έχει κόστος. Χωρίς ολοκληρωμένη κράτηση, δεν υπάρχει χρέωση κράτησης."], ["Προσεγμένο προφίλ", "Ετοιμάζουμε δωρεάν το πρώτο προφίλ από εγκεκριμένο υλικό και το ελέγχετε πριν δημοσιευτεί."], ["Νέοι επισκέπτες", "Προσεγγίστε ζευγάρια, μεμονωμένους επισκέπτες και ομάδες που αναζητούν εμπειρία spa."], ["Ευέλικτες κρατήσεις", "Εγκρίνετε με email, διαχειριστείτε διαθεσιμότητα στο SpaPlus και προετοιμαστείτε για μελλοντική σύνδεση ημερολογίου."]],
    previewEyebrow: "Ενδεικτική απεικόνιση", previewTitle: "Ένας καθαρός και premium τρόπος παρουσίασης", previewBody: "Η απεικόνιση δείχνει τον τύπο προφίλ που μπορεί να ετοιμάσει το SpaPlus. Δεν αποτελεί πραγματική ή ενεργή καταχώριση.",
    bookingEyebrow: "Κρατήσεις που ταιριάζουν στη λειτουργία σας", bookingTitle: "Ξεκινήστε απλά και συνδεθείτε περισσότερο όταν είστε έτοιμοι",
    bookingCards: [["Έγκριση με email", "Λαμβάνετε το αίτημα με email και στο σύστημα και το εγκρίνετε άμεσα."], ["Ζωντανή διαθεσιμότητα", "Διαχειρίζεστε τη διαθεσιμότητα στο SpaPlus και οι κατάλληλες κρατήσεις επιβεβαιώνονται άμεσα."], ["Μελλοντική σύνδεση ημερολογίου", "Η μελλοντική διασύνδεση θα μπορεί να ελέγχει διαθεσιμότητα και να περνά κρατήσεις στο ημερολόγιό σας."]],
    paymentEyebrow: "Ξεκάθαρη ροή πληρωμών", paymentTitle: "Ο επισκέπτης επιλέγει πώς θα πληρώσει",
    paymentCards: [["Πληρωμή στον χώρο", "Το spa χρεώνει τον επισκέπτη κατά την άφιξη."], ["Πληρωμή τώρα", "Το SpaPlus χρεώνει με ασφάλεια κατά την κράτηση."], ["Μηνιαία εκκαθάριση", "Αναλυτική αναφορά δείχνει κρατήσεις, χρεώσεις, προμήθεια και το τελικό υπόλοιπο."]],
    localTerms: "Οι τοπικοί εμπορικοί όροι, η πολιτική ακύρωσης και η σχετική χρέωση παρουσιάζονται καθαρά για έγκριση πριν την ενεργοποίηση.",
    fitEyebrow: "Ποιους αναζητούμε", fitTitle: "Οργανωμένες επιχειρήσεις spa και ευεξίας", fitBody: "Αναζητούμε ενεργές επιχειρήσεις με μόνιμο χώρο, επαγγελματική ομάδα και ολοκληρωμένη, σταθερή εμπειρία επισκέπτη.",
    fitPoints: ["Μόνιμη φυσική τοποθεσία", "Επαγγελματική ομάδα και οι απαιτούμενες άδειες ή ασφαλίσεις", "Σταθερό ωράριο και δυνατότητα τήρησης επιβεβαιωμένων κρατήσεων", "Ενεργή ιστοσελίδα ή παρουσία στα κοινωνικά δίκτυα"],
    processEyebrow: "Τι ακολουθεί", processTitle: "Προσωπική αξιολόγηση, όχι αυτόματη καταχώριση",
    processSteps: [["1", "Στείλτε τα βασικά στοιχεία", "Η σύντομη φόρμα μάς βοηθά να κατανοήσουμε την επιχείρηση."], ["2", "Απαντάμε μέσα σε 72 ώρες", "Η τοπική ομάδα επικοινωνεί από το κανάλι που επιλέξατε."], ["3", "Σύντομη συζήτηση", "Συζητάμε την καταλληλότητα, τους τοπικούς όρους και τη λειτουργία των κρατήσεων."], ["4", "Εγκρίνετε το προφίλ", "Το SpaPlus ετοιμάζει το αρχικό προφίλ και το ελέγχετε πριν δημοσιευτεί."]],
    faqTitle: "Πριν εκδηλώσετε ενδιαφέρον", faqs: [["Τι κοστίζει η προβολή;", "Δεν υπάρχει κόστος εγγραφής, μηνιαία συνδρομή ή χρέωση προβολής. Χρέωση εφαρμόζεται μόνο σε ολοκληρωμένη κράτηση βάσει της τοπικής συμφωνίας."], ["Μπορούμε να αποχωρήσουμε;", "Ναι, με προειδοποίηση και με τήρηση των κρατήσεων που έχουν ήδη επιβεβαιωθεί."], ["Ποιος ελέγχει το περιεχόμενο;", "Το SpaPlus ετοιμάζει περιεχόμενο από υλικό που εγκρίνετε. Ελέγχετε το προφίλ πριν τη δημοσίευση."], ["Πώς λειτουργούν οι ακυρώσεις;", "Κάθε spa έχει σαφή πολιτική πριν την αγορά, σύμφωνα με τα ελάχιστα πρότυπα SpaPlus και την τοπική νομοθεσία."]],
    contactMethod: "Πώς προτιμάτε να επικοινωνήσουμε;", contactOptions: ["Email", "Τηλέφωνο", "WhatsApp"], branches: "Αριθμός τοποθεσιών", branchOptions: ["1", "2 έως 4", "5 ή περισσότερες"], facilities: "Διαθέσιμες εγκαταστάσεις", facilityOptions: ["Σάουνα", "Πισίνα", "Υδρομασάζ", "Χαμάμ", "Χώρος χαλάρωσης"], bookingMethod: "Προτιμώμενος τρόπος διαχείρισης κρατήσεων", bookingMethodOptions: ["Έγκριση με email", "Διαχείριση διαθεσιμότητας στο SpaPlus", "Ενδιαφέρον για μελλοντική σύνδεση ημερολογίου"], status: "Τρέχουσα κατάσταση λειτουργίας", statusOptions: ["Σε πλήρη λειτουργία", "Ανοίγει σύντομα", "Ανακαίνιση ή επαναλειτουργία"], responseNote: "Εξετάζουμε προσωπικά κάθε αίτημα και απαντάμε μέσα σε 72 ώρες από το κανάλι που επιλέξατε.",
  },
  "hu-HU": {
    heroCta: "Mutassa be spa vállalkozását", trust: "Ingyenes megjelenés. Nincs csatlakozási vagy havi díj.",
    valueEyebrow: "Gyakorlati növekedési csatorna", valueTitle: "Nagyobb láthatóság és több kontroll, fix költség nélkül",
    valueCards: [["Ingyenes megjelenés", "A SpaPlus megjelenés díjmentes. Teljesített foglalás nélkül nincs foglalási díj."], ["Prémium profil", "Az első profilt jóváhagyott anyagokból díjmentesen elkészítjük, és közzététel előtt Ön ellenőrzi."], ["Új vendégek", "Érjen el párokat, egyéni vendégeket és csoportokat, akik spa élményt keresnek."], ["Rugalmas foglalás", "Jóváhagyás emailben, elérhetőség kezelése a SpaPlusban, később naptárkapcsolat."]],
    previewEyebrow: "Szemléltető koncepció", previewTitle: "Átlátható és prémium megjelenés spa vállalkozásának", previewBody: "A minta a SpaPlus által elkészíthető profil jellegét mutatja. Nem valódi vagy aktív spa adatlap.",
    bookingEyebrow: "A működéséhez illő foglalások", bookingTitle: "Kezdje egyszerűen, és kapcsolódjon szorosabban, amikor készen áll",
    bookingCards: [["Jóváhagyás emailben", "A kérést emailben és a SpaPlus rendszerben kapja meg, majd közvetlenül jóváhagyhatja."], ["Valós elérhetőség", "A SpaPlusban kezelt elérhetőség alapján a megfelelő foglalások azonnal visszaigazolhatók."], ["Későbbi naptárkapcsolat", "A jövőbeli integráció ellenőrizheti az elérhetőséget és beírhatja a foglalást a naptárba."]],
    paymentEyebrow: "Átlátható fizetési folyamat", paymentTitle: "A vendég választja ki a fizetés módját", paymentCards: [["Fizetés érkezéskor", "A vendéget a spa terheli meg érkezéskor."], ["Fizetés most", "A vendéget a SpaPlus terheli meg biztonságosan foglaláskor."], ["Havi elszámolás", "A részletes riport mutatja a foglalásokat, díjakat, jutalékot és az egyenleget."]], localTerms: "A helyi üzleti feltételeket, lemondási szabályokat és díjakat aktiválás előtt egyértelműen bemutatjuk jóváhagyásra.",
    fitEyebrow: "Kit keresünk", fitTitle: "Stabil spa és wellness vállalkozásokat", fitBody: "Állandó helyszínnel, szakmai csapattal és következetes vendégélménnyel működő vállalkozásokat keresünk.", fitPoints: ["Állandó fizikai helyszín", "Szakmai csapat és a szükséges helyi engedélyek vagy biztosítás", "Rendezett nyitvatartás és a visszaigazolt foglalások teljesítése", "Aktív weboldal vagy közösségi jelenlét"],
    processEyebrow: "Mi történik ezután", processTitle: "Személyes értékelés, nem automatikus adatlap", processSteps: [["1", "Küldje el az alapadatokat", "A rövid űrlap elég ahhoz, hogy megismerjük a vállalkozást."], ["2", "72 órán belül válaszolunk", "A helyi csapat a választott csatornán jelentkezik."], ["3", "Rövid egyeztetés", "Átbeszéljük az együttműködést, a helyi feltételeket és a foglalásokat."], ["4", "Ön jóváhagyja a profilt", "A SpaPlus elkészíti a kezdő profilt, amelyet közzététel előtt ellenőrizhet."]],
    faqTitle: "Jelentkezés előtt", faqs: [["Mennyibe kerül a megjelenés?", "Nincs csatlakozási, havi vagy megjelenési díj. Díj csak teljesített foglalás után, a helyi megállapodás szerint van."], ["Később kiléphetünk?", "Igen, értesítéssel és a már visszaigazolt foglalások teljesítésével."], ["Ki kezeli a tartalmat?", "A SpaPlus jóváhagyott anyagokból készíti el a profilt, amelyet közzététel előtt Ön ellenőriz."], ["Hogyan működik a lemondás?", "Minden spa egyértelmű szabályzatot használ, amely megfelel a SpaPlus minimumainak és a helyi jognak."]],
    contactMethod: "Hogyan keressük?", contactOptions: ["Email", "Telefon", "WhatsApp"], branches: "Helyszínek száma", branchOptions: ["1", "2–4", "5 vagy több"], facilities: "Elérhető szolgáltatások", facilityOptions: ["Szauna", "Medence", "Pezsgőfürdő", "Hammam", "Pihenőtér"], bookingMethod: "Foglalások kívánt kezelése", bookingMethodOptions: ["Jóváhagyás emailben", "Elérhetőség kezelése a SpaPlusban", "Érdekel a későbbi naptárkapcsolat"], status: "Jelenlegi működési állapot", statusOptions: ["Nyitva és működik", "Hamarosan nyit", "Felújítás vagy újranyitás"], responseNote: "Minden jelentkezést személyesen nézünk át, és 72 órán belül válaszolunk a választott csatornán.",
  },
  "it-IT": {
    heroCta: "Presenta la tua spa", trust: "Visibilità gratuita. Nessun costo di ingresso o canone mensile.",
    valueEyebrow: "Un canale concreto di crescita", valueTitle: "Più visibilità e controllo, senza costi fissi",
    valueCards: [["Visibilità gratuita", "La presenza su SpaPlus è gratuita. Se non c’è una prenotazione completata, non c’è alcun costo di prenotazione."], ["Profilo premium", "Prepariamo gratuitamente il primo profilo con materiali approvati. Lo controlli prima della pubblicazione."], ["Nuovi ospiti", "Raggiungi coppie, persone e gruppi che stanno cercando un’esperienza spa."], ["Prenotazioni flessibili", "Approva via email, gestisci la disponibilità su SpaPlus e preparati a una futura integrazione del calendario."]],
    previewEyebrow: "Anteprima illustrativa", previewTitle: "Un modo chiaro e curato per presentare la tua spa", previewBody: "L’anteprima mostra il tipo di profilo che SpaPlus può preparare. Non rappresenta una struttura reale o una scheda attiva.",
    bookingEyebrow: "Prenotazioni adatte alla tua operatività", bookingTitle: "Inizia in modo semplice. Collegati di più quando sei pronto.",
    bookingCards: [["Approvazione via email", "Ricevi la richiesta via email e nel sistema SpaPlus, poi la approvi direttamente."], ["Disponibilità in tempo reale", "Gestisci la disponibilità su SpaPlus e le prenotazioni idonee possono essere confermate subito."], ["Calendario in futuro", "Una futura integrazione potrà verificare la disponibilità e inserire le prenotazioni nel tuo calendario."]],
    paymentEyebrow: "Pagamenti chiari", paymentTitle: "L’ospite sceglie come pagare", paymentCards: [["Pagamento in struttura", "La spa incassa dall’ospite all’arrivo."], ["Pagamento online", "SpaPlus incassa in modo sicuro al momento della prenotazione."], ["Riepilogo mensile", "Un report trasparente mostra prenotazioni, incassi, commissioni e saldo."]], localTerms: "Condizioni commerciali locali, regole di cancellazione e commissioni vengono presentate chiaramente per approvazione prima dell’attivazione.",
    fitEyebrow: "Chi cerchiamo", fitTitle: "Strutture spa e wellness organizzate", fitBody: "Cerchiamo attività operative con una sede stabile, un team professionale e un’esperienza ospite completa e coerente.", fitPoints: ["Una sede fisica stabile", "Un team professionale e le autorizzazioni o assicurazioni locali richieste", "Orari strutturati e capacità di rispettare le prenotazioni confermate", "Un sito o una presenza social attiva"],
    processEyebrow: "Cosa succede dopo", processTitle: "Valutazione personale, non inserimento automatico", processSteps: [["1", "Invia i dati iniziali", "Il modulo breve ci permette di capire la struttura."], ["2", "Rispondiamo entro 72 ore", "Il team locale ti contatta attraverso il canale scelto."], ["3", "Un breve confronto", "Parliamo di compatibilità, accordo locale, prenotazioni e profilo."], ["4", "Approvi il profilo", "SpaPlus prepara il profilo iniziale e tu lo controlli prima della pubblicazione."]],
    faqTitle: "Prima di candidarti", faqs: [["Quanto costa essere visibili?", "Nessun costo di ingresso, canone mensile o costo di visibilità. La commissione si applica solo a una prenotazione completata secondo l’accordo locale."], ["Possiamo interrompere?", "Sì, con preavviso e rispettando le prenotazioni già confermate."], ["Chi controlla i contenuti?", "SpaPlus prepara il profilo con materiali approvati. Lo controlli prima della pubblicazione e puoi chiedere aggiornamenti."], ["Come funzionano le cancellazioni?", "Ogni spa ha una politica chiara mostrata prima dell’acquisto, nel rispetto degli standard SpaPlus e della legge locale."]],
    contactMethod: "Come preferisci essere contattato?", contactOptions: ["Email", "Telefono", "WhatsApp"], branches: "Numero di sedi", branchOptions: ["1", "Da 2 a 4", "5 o più"], facilities: "Servizi disponibili", facilityOptions: ["Sauna", "Piscina", "Vasca idromassaggio", "Hammam", "Area relax"], bookingMethod: "Gestione preferita delle prenotazioni", bookingMethodOptions: ["Approvazione via email", "Gestione disponibilità su SpaPlus", "Interesse per una futura integrazione calendario"], status: "Stato attuale dell’attività", statusOptions: ["Aperta e operativa", "Prossima apertura", "Ristrutturazione o rilancio"], responseNote: "Esaminiamo ogni richiesta personalmente e rispondiamo entro 72 ore attraverso il canale scelto.",
  },
  "de-DE": {
    heroCta: "Spa vorstellen", trust: "Kostenlose Sichtbarkeit. Keine Aufnahmegebühr. Keine Monatsgebühr.",
    valueEyebrow: "Ein praktischer Wachstumskanal", valueTitle: "Mehr Sichtbarkeit und Kontrolle, ohne Fixkosten",
    valueCards: [["Kostenlose Sichtbarkeit", "Die Präsenz auf SpaPlus kostet nichts. Ohne abgeschlossene Buchung fällt keine Buchungsgebühr an."], ["Hochwertiges Profil", "Wir erstellen das erste Profil kostenlos aus freigegebenem Material. Sie prüfen es vor der Veröffentlichung."], ["Neue Gäste", "Erreichen Sie Paare, Einzelgäste und Gruppen, die aktiv nach einem Spa-Erlebnis suchen."], ["Flexible Buchung", "Anfragen per E-Mail bestätigen, Verfügbarkeit in SpaPlus verwalten und später den Kalender anbinden."]],
    previewEyebrow: "Illustratives Konzept", previewTitle: "Ihr Spa klar und hochwertig präsentiert", previewBody: "Die Vorschau zeigt die Art des Profils, das SpaPlus erstellen kann. Sie stellt keinen echten oder aktiven Spa-Eintrag dar.",
    bookingEyebrow: "Buchungen passend zu Ihrem Betrieb", bookingTitle: "Einfach starten und später stärker anbinden",
    bookingCards: [["Per E-Mail bestätigen", "Sie erhalten die Anfrage per E-Mail und im SpaPlus-System und können direkt bestätigen."], ["Verfügbarkeit verwalten", "Mit gepflegter Verfügbarkeit in SpaPlus können passende Buchungen sofort bestätigt werden."], ["Kalender später anbinden", "Eine künftige Integration kann Verfügbarkeit prüfen und Buchungen in Ihren Kalender eintragen."]],
    paymentEyebrow: "Klarer Zahlungsablauf", paymentTitle: "Der Gast wählt die Zahlungsart", paymentCards: [["Zahlung vor Ort", "Ihr Spa rechnet bei Ankunft mit dem Gast ab."], ["Sofort bezahlen", "SpaPlus belastet den Gast sicher bei der Buchung."], ["Monatliche Abrechnung", "Ein klarer Bericht zeigt Buchungen, Zahlungen, Provision und den offenen Saldo."]], localTerms: "Lokale Konditionen, Stornoregeln und Gebühren werden vor der Aktivierung transparent zur Freigabe vorgelegt.",
    fitEyebrow: "Wen wir suchen", fitTitle: "Etablierte Spa- und Wellnessbetriebe", fitBody: "Wir suchen aktive Betriebe mit festem Standort, professionellem Team und einem vollständigen, verlässlichen Gästeerlebnis.", fitPoints: ["Fester physischer Standort", "Professionelles Team sowie erforderliche lokale Genehmigungen oder Versicherungen", "Geregelte Öffnungszeiten und verlässliche Erfüllung bestätigter Buchungen", "Aktive Website oder Social-Media-Präsenz"],
    processEyebrow: "So geht es weiter", processTitle: "Persönliche Prüfung statt automatischer Freischaltung", processSteps: [["1", "Grunddaten senden", "Das kurze Formular reicht für einen ersten Eindruck vom Betrieb."], ["2", "Antwort innerhalb von 72 Stunden", "Das lokale Team meldet sich über Ihren bevorzugten Kanal."], ["3", "Kurzes Gespräch", "Wir besprechen Eignung, lokale Vereinbarung, Buchungen und Profilinformationen."], ["4", "Sie geben das Profil frei", "SpaPlus erstellt das erste Profil und Sie prüfen es vor der Veröffentlichung."]],
    faqTitle: "Vor Ihrer Anfrage", faqs: [["Was kostet die Sichtbarkeit?", "Keine Aufnahmegebühr, Monatsgebühr oder Gebühr für Sichtbarkeit. Eine Gebühr fällt nur bei abgeschlossener Buchung gemäß lokaler Vereinbarung an."], ["Können wir später aussteigen?", "Ja, mit Kündigungsfrist und unter Erfüllung bereits bestätigter Buchungen."], ["Wer kontrolliert die Inhalte?", "SpaPlus erstellt Inhalte aus freigegebenem Material. Sie prüfen das Profil vor der Veröffentlichung."], ["Wie funktionieren Stornierungen?", "Jeder Betrieb hat klare Regeln vor dem Kauf, im Einklang mit SpaPlus-Mindeststandards und lokalem Recht."]],
    contactMethod: "Wie dürfen wir Sie kontaktieren?", contactOptions: ["E-Mail", "Telefon", "WhatsApp"], branches: "Anzahl der Standorte", branchOptions: ["1", "2 bis 4", "5 oder mehr"], facilities: "Vorhandene Einrichtungen", facilityOptions: ["Sauna", "Pool", "Whirlpool", "Hammam", "Ruhebereich"], bookingMethod: "Bevorzugte Buchungsbearbeitung", bookingMethodOptions: ["Bestätigung per E-Mail", "Verfügbarkeit in SpaPlus verwalten", "Interesse an künftiger Kalenderanbindung"], status: "Aktueller Betriebsstatus", statusOptions: ["Geöffnet und in Betrieb", "Eröffnung in Kürze", "Umbau oder Neustart"], responseNote: "Wir prüfen jede Anfrage persönlich und antworten innerhalb von 72 Stunden über Ihren bevorzugten Kanal.",
  },
  "fr-FR": {
    heroCta: "Présenter votre spa", trust: "Visibilité gratuite. Aucun droit d’entrée ni abonnement mensuel.",
    valueEyebrow: "Un canal de croissance concret", valueTitle: "Plus de visibilité et de contrôle, sans coût fixe",
    valueCards: [["Visibilité gratuite", "Votre présence sur SpaPlus ne coûte rien. Sans réservation réalisée, aucun frais de réservation."], ["Profil premium", "Nous préparons gratuitement le premier profil à partir de contenus validés. Vous le relisez avant publication."], ["Nouveaux clients", "Touchez des couples, des personnes seules et des groupes qui recherchent activement une expérience spa."], ["Réservation souple", "Validez par email, gérez les disponibilités dans SpaPlus et préparez une future connexion au calendrier."]],
    previewEyebrow: "Aperçu illustratif", previewTitle: "Une présentation claire et haut de gamme de votre spa", previewBody: "Cet aperçu montre le type de profil que SpaPlus peut préparer. Il ne représente pas un établissement réel ni une fiche active.",
    bookingEyebrow: "Des réservations adaptées à votre organisation", bookingTitle: "Commencez simplement, puis connectez-vous davantage quand vous êtes prêt",
    bookingCards: [["Validation par email", "Recevez la demande par email et dans SpaPlus, puis validez-la directement."], ["Disponibilités en direct", "Gérez les disponibilités dans SpaPlus pour permettre la confirmation immédiate des réservations éligibles."], ["Connexion calendrier à venir", "Une future intégration pourra vérifier les disponibilités et inscrire les réservations dans votre calendrier."]],
    paymentEyebrow: "Paiements transparents", paymentTitle: "Le client choisit son mode de paiement", paymentCards: [["Paiement sur place", "Le spa encaisse le client à son arrivée."], ["Paiement en ligne", "SpaPlus encaisse le client de manière sécurisée lors de la réservation."], ["Règlement mensuel", "Un relevé clair détaille réservations, encaissements, commission et solde."]], localTerms: "Les conditions commerciales locales, les règles d’annulation et les frais applicables sont présentés clairement pour validation avant activation.",
    fitEyebrow: "Les établissements recherchés", fitTitle: "Des spas et centres de bien-être établis", fitBody: "Nous recherchons des établissements en activité, avec une adresse permanente, une équipe professionnelle et une expérience client complète et régulière.", fitPoints: ["Une adresse physique permanente", "Une équipe professionnelle et les autorisations ou assurances locales requises", "Des horaires structurés et la capacité d’honorer les réservations confirmées", "Un site ou une présence sociale active"],
    processEyebrow: "La suite", processTitle: "Une étude personnalisée, pas une mise en ligne automatique", processSteps: [["1", "Envoyez les informations initiales", "Le formulaire court nous permet de comprendre l’établissement."], ["2", "Réponse sous 72 heures", "L’équipe locale vous contacte par le canal choisi."], ["3", "Un échange rapide", "Nous parlons de l’adéquation, de l’accord local, des réservations et du profil."], ["4", "Vous validez le profil", "SpaPlus prépare le premier profil et vous le relisez avant publication."]],
    faqTitle: "Avant de candidater", faqs: [["Combien coûte la visibilité ?", "Aucun droit d’entrée, abonnement mensuel ou frais de visibilité. Une commission s’applique uniquement à une réservation réalisée selon l’accord local."], ["Peut-on arrêter plus tard ?", "Oui, avec préavis et en honorant les réservations déjà confirmées."], ["Qui contrôle les contenus ?", "SpaPlus prépare le profil à partir de contenus validés. Vous le relisez avant publication et pouvez demander des mises à jour."], ["Comment fonctionnent les annulations ?", "Chaque spa applique une politique claire avant l’achat, conforme aux standards SpaPlus et au droit local."]],
    contactMethod: "Comment souhaitez-vous être contacté ?", contactOptions: ["Email", "Téléphone", "WhatsApp"], branches: "Nombre d’établissements", branchOptions: ["1", "2 à 4", "5 ou plus"], facilities: "Équipements disponibles", facilityOptions: ["Sauna", "Piscine", "Jacuzzi", "Hammam", "Espace détente"], bookingMethod: "Gestion préférée des réservations", bookingMethodOptions: ["Validation par email", "Gestion des disponibilités dans SpaPlus", "Intérêt pour une future connexion calendrier"], status: "Situation actuelle", statusOptions: ["Ouvert et en activité", "Ouverture prochaine", "Rénovation ou relance"], responseNote: "Chaque demande est étudiée personnellement et nous répondons sous 72 heures par le canal choisi.",
  },
  "nl-NL": {
    heroCta: "Stel je spa voor", trust: "Gratis zichtbaarheid. Geen instapkosten of maandelijkse bijdrage.",
    valueEyebrow: "Een praktisch groeikanaal", valueTitle: "Meer zichtbaarheid en controle, zonder vaste kosten",
    valueCards: [["Gratis zichtbaarheid", "Je aanwezigheid op SpaPlus kost niets. Zonder afgeronde boeking betaal je geen boekingsvergoeding."], ["Premium profiel", "We maken het eerste profiel gratis met goedgekeurd materiaal. Je controleert het vóór publicatie."], ["Nieuwe gasten", "Bereik stellen, individuele gasten en groepen die actief een spa-ervaring zoeken."], ["Flexibel boeken", "Keur per e-mail goed, beheer beschikbaarheid in SpaPlus en bereid een toekomstige kalenderkoppeling voor."]],
    previewEyebrow: "Illustratief concept", previewTitle: "Een duidelijke, hoogwaardige presentatie van je spa", previewBody: "Deze preview laat zien welk type profiel SpaPlus kan maken. Het is geen echte of actieve spa-vermelding.",
    bookingEyebrow: "Boekingen die bij je werkwijze passen", bookingTitle: "Begin eenvoudig en koppel verder wanneer je eraan toe bent",
    bookingCards: [["Goedkeuren per e-mail", "Ontvang de aanvraag per e-mail en in SpaPlus en keur deze direct goed."], ["Live beschikbaarheid", "Beheer beschikbaarheid in SpaPlus zodat geschikte boekingen direct kunnen worden bevestigd."], ["Later je agenda koppelen", "Een toekomstige integratie kan beschikbaarheid controleren en boekingen in je agenda plaatsen."]],
    paymentEyebrow: "Duidelijke betalingen", paymentTitle: "De gast kiest hoe te betalen", paymentCards: [["Betalen bij aankomst", "Je spa rekent bij aankomst af met de gast."], ["Nu betalen", "SpaPlus rekent veilig af tijdens de boeking."], ["Maandelijkse afrekening", "Een helder overzicht toont boekingen, betalingen, commissie en het saldo."]], localTerms: "Lokale commerciële voorwaarden, annuleringsregels en kosten worden vóór activering duidelijk ter goedkeuring aangeboden.",
    fitEyebrow: "Wie we zoeken", fitTitle: "Gevestigde spa- en wellnessbedrijven", fitBody: "We zoeken actieve bedrijven met een vaste locatie, een professioneel team en een complete, consistente gastervaring.", fitPoints: ["Een vaste fysieke locatie", "Een professioneel team en vereiste lokale vergunningen of verzekeringen", "Vaste openingstijden en het nakomen van bevestigde boekingen", "Een actieve website of sociale aanwezigheid"],
    processEyebrow: "Wat gebeurt er daarna", processTitle: "Persoonlijke beoordeling, geen automatische plaatsing", processSteps: [["1", "Stuur de basisgegevens", "Het korte formulier geeft ons genoeg informatie over je bedrijf."], ["2", "Binnen 72 uur reactie", "Het lokale team neemt contact op via je voorkeurskanaal."], ["3", "Kort gesprek", "We bespreken de match, lokale afspraken, boekingen en het profiel."], ["4", "Jij keurt het profiel goed", "SpaPlus maakt het eerste profiel en jij controleert het vóór publicatie."]],
    faqTitle: "Voordat je je aanmeldt", faqs: [["Wat kost zichtbaarheid?", "Geen instapkosten, maandelijkse bijdrage of kosten voor zichtbaarheid. Alleen bij een afgeronde boeking geldt een vergoeding volgens de lokale overeenkomst."], ["Kunnen we later stoppen?", "Ja, met opzegtermijn en met nakoming van al bevestigde boekingen."], ["Wie beheert de inhoud?", "SpaPlus maakt het profiel met goedgekeurd materiaal. Jij controleert het vóór publicatie en kunt updates aanvragen."], ["Hoe werken annuleringen?", "Elke spa heeft een duidelijk beleid vóór aankoop, passend bij SpaPlus-minimumregels en lokale wetgeving."]],
    contactMethod: "Hoe mogen we contact opnemen?", contactOptions: ["E-mail", "Telefoon", "WhatsApp"], branches: "Aantal locaties", branchOptions: ["1", "2 tot 4", "5 of meer"], facilities: "Aanwezige faciliteiten", facilityOptions: ["Sauna", "Zwembad", "Jacuzzi", "Hammam", "Relaxruimte"], bookingMethod: "Gewenste boekingsafhandeling", bookingMethodOptions: ["Goedkeuren per e-mail", "Beschikbaarheid beheren in SpaPlus", "Interesse in toekomstige kalenderkoppeling"], status: "Huidige status", statusOptions: ["Open en actief", "Opent binnenkort", "Verbouwing of herstart"], responseNote: "We beoordelen elke aanvraag persoonlijk en reageren binnen 72 uur via je voorkeurskanaal.",
  },
  "sv-SE": {
    heroCta: "Presentera ert spa", trust: "Kostnadsfri synlighet. Ingen startavgift eller månadsavgift.",
    valueEyebrow: "En praktisk tillväxtkanal", valueTitle: "Mer synlighet och kontroll, utan fasta kostnader",
    valueCards: [["Kostnadsfri synlighet", "Närvaro på SpaPlus kostar inget. Utan genomförd bokning finns ingen bokningsavgift."], ["Premiumprofil", "Vi tar fram den första profilen kostnadsfritt från godkänt material. Ni granskar den före publicering."], ["Nya gäster", "Nå par, enskilda gäster och grupper som aktivt söker en spa-upplevelse."], ["Flexibel bokning", "Godkänn via e-post, hantera tillgänglighet i SpaPlus och förbered framtida kalenderkoppling."]],
    previewEyebrow: "Illustrativt koncept", previewTitle: "En tydlig och premium presentation av ert spa", previewBody: "Förhandsvisningen visar vilken typ av profil SpaPlus kan skapa. Den visar inte en verklig eller aktiv spa-listning.",
    bookingEyebrow: "Bokningar som passar er drift", bookingTitle: "Börja enkelt och koppla på mer när ni är redo", bookingCards: [["Godkänn via e-post", "Ta emot förfrågan via e-post och i SpaPlus och godkänn direkt."], ["Hantera tillgänglighet", "Med uppdaterad tillgänglighet i SpaPlus kan relevanta bokningar bekräftas direkt."], ["Kalenderkoppling senare", "En framtida integration kan kontrollera tillgänglighet och lägga in bokningen i kalendern."]],
    paymentEyebrow: "Tydligt betalningsflöde", paymentTitle: "Gästen väljer hur betalningen sker", paymentCards: [["Betala på plats", "Ert spa tar betalt av gästen vid ankomst."], ["Betala nu", "SpaPlus tar säkert betalt vid bokningen."], ["Månadsvis avräkning", "En tydlig rapport visar bokningar, betalningar, provision och saldo."]], localTerms: "Lokala affärsvillkor, avbokningsregler och avgifter presenteras tydligt för godkännande före aktivering.",
    fitEyebrow: "Vilka vi söker", fitTitle: "Etablerade spa- och wellnessverksamheter", fitBody: "Vi söker aktiva verksamheter med fast plats, professionellt team och en komplett, konsekvent gästupplevelse.", fitPoints: ["En fast fysisk plats", "Professionellt team och nödvändiga lokala tillstånd eller försäkringar", "Tydliga öppettider och förmåga att uppfylla bekräftade bokningar", "Aktiv webbplats eller närvaro i sociala medier"],
    processEyebrow: "Vad händer sedan", processTitle: "Personlig granskning, inte automatisk publicering", processSteps: [["1", "Skicka grunduppgifterna", "Det korta formuläret ger oss tillräcklig bild av verksamheten."], ["2", "Svar inom 72 timmar", "Det lokala teamet kontaktar er via vald kanal."], ["3", "Ett kort samtal", "Vi går igenom matchning, lokala villkor, bokningar och profilen."], ["4", "Ni godkänner profilen", "SpaPlus skapar den första profilen och ni granskar den före publicering."]],
    faqTitle: "Innan ni ansöker", faqs: [["Vad kostar synligheten?", "Ingen startavgift, månadsavgift eller kostnad för synlighet. Avgift gäller bara vid genomförd bokning enligt lokalt avtal."], ["Kan vi avsluta senare?", "Ja, med uppsägningstid och med ansvar för redan bekräftade bokningar."], ["Vem styr innehållet?", "SpaPlus skapar profilen från godkänt material. Ni granskar före publicering och kan begära uppdateringar."], ["Hur fungerar avbokningar?", "Varje spa har tydliga regler före köp, i linje med SpaPlus minimikrav och lokal lag."]],
    contactMethod: "Hur vill ni bli kontaktade?", contactOptions: ["E-post", "Telefon", "WhatsApp"], branches: "Antal anläggningar", branchOptions: ["1", "2 till 4", "5 eller fler"], facilities: "Tillgängliga faciliteter", facilityOptions: ["Bastu", "Pool", "Bubbelpool", "Hammam", "Relaxavdelning"], bookingMethod: "Önskad bokningshantering", bookingMethodOptions: ["Godkänn via e-post", "Hantera tillgänglighet i SpaPlus", "Intresse för framtida kalenderkoppling"], status: "Nuvarande driftstatus", statusOptions: ["Öppet och i drift", "Öppnar snart", "Renovering eller nylansering"], responseNote: "Vi granskar varje förfrågan personligen och svarar inom 72 timmar via vald kanal.",
  },
  "nb-NO": {
    heroCta: "Presenter spaet deres", trust: "Gratis synlighet. Ingen oppstartsavgift eller månedsavgift.",
    valueEyebrow: "En praktisk vekstkanal", valueTitle: "Mer synlighet og kontroll, uten faste kostnader",
    valueCards: [["Gratis synlighet", "Det koster ingenting å være synlig på SpaPlus. Uten fullført bestilling er det ingen bestillingsavgift."], ["Premiumprofil", "Vi lager den første profilen kostnadsfritt fra godkjent materiale. Dere gjennomgår den før publisering."], ["Nye gjester", "Nå par, enkeltgjester og grupper som aktivt ser etter en spa-opplevelse."], ["Fleksibel bestilling", "Godkjenn via e-post, administrer tilgjengelighet i SpaPlus og forbered fremtidig kalendertilkobling."]],
    previewEyebrow: "Illustrerende konsept", previewTitle: "En tydelig og profesjonell presentasjon av spaet", previewBody: "Forhåndsvisningen viser typen profil SpaPlus kan lage. Den viser ikke et ekte eller aktivt spa-tilbud.",
    bookingEyebrow: "Bestillinger som passer driften", bookingTitle: "Start enkelt og koble tettere på når dere er klare", bookingCards: [["Godkjenn via e-post", "Motta forespørselen via e-post og i SpaPlus og godkjenn direkte."], ["Administrer tilgjengelighet", "Med oppdatert tilgjengelighet i SpaPlus kan aktuelle bestillinger bekreftes umiddelbart."], ["Kalenderkobling senere", "En fremtidig integrasjon kan sjekke tilgjengelighet og legge bestillinger inn i kalenderen."]],
    paymentEyebrow: "Tydelig betalingsflyt", paymentTitle: "Gjesten velger betalingsmåte", paymentCards: [["Betal ved ankomst", "Spaet tar betalt av gjesten ved ankomst."], ["Betal nå", "SpaPlus tar sikkert betalt ved bestilling."], ["Månedlig oppgjør", "En tydelig rapport viser bestillinger, betalinger, provisjon og saldo."]], localTerms: "Lokale kommersielle vilkår, avbestillingsregler og gebyrer legges tydelig frem for godkjenning før aktivering.",
    fitEyebrow: "Hvem vi ser etter", fitTitle: "Etablerte spa- og velværebedrifter", fitBody: "Vi ser etter aktive bedrifter med fast sted, profesjonelt team og en komplett, stabil gjesteopplevelse.", fitPoints: ["Et fast fysisk sted", "Profesjonelt team og nødvendige lokale tillatelser eller forsikringer", "Faste åpningstider og evne til å oppfylle bekreftede bestillinger", "Aktiv nettside eller tilstedeværelse i sosiale medier"],
    processEyebrow: "Hva skjer videre", processTitle: "Personlig vurdering, ikke automatisk publisering", processSteps: [["1", "Send grunnopplysningene", "Det korte skjemaet gir oss nok informasjon om virksomheten."], ["2", "Svar innen 72 timer", "Det lokale teamet kontakter dere via valgt kanal."], ["3", "En kort samtale", "Vi går gjennom egnethet, lokale vilkår, bestillinger og profilen."], ["4", "Dere godkjenner profilen", "SpaPlus lager den første profilen og dere gjennomgår den før publisering."]],
    faqTitle: "Før dere søker", faqs: [["Hva koster synligheten?", "Ingen oppstartsavgift, månedsavgift eller kostnad for synlighet. Gebyr gjelder bare ved fullført bestilling etter lokal avtale."], ["Kan vi avslutte senere?", "Ja, med varsel og med ansvar for allerede bekreftede bestillinger."], ["Hvem styrer innholdet?", "SpaPlus lager profilen fra godkjent materiale. Dere gjennomgår den før publisering og kan be om oppdateringer."], ["Hvordan fungerer avbestilling?", "Hvert spa har tydelige regler før kjøp, i tråd med SpaPlus minstekrav og lokal lov."]],
    contactMethod: "Hvordan vil dere bli kontaktet?", contactOptions: ["E-post", "Telefon", "WhatsApp"], branches: "Antall steder", branchOptions: ["1", "2 til 4", "5 eller flere"], facilities: "Tilgjengelige fasiliteter", facilityOptions: ["Badstue", "Basseng", "Boblebad", "Hammam", "Avslapningsområde"], bookingMethod: "Foretrukket bestillingshåndtering", bookingMethodOptions: ["Godkjenn via e-post", "Administrer tilgjengelighet i SpaPlus", "Interesse for fremtidig kalenderkobling"], status: "Nåværende driftsstatus", statusOptions: ["Åpent og i drift", "Åpner snart", "Oppussing eller relansering"], responseNote: "Vi vurderer hver henvendelse personlig og svarer innen 72 timer via valgt kanal.",
  },
};
spaExperienceUi["el-GR"] = spaExperienceUi["el-CY"];
spaExperienceUi["de-CH"] = spaExperienceUi["de-DE"];

const marketPreviewUi = {
  "el-GR": {
    status: "ΣΥΝΤΟΜΑ", guestCta: "Δείτε πώς θα μπορούσε να είναι", previewLabel: "ΠΡΟΕΠΙΣΚΟΠΗΣΗ",
    previewTitle: (market) => `Μια πρώτη εικόνα της SpaPlus ${market}`,
    previewBody: "Τα ονόματα, οι τιμές και οι καταχωρίσεις είναι ενδεικτικά. Δείχνουν πώς θα μπορούσε να λειτουργεί η τοπική πλατφόρμα όταν ενταχθούν επιλεγμένοι συνεργάτες spa.",
    searchWhere: "Πού θέλετε να χαλαρώσετε;", searchWhen: "Επιλέξτε ημερομηνία", searchGuests: "Επισκέπτες", searchButton: "Βρείτε spa",
    sample: "Ενδεικτική καταχώριση", from: "Από", marketplaceEyebrow: "ΓΙΑ ΜΙΑ ΚΑΛΥΤΕΡΗ ΜΕΡΑ",
    marketplaceTitle: "Μια τοπική πλατφόρμα με διεθνή δύναμη",
    marketplaceBody: "Η SpaPlus συνδέει την αναζήτηση, την κράτηση και τα επαγγελματικά εργαλεία. Οι επισκέπτες επιλέγουν πιο εύκολα και οι επιχειρήσεις spa αποκτούν έναν ισχυρότερο δρόμο προς νέα ζήτηση.",
    benefits: [["Για τους επισκέπτες", "Day spa, hotel spa, εμπειρίες για ζευγάρια, ατομική χαλάρωση, ομάδες και δωροκάρτες σε ένα ξεκάθαρο περιβάλλον."], ["Για τις επιχειρήσεις spa", "Σωστή παρουσίαση, ποιοτική ζήτηση και τεχνολογία που εξοικονομεί χρόνο στην καθημερινή λειτουργία."], ["Για την ελληνική αγορά", "Τοπική γλώσσα, κουλτούρα και διαχείριση, με την υποστήριξη του brand, της τεχνολογίας και της εμπειρίας SpaPlus."]],
    conceptNotice: "Ενδεικτική προεπισκόπηση. Τα spa, οι τιμές και η διαθεσιμότητα που εμφανίζονται δεν αποτελούν ενεργές προσφορές.",
  },
  "hu-HU": {
    status: "HAMAROSAN", guestCta: "Nézze meg a jövő élményét", previewLabel: "KONCEPCIÓ ELŐNÉZET",
    previewTitle: (market) => `Első pillantás a SpaPlus ${market} oldalára`,
    previewBody: "A nevek, árak és ajánlatok szemléltető példák. Azt mutatják, milyen lehet a helyi piactér, amikor kiválasztott spa-partnerek csatlakoznak.",
    searchWhere: "Hol szeretne kikapcsolódni?", searchWhen: "Válasszon dátumot", searchGuests: "Vendégek", searchButton: "Spa keresése",
    sample: "Mintaajánlat", from: "Ettől", marketplaceEyebrow: "EGY JOBB NAPÉRT",
    marketplaceTitle: "Helyi piactér nemzetközi háttérrel",
    marketplaceBody: "A SpaPlus egyesíti a felfedezést, a foglalást és a megbízható üzleti eszközöket. A vendégek egyszerűbben választanak, a spa vállalkozások pedig új keresletet érnek el.",
    benefits: [["Vendégeknek", "Day spa, hotel spa, páros élmények, egyéni kikapcsolódás, csoportok és ajándékkártyák egy átlátható helyen."], ["Spa vállalkozásoknak", "Megfelelő bemutatkozás, minőségi érdeklődők és időt megtakarító technológia."], ["A magyar piacnak", "Helyi nyelv, kultúra és működés a SpaPlus márkájának, technológiájának és tudásának támogatásával."]],
    conceptNotice: "Szemléltető előnézet. A megjelenített spa-k, árak és szabad időpontok nem élő ajánlatok.",
  },
  "de-DE": {
    status: "BALD VERFÜGBAR", guestCta: "Vorschau ansehen", previewLabel: "KONZEPTVORSCHAU",
    previewTitle: (market) => `Ein erster Blick auf SpaPlus ${market}`,
    previewBody: "Namen, Preise und Angebote sind Beispiele. Sie zeigen, wie sich der lokale Marktplatz anfühlen könnte, sobald ausgewählte Spa-Partner teilnehmen.",
    searchWhere: "Wo möchten Sie entspannen?", searchWhen: "Datum wählen", searchGuests: "Gäste", searchButton: "Spa finden",
    sample: "Beispielangebot", from: "Ab", marketplaceEyebrow: "FÜR EINEN BESSEREN TAG",
    marketplaceTitle: "Ein lokaler Marktplatz mit globaler Stärke",
    marketplaceBody: "SpaPlus verbindet Inspiration, Buchung und verlässliche Geschäftslösungen. Gäste wählen einfacher. Spa-Betriebe erhalten einen stärkeren Zugang zu neuer Nachfrage.",
    benefits: [["Für Gäste", "Day Spa, Hotel Spa, Erlebnisse für Paare, Auszeiten allein, Gruppen und Gutscheine an einem übersichtlichen Ort."], ["Für Spa-Betriebe", "Das passende Erlebnis präsentieren, qualifizierte Nachfrage erhalten und im Hintergrund Zeit sparen."], ["Für den lokalen Markt", "Lokale Sprache, Kultur und Betreiber, unterstützt durch Marke, Technologie und Betriebserfahrung von SpaPlus."]],
    conceptNotice: "Konzeptvorschau. Die gezeigten Spa-Betriebe, Preise und Verfügbarkeiten sind keine aktiven Angebote.",
  },
  "de-CH": null,
  "fr-FR": {
    status: "BIENTÔT", guestCta: "Découvrir l’expérience à venir", previewLabel: "APERÇU DU CONCEPT",
    previewTitle: (market) => `Un premier aperçu de SpaPlus ${market}`,
    previewBody: "Les noms, tarifs et établissements sont présentés à titre d’exemple. Ils illustrent ce que pourrait devenir la plateforme locale avec des partenaires spa sélectionnés.",
    searchWhere: "Où souhaitez-vous vous détendre ?", searchWhen: "Choisir une date", searchGuests: "Personnes", searchButton: "Trouver un spa",
    sample: "Établissement fictif", from: "À partir de", marketplaceEyebrow: "POUR UNE MEILLEURE JOURNÉE",
    marketplaceTitle: "Une plateforme locale portée par une force internationale",
    marketplaceBody: "SpaPlus réunit découverte, réservation et outils professionnels fiables. Les clients choisissent plus simplement et les établissements accèdent à une nouvelle demande qualifiée.",
    benefits: [["Pour les clients", "Day spa, spa hôtelier, expériences en couple, parenthèses en solo, groupes et cartes cadeaux au même endroit."], ["Pour les établissements spa", "Présenter la bonne expérience, recevoir une demande qualifiée et gagner du temps au quotidien."], ["Pour le marché français", "Une langue, une culture et une exploitation locales, soutenues par la marque, la technologie et le savoir-faire SpaPlus."]],
    conceptNotice: "Aperçu illustratif. Les établissements, tarifs et disponibilités affichés ne constituent pas des offres actives.",
  },
  "nl-NL": {
    status: "BINNENKORT", guestCta: "Bekijk de toekomstige ervaring", previewLabel: "CONCEPTVOORBEELD",
    previewTitle: (market) => `Een eerste blik op SpaPlus ${market}`,
    previewBody: "Namen, prijzen en locaties zijn voorbeelden. Ze laten zien hoe de lokale marktplaats kan aanvoelen wanneer geselecteerde spa-partners aansluiten.",
    searchWhere: "Waar wil je ontspannen?", searchWhen: "Kies een datum", searchGuests: "Gasten", searchButton: "Vind een spa",
    sample: "Voorbeeldlocatie", from: "Vanaf", marketplaceEyebrow: "VOOR EEN BETERE DAG",
    marketplaceTitle: "Een lokale marktplaats met internationale kracht",
    marketplaceBody: "SpaPlus brengt ontdekken, boeken en betrouwbare bedrijfstools samen. Gasten kiezen eenvoudiger en spa-ondernemingen krijgen een sterkere route naar nieuwe vraag.",
    benefits: [["Voor gasten", "Day spa, hotelspa, ervaringen voor stellen, solo-ontspanning, groepen en cadeaubonnen op één duidelijke plek."], ["Voor spa-ondernemingen", "Presenteer de juiste ervaring, ontvang kwalitatieve vraag en bespaar tijd achter de schermen."], ["Voor de Nederlandse markt", "Lokale taal, cultuur en ondernemers, ondersteund door het merk, de technologie en de ervaring van SpaPlus."]],
    conceptNotice: "Conceptvoorbeeld. De getoonde spa’s, prijzen en beschikbaarheid zijn geen live aanbod.",
  },
  "sv-SE": {
    status: "KOMMER SNART", guestCta: "Se den framtida upplevelsen", previewLabel: "KONCEPTFÖRHANDSVISNING",
    previewTitle: (market) => `En första titt på SpaPlus ${market}`,
    previewBody: "Namn, priser och anläggningar är illustrativa exempel. De visar hur den lokala marknadsplatsen kan kännas när utvalda spa-partner ansluter.",
    searchWhere: "Var vill du koppla av?", searchWhen: "Välj datum", searchGuests: "Gäster", searchButton: "Hitta spa",
    sample: "Exempelanläggning", from: "Från", marketplaceEyebrow: "FÖR EN BÄTTRE DAG",
    marketplaceTitle: "En lokal marknadsplats med global styrka",
    marketplaceBody: "SpaPlus samlar inspiration, bokning och pålitliga affärsverktyg. Gäster väljer enklare och spa-verksamheter får en starkare väg till ny efterfrågan.",
    benefits: [["För gäster", "Day spa, hotellspa, upplevelser för par, egen avkoppling, grupper och presentkort på ett tydligt ställe."], ["För spa-verksamheter", "Presentera rätt upplevelse, ta emot kvalificerad efterfrågan och spara tid bakom kulisserna."], ["För den svenska marknaden", "Lokalt språk, kultur och drift med stöd av SpaPlus varumärke, teknik och branscherfarenhet."]],
    conceptNotice: "Konceptförhandsvisning. De spa, priser och tider som visas är inte aktiva erbjudanden.",
  },
  "nb-NO": {
    status: "KOMMER SNART", guestCta: "Se den fremtidige opplevelsen", previewLabel: "KONSEPTFORHÅNDSVISNING",
    previewTitle: (market) => `En første titt på SpaPlus ${market}`,
    previewBody: "Navn, priser og steder er illustrerende eksempler. De viser hvordan den lokale markedsplassen kan oppleves når utvalgte spa-partnere blir med.",
    searchWhere: "Hvor vil du slappe av?", searchWhen: "Velg dato", searchGuests: "Gjester", searchButton: "Finn spa",
    sample: "Eksempelsted", from: "Fra", marketplaceEyebrow: "FOR EN BEDRE DAG",
    marketplaceTitle: "En lokal markedsplass med global styrke",
    marketplaceBody: "SpaPlus samler inspirasjon, bestilling og pålitelige forretningsverktøy. Gjester velger enklere og spa-bedrifter får en sterkere vei til ny etterspørsel.",
    benefits: [["For gjester", "Day spa, hotellspa, opplevelser for par, egentid, grupper og gavekort på ett oversiktlig sted."], ["For spa-bedrifter", "Presenter riktig opplevelse, motta kvalifisert etterspørsel og spar tid bak kulissene."], ["For det norske markedet", "Lokalt språk, kultur og drift med støtte fra SpaPlus-merkevaren, teknologien og bransjeerfaringen."]],
    conceptNotice: "Konseptforhåndsvisning. Spa, priser og tilgjengelighet som vises er ikke aktive tilbud.",
  },
};
marketPreviewUi["de-CH"] = marketPreviewUi["de-DE"];

const marketAuxUi = {
  he: { legal: "מידע משפטי", privacy: "פרטיות", terms: "תנאים", accessibility: "נגישות", share: "שיתוף" },
  "el-CY": { legal: "Νομικές πληροφορίες", privacy: "Απόρρητο", terms: "Όροι", accessibility: "Προσβασιμότητα", share: "Κοινοποίηση" },
  "el-GR": { legal: "Νομικές πληροφορίες", privacy: "Απόρρητο", terms: "Όροι", accessibility: "Προσβασιμότητα", share: "Κοινοποίηση" },
  "hu-HU": { legal: "Jogi információk", privacy: "Adatvédelem", terms: "Feltételek", accessibility: "Akadálymentesség", share: "Megosztás" },
  "it-IT": { legal: "Informazioni legali", privacy: "Privacy", terms: "Condizioni", accessibility: "Accessibilità", share: "Condividi" },
  "de-DE": { legal: "Rechtliche Informationen", privacy: "Datenschutz", terms: "Bedingungen", accessibility: "Barrierefreiheit", share: "Teilen" },
  "de-CH": { legal: "Rechtliche Informationen", privacy: "Datenschutz", terms: "Bedingungen", accessibility: "Barrierefreiheit", share: "Teilen" },
  "fr-FR": { legal: "Informations juridiques", privacy: "Confidentialité", terms: "Conditions", accessibility: "Accessibilité", share: "Partager" },
  "nl-NL": { legal: "Juridische informatie", privacy: "Privacy", terms: "Voorwaarden", accessibility: "Toegankelijkheid", share: "Delen" },
  "sv-SE": { legal: "Juridisk information", privacy: "Integritet", terms: "Villkor", accessibility: "Tillgänglighet", share: "Dela" },
  "nb-NO": { legal: "Juridisk informasjon", privacy: "Personvern", terms: "Vilkår", accessibility: "Tilgjengelighet", share: "Del" },
};
const sampleDayByLanguage = {
  he: "שבת",
  "el-CY": "Σάββατο",
  "el-GR": "Σάββατο",
  "hu-HU": "Szombat",
  "it-IT": "Sabato",
  "de-DE": "Samstag",
  "de-CH": "Samstag",
  "fr-FR": "Samedi",
  "nl-NL": "Zaterdag",
  "sv-SE": "Lördag",
  "nb-NO": "Lørdag",
};

const footerComingSoonLabels = {
  en: "Coming Soon",
  he: "בקרוב",
  el: "Σύντομα",
  hu: "Hamarosan",
  it: "Prossimamente",
  de: "Demnächst",
  fr: "Bientôt",
  nl: "Binnenkort",
  sv: "Kommer snart",
  nb: "Kommer snart",
};

const footerMarketNames = {
  "united-arab-emirates": "Dubai and the UAE",
};

function renderFooterMarkets(context = { lang: "en" }) {
  const languageCode = String(context.lang || "en").split("-")[0];
  const uniqueSlugs = [...new Set(markets.map((market) => market.slug))];
  const links = uniqueSlugs
    .map((slug) => {
      const siblings = markets.filter((market) => market.slug === slug);
      const target =
        siblings.find((market) => market.lang === context.lang) ||
        siblings.find((market) => market.lang === languageCode) ||
        siblings.find((market) => market.lang.startsWith(`${languageCode}-`)) ||
        siblings.find((market) => market.lang.startsWith("en")) ||
        siblings[0];
      const label =
        languageCode === "en" && footerMarketNames[slug]
          ? footerMarketNames[slug]
          : target.display;
      return `<a href="/spaplus-global${marketPath(target)}">${escapeHtml(label)}</a>`;
    })
    .join("");
  return `<div class="market-footer-markets">
    <h2>${escapeHtml(footerComingSoonLabels[languageCode] || footerComingSoonLabels.en)}</h2>
    <nav aria-label="${escapeHtml(footerComingSoonLabels[languageCode] || footerComingSoonLabels.en)}">${links}</nav>
  </div>`;
}

function renderSpaExperienceSections(market, spaCopy) {
  const cards = (items, className = "spa-info-card") =>
    items
      .map(
        ([title, body]) =>
          `<article class="${className}"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></article>`,
      )
      .join("");
  return `<section class="spa-value section">
      <div class="section-heading">
        <p class="eyebrow">${escapeHtml(spaCopy.valueEyebrow)}</p>
        <h2>${escapeHtml(spaCopy.valueTitle)}</h2>
      </div>
      <div class="spa-card-grid">${cards(spaCopy.valueCards)}</div>
    </section>
    <section class="spa-profile-preview section" aria-labelledby="spa-preview-title">
      <div class="spa-profile-copy">
        <p class="eyebrow">${escapeHtml(spaCopy.previewEyebrow)}</p>
        <h2 id="spa-preview-title">${escapeHtml(spaCopy.previewTitle)}</h2>
        <p>${escapeHtml(spaCopy.previewBody)}</p>
      </div>
      <div class="spa-profile-mockup" role="img" aria-label="${escapeHtml(spaCopy.previewBody)}">
        <div class="mockup-cover" style="--market-image:url('/spaplus-global/${market.image}')">
          <span>${escapeHtml(spaCopy.previewEyebrow)}</span>
        </div>
        <div class="mockup-body">
          <div class="mockup-brand"><span>${market.flag}</span><strong>SpaPlus ${escapeHtml(market.display)}</strong></div>
          <div class="mockup-lines"><i></i><i></i><i></i></div>
          <div class="mockup-actions"><span></span><b></b></div>
        </div>
      </div>
    </section>
    <section class="spa-operating section">
      <div class="section-heading">
        <p class="eyebrow">${escapeHtml(spaCopy.bookingEyebrow)}</p>
        <h2>${escapeHtml(spaCopy.bookingTitle)}</h2>
      </div>
      <div class="spa-card-grid spa-card-grid-three">${cards(spaCopy.bookingCards, "spa-flow-card")}</div>
    </section>
    <section class="spa-payments section">
      <div class="section-heading">
        <p class="eyebrow">${escapeHtml(spaCopy.paymentEyebrow)}</p>
        <h2>${escapeHtml(spaCopy.paymentTitle)}</h2>
      </div>
      <div class="spa-card-grid spa-card-grid-three">${cards(spaCopy.paymentCards, "spa-payment-card")}</div>
      <p class="local-terms-note">${escapeHtml(spaCopy.localTerms)}</p>
    </section>
    <section class="spa-fit section">
      <div>
        <p class="eyebrow">${escapeHtml(spaCopy.fitEyebrow)}</p>
        <h2>${escapeHtml(spaCopy.fitTitle)}</h2>
        <p>${escapeHtml(spaCopy.fitBody)}</p>
      </div>
      <ul>${spaCopy.fitPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
    </section>
    <section class="spa-process section">
      <div class="section-heading">
        <p class="eyebrow">${escapeHtml(spaCopy.processEyebrow)}</p>
        <h2>${escapeHtml(spaCopy.processTitle)}</h2>
      </div>
      <div class="spa-process-grid">
        ${spaCopy.processSteps
          .map(
            ([number, title, body]) =>
              `<article><span>${escapeHtml(number)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></article>`,
          )
          .join("")}
      </div>
    </section>
    <section class="spa-faq section">
      <div class="section-heading"><h2>${escapeHtml(spaCopy.faqTitle)}</h2></div>
      <div class="spa-faq-list">
        ${spaCopy.faqs
          .map(
            ([question, answer]) =>
              `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`,
          )
          .join("")}
      </div>
    </section>`;
}

function renderFunnelPage(market, type) {
  const baseCopy =
    market.lang === "he"
      ? hebrewFunnelCopy[type]
      : market.slug === "italy" && market.lang === "it-IT"
        ? italyFunnelCopy[type]
        : funnelCopy[type];
  const localized = campaignLocalizations[market.lang];
  const localizedUi = funnelLanguageUi[market.lang]?.[type];
  const commonUi = funnelCommonUi[market.lang] || {
    skip: "Skip to content",
    routes: "Campaign routes",
    choose: "Choose enquiry type",
    market: "Market preview",
    privacy: "Privacy",
  };
  const copy = localized
    ? {
        ...baseCopy,
        ...localizedUi,
        title: () => (type === "spa" ? localized.spaH1 : localized.entrepreneurH1),
        lead: type === "spa" ? localized.spaLead : localized.entrepreneurLead,
        formTitle: localized.formTitle,
        submit: type === "spa" ? localized.spaCta : localized.entrepreneurCta,
      }
    : baseCopy;
  const isSpa = type === "spa";
  const spaUi = spaQualificationUi[market.lang] || spaQualificationUi.en;
  const spaCopy = spaExperienceUi[market.lang] || spaExperienceUi.en;
  const currentPath = isSpa ? spaJoinPath(market) : entrepreneurPath(market);
  const otherPath = isSpa ? entrepreneurPath(market) : spaJoinPath(market);
  const canonical = `${previewOrigin}${currentPath}`;
  const title = copy.title(market.display);
  const formType = isSpa ? "spa_business" : "country_entrepreneur";
  const alternateLinks = alternateLanguageLinks(
    market,
    isSpa ? spaJoinPath : entrepreneurPath,
  );
  const labels =
    localized?.labels
      ? {
          name: localized.labels.name,
          email: localized.labels.email,
          phone: localized.labels.phone,
          company: isSpa
            ? localized.labels.spaCompany
            : localized.labels.entrepreneurCompany,
          website: isSpa
            ? localized.labels.spaWebsite
            : localized.labels.entrepreneurWebsite,
          message: localized.labels.message,
          consent: localized.consent,
        }
      : market.lang === "he"
      ? {
          name: "שם מלא",
          email: "אימייל",
          phone: "טלפון",
          company: isSpa ? "שם בית הספא או העסק" : "חברה או ניסיון מקצועי",
          website: isSpa ? "אתר או פרופיל חברתי" : "LinkedIn או אתר",
          message: "ספרו לנו יותר",
          consent:
            "אני מסכים ש-SpaPlus תשתמש בפרטים כדי לבדוק את הפנייה ולחזור אליי.",
        }
      : market.slug === "italy" && market.lang === "it-IT"
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
            localized?.consent ||
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
<html lang="${market.lang}" dir="${market.lang === "he" ? "rtl" : "ltr"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(copy.lead)}">
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="${canonical}">
  ${alternateLinks}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="SpaPlus Global">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(copy.lead)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${previewOrigin}/${market.image}">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>
  <title>${escapeHtml(title)} | SpaPlus Global</title>
  <link rel="icon" href="https://spaplus.co/spaplus-mark.png?v=3" type="image/png">
  <link rel="stylesheet" href="/spaplus-global/markets/market.css?v=20260725-2">
</head>
<body class="funnel-page">
  <a class="skip-link" href="#main">${escapeHtml(commonUi.skip)}</a>
  <header class="market-header">
    <a class="market-brand" href="/spaplus-global${marketPath(market)}" aria-label="SpaPlus ${escapeHtml(market.display)}">
      <img src="/spaplus-global/spaplus-mark.png" alt="">
      <img src="/spaplus-global/spaplus-wordmark.png" alt="SpaPlus">
    </a>
    <nav aria-label="${escapeHtml(commonUi.routes)}">
      <a href="/spaplus-global${entrepreneurPath(market)}">${escapeHtml(
        isSpa ? copy.tabSecondary : copy.tabPrimary,
      )}</a>
      <a href="/spaplus-global${spaJoinPath(market)}">${escapeHtml(
        isSpa ? copy.tabPrimary : copy.tabSecondary,
      )}</a>
      <a href="/spaplus-global${marketPath(market)}">SpaPlus ${escapeHtml(market.display)}</a>
    </nav>
    ${renderLanguageSwitcher(
      market,
      (ui[market.ui] || ui.en).languageLabel,
      isSpa ? spaJoinPath : entrepreneurPath,
    )}
  </header>
  <main id="main">
    <section class="funnel-hero" style="--market-image:url('/spaplus-global/${market.image}')">
      <div class="funnel-hero-copy">
        <div class="market-status"><span>${market.flag}</span>${escapeHtml(market.display)}</div>
        <p class="eyebrow">${escapeHtml(copy.eyebrow)}</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(copy.lead)}</p>
${isSpa
  ? `<p class="funnel-trust">${escapeHtml(spaCopy.trust)}</p><a class="button button-primary funnel-hero-cta" href="#apply">${escapeHtml(spaCopy.heroCta)}</a>`
  : ""}
        <div class="funnel-tabs" aria-label="${escapeHtml(commonUi.choose)}">
          <a class="${isSpa ? "is-active" : ""}" href="/spaplus-global${spaJoinPath(market)}">${escapeHtml(
            isSpa ? copy.tabPrimary : copy.tabSecondary,
          )}</a>
          <a class="${isSpa ? "" : "is-active"}" href="/spaplus-global${entrepreneurPath(market)}">${escapeHtml(
            isSpa ? copy.tabSecondary : copy.tabPrimary,
          )}</a>
        </div>
      </div>
    </section>
${isSpa ? renderSpaExperienceSections(market, spaCopy) : ""}
    <section class="funnel-content section" id="apply">
      <div class="funnel-explainer">
        <p class="eyebrow">SpaPlus ${escapeHtml(market.display)}</p>
        <h2>${escapeHtml(copy.whatTitle)}</h2>
        <p>${escapeHtml(copy.whatBody)}</p>
        <ul>${copy.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
        <a class="text-link" href="/spaplus-global${otherPath}">${escapeHtml(copy.tabSecondary)}</a>
      </div>
      <form class="funnel-form" data-country-funnel data-success="${escapeHtml(copy.success)}" data-sending="${escapeHtml(
        isSpa ? spaUi.sending : "Sending...",
      )}" data-error="${escapeHtml(isSpa ? spaUi.error : "The message could not be sent. Please try again.")}" data-step-one-label="${escapeHtml(
        isSpa ? spaUi.step(1) : "",
      )}" data-step-two-label="${escapeHtml(isSpa ? spaUi.step(2) : "")}">
        <div>
          <p class="eyebrow">${escapeHtml(copy.formTitle)}</p>
          <h2>${escapeHtml(copy.formTitle)}</h2>
          <p>${escapeHtml(copy.formLead)}</p>
        </div>
        <input type="hidden" name="leadType" value="${formType}">
        <input type="hidden" name="displayTopic" value="${escapeHtml(copy.formTitle)}">
        <input type="hidden" name="market" value="${escapeHtml(market.slug)}">
        <input type="hidden" name="locale" value="${escapeHtml(market.locale)}">
        <input type="hidden" name="pageUrl" value="${canonical}">
        <input type="hidden" name="utm_source">
        <input type="hidden" name="utm_medium">
        <input type="hidden" name="utm_campaign">
        <input type="hidden" name="utm_content">
        <input type="hidden" name="utm_term">
        <input type="hidden" name="gclid">
        <input type="hidden" name="wbraid">
        <input type="hidden" name="gbraid">
        <input type="hidden" name="fbclid">
        <input type="hidden" name="msclkid">
        <input type="hidden" name="referrer">
        ${
          isSpa
            ? `<div class="form-progress field-wide" role="progressbar" aria-valuemin="1" aria-valuemax="2" aria-valuenow="1" aria-valuetext="${escapeHtml(spaUi.step(1))}">
          <span data-progress-label>${escapeHtml(spaUi.step(1))}</span><i aria-hidden="true"><b data-progress-bar></b></i>
        </div>
        <fieldset class="form-step field-wide is-active" data-form-step="1">
          <legend tabindex="-1">${escapeHtml(spaUi.stepOne)}</legend>
          <div class="step-grid">
            <label>${escapeHtml(labels.company)}<input name="company" autocomplete="organization" required></label>
            <label>${escapeHtml(labels.website)}<input name="website" type="url" inputmode="url" placeholder="https://"></label>
            <label>${escapeHtml(spaUi.city)}<input name="city" autocomplete="address-level2" required></label>
            <label>${escapeHtml(labels.name)}<input name="name" autocomplete="name" required></label>
            <label>${escapeHtml(spaUi.role)}<input name="role" autocomplete="organization-title" required></label>
            <label>${escapeHtml(labels.email)}<input name="email" type="email" autocomplete="email" required></label>
            <label>${escapeHtml(labels.phone)}<input name="phone" type="tel" autocomplete="tel" required></label>
            <label>${escapeHtml(spaCopy.contactMethod)}<select name="preferredContact" required><option value="">${escapeHtml(spaUi.choose)}</option>${spaCopy.contactOptions.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
          </div>
          <button class="button button-primary step-next" type="button" data-step-next>${escapeHtml(spaUi.next)}</button>
        </fieldset>
        <fieldset class="form-step field-wide" data-form-step="2" hidden>
          <legend tabindex="-1">${escapeHtml(spaUi.stepTwo)}</legend>
          <div class="step-grid">
            <label>${escapeHtml(spaUi.businessType)}<select name="businessType" required><option value="">${escapeHtml(spaUi.choose)}</option>${spaUi.types.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
            <label>${escapeHtml(spaCopy.status)}<select name="operatingStatus" required><option value="">${escapeHtml(spaUi.choose)}</option>${spaCopy.statusOptions.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
            <label>${escapeHtml(spaCopy.branches)}<select name="branches" required><option value="">${escapeHtml(spaUi.choose)}</option>${spaCopy.branchOptions.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
            <label>${escapeHtml(spaUi.rooms)}<select name="treatmentRooms" required><option value="">${escapeHtml(spaUi.choose)}</option>${spaUi.roomOptions.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
            <label>${escapeHtml(spaUi.booking)}<select name="onlineBooking" required><option value="">${escapeHtml(spaUi.choose)}</option>${spaUi.bookingOptions.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
            <fieldset class="choice-group field-wide"><legend>${escapeHtml(spaCopy.facilities)}</legend>${spaCopy.facilityOptions.map((item) => `<label><input type="checkbox" name="facilities" value="${escapeHtml(item)}"><span>${escapeHtml(item)}</span></label>`).join("")}</fieldset>
            <label class="field-wide">${escapeHtml(spaCopy.bookingMethod)}<select name="preferredBookingMethod" required><option value="">${escapeHtml(spaUi.choose)}</option>${spaCopy.bookingMethodOptions.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
            <label class="field-wide">${escapeHtml(labels.message)}<textarea name="message" rows="4"></textarea></label>
            <label class="consent field-wide"><input name="authorityConfirmed" type="checkbox" required value="confirmed"><span>${escapeHtml(spaUi.authority)}</span></label>
            <label class="consent field-wide"><input name="privacyConsent" type="checkbox" required value="accepted"><span>${escapeHtml(labels.consent)}</span></label>
          </div>
          <div class="step-actions">
            <button class="button button-secondary" type="button" data-step-back>${escapeHtml(spaUi.back)}</button>
            <button class="button button-primary" type="submit">${escapeHtml(copy.submit)}</button>
          </div>
          <p class="response-note">${escapeHtml(spaCopy.responseNote)}</p>
        </fieldset>`
            : `<label>${escapeHtml(labels.name)}<input name="name" autocomplete="name" required></label>
        <label>${escapeHtml(labels.email)}<input name="email" type="email" autocomplete="email" required></label>
        <label>${escapeHtml(labels.phone)}<input name="phone" type="tel" autocomplete="tel" required></label>
        <label>${escapeHtml(labels.company)}<input name="company" autocomplete="organization" required></label>
        <label class="field-wide">${escapeHtml(labels.website)}<input name="website" type="url" inputmode="url"></label>
        <label class="field-wide">${escapeHtml(labels.message)}<textarea name="message" rows="5" required></textarea></label>
        <label class="consent field-wide"><input name="privacyConsent" type="checkbox" required value="accepted"><span>${escapeHtml(labels.consent)}</span></label>
        <button class="button button-primary field-wide" type="submit">${escapeHtml(copy.submit)}</button>`
        }
        <p class="form-status field-wide" role="status" aria-live="polite"></p>
      </form>
    </section>
  </main>
  ${
    isSpa
      ? `<div class="success-modal" data-success-modal hidden>
    <div class="success-modal-card" role="dialog" aria-modal="true" aria-labelledby="success-title">
      <button class="modal-close" type="button" data-modal-close aria-label="${escapeHtml(spaUi.close)}">×</button>
      <span class="success-mark" aria-hidden="true">✓</span>
      <h2 id="success-title">${escapeHtml(spaUi.successTitle)}</h2>
      <p>${escapeHtml(spaCopy.responseNote)}</p>
      <button class="button button-primary" type="button" data-modal-close>${escapeHtml(spaUi.close)}</button>
    </div>
  </div>`
      : ""
  }
  <footer class="market-footer">
    <div><p>${escapeHtml((ui[market.ui] || ui.en).legal)}</p></div>
    <nav><a href="/spaplus-global${marketPath(market)}">${escapeHtml(commonUi.market)}</a><a href="/spaplus-global/${market.lang === "he" ? "he" : "en"}/#privacy">${escapeHtml(commonUi.privacy)}</a></nav>
    ${renderFooterMarkets(market)}
  </footer>
  <script src="/spaplus-global/markets/market.js?v=20260725-4"></script>
</body>
</html>`;
}

function renderMarketPage(market) {
  const siteLocale = market.lang === "he" ? "he" : "en";
  const baseCopy = ui[market.ui] || ui.en;
  const localized = campaignLocalizations[market.lang];
  const previewCopy = marketPreviewUi[market.lang];
  const entrepreneurUi = funnelLanguageUi[market.lang]?.entrepreneur;
  const spaUi = funnelLanguageUi[market.lang]?.spa;
  const commonUi = funnelCommonUi[market.lang] || {
    skip: "Skip to content",
    routes: "Market navigation",
    market: "Market preview",
    privacy: "Privacy",
  };
  const auxUi = marketAuxUi[market.lang] || {
    legal: "Legal navigation",
    privacy: "Privacy",
    terms: "Terms",
    accessibility: "Accessibility",
    share: "Share",
  };
  const sampleDay = sampleDayByLanguage[market.lang] || "Saturday";
  const copy = {
    ...baseCopy,
    ...previewCopy,
    navMarkets: previewCopy ? commonUi.market : baseCopy.navMarkets,
    navSpa: spaUi?.tabPrimary || baseCopy.navSpa,
    navPartners: entrepreneurUi?.tabPrimary || baseCopy.navPartners,
    entrepreneurEyebrow: entrepreneurUi?.eyebrow || baseCopy.entrepreneurEyebrow,
    entrepreneurTitle: localized
      ? () => localized.entrepreneurH1
      : baseCopy.entrepreneurTitle,
    entrepreneurBody: localized?.entrepreneurLead || baseCopy.entrepreneurBody,
    entrepreneurPoints: entrepreneurUi?.points || baseCopy.entrepreneurPoints,
    apply: localized?.entrepreneurCta || baseCopy.apply,
    spaEyebrow: spaUi?.eyebrow || baseCopy.spaEyebrow,
    spaTitle: localized ? localized.spaH1 : baseCopy.spaTitle,
    spaBody: localized?.spaLead || baseCopy.spaBody,
    spaCta: localized?.spaCta || baseCopy.spaCta,
  };
  const pageTitle = `${copy.status}: SpaPlus ${market.display} | SpaPlus Global`;
  const description = localized?.marketLead || copy.heroLead(market.display);
  const alternateLinks = alternateLanguageLinks(market, marketPath);
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
<html lang="${market.lang}" dir="${market.lang === "he" ? "rtl" : "ltr"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#14243d">
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="${previewUrl(market)}">
  ${alternateLinks}
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
  <link rel="icon" href="https://spaplus.co/spaplus-mark.png?v=3" type="image/png">
  <link rel="stylesheet" href="/spaplus-global/markets/market.css?v=20260725-2">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  <a class="skip-link" href="#main">${escapeHtml(commonUi.skip)}</a>
  <header class="market-header">
    <a class="market-brand" href="/spaplus-global/${siteLocale}/" aria-label="${escapeHtml(copy.home)}">
      <img src="/spaplus-global/spaplus-mark.png" alt="">
      <img src="/spaplus-global/spaplus-wordmark.png" alt="SpaPlus">
    </a>
    <nav aria-label="${escapeHtml(commonUi.routes)}">
      <a href="/spaplus-global/${siteLocale}/markets/">${escapeHtml(copy.navMarkets)}</a>
      <a href="/spaplus-global${spaJoinPath(market)}">${escapeHtml(copy.navSpa)}</a>
      <a href="/spaplus-global${entrepreneurPath(market)}">${escapeHtml(copy.navPartners)}</a>
    </nav>
    ${renderLanguageSwitcher(market, copy.languageLabel)}
  </header>

  <main id="main">
    <section class="market-hero" style="--market-image:url('/spaplus-global/${market.image}')">
      <div class="market-hero-shade"></div>
      <div class="market-hero-copy">
        <div class="market-status"><span>${market.flag}</span>${escapeHtml(copy.status)}</div>
        <p class="eyebrow">SpaPlus ${escapeHtml(market.display)}</p>
        <h1>${escapeHtml(
          localized?.marketH1 ||
          (market.ui === "he"
            ? `SpaPlus מגיעה ל${market.display}`
            : market.ui === "elCy"
              ? "Το SpaPlus έρχεται στην Κύπρο"
              : market.ui === "it"
                ? "SpaPlus sta arrivando in Italia"
                : `SpaPlus is coming to ${market.display}`),
        )}</h1>
        <p>${escapeHtml(description)}</p>
        <div class="hero-actions">
          <a class="button button-primary" href="#preview">${escapeHtml(copy.guestCta)}</a>
          <a class="button button-glass" href="#entrepreneur">${escapeHtml(
            localized?.entrepreneurCta || copy.partnerCta,
          )}</a>
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
          <label><span>${escapeHtml(copy.searchWhen)}</span><strong>${escapeHtml(sampleDay)}</strong></label>
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
          localized?.entrepreneurCta || copy.apply,
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
        localized?.spaCta || copy.spaCta,
      )}</a>
    </section>
  </main>

  <footer class="market-footer">
    <div>
      <a class="market-brand" href="/spaplus-global/${siteLocale}/">
        <img src="/spaplus-global/spaplus-mark.png" alt="">
        <img src="/spaplus-global/spaplus-wordmark.png" alt="SpaPlus">
      </a>
      <p>${escapeHtml(copy.legal)}</p>
    </div>
    <nav aria-label="${escapeHtml(auxUi.legal)}">
      <a href="/spaplus-global/${siteLocale}/#privacy">${escapeHtml(auxUi.privacy)}</a>
      <a href="/spaplus-global/${siteLocale}/#privacy">${escapeHtml(auxUi.terms)}</a>
      <a href="/spaplus-global/${siteLocale}/#accessibility">${escapeHtml(auxUi.accessibility)}</a>
    </nav>
    ${renderFooterMarkets(market)}
  </footer>

  <button class="share-market" type="button" aria-label="${escapeHtml(auxUi.share)}">${escapeHtml(auxUi.share)}</button>
  <div class="share-toast" role="status" aria-live="polite"></div>
  <script src="/spaplus-global/markets/market.js?v=20260725-2"></script>
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
  <link rel="icon" href="https://spaplus.co/spaplus-mark.png?v=3" type="image/png">
  <link rel="stylesheet" href="/spaplus-global/markets/market.css?v=20260725-2">
</head>
<body class="hub-page">
  <a class="skip-link" href="#main">${locale === "he" ? "דלגו לתוכן הראשי" : "Skip to main content"}</a>
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
  <footer class="market-footer"><p>${escapeHtml(copy.legal)}</p>${renderFooterMarkets({
    lang: locale,
  })}</footer>
</body>
</html>`;
}

const marketCss = `
@import url("https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap");
:root{--navy:#142b4b;--navy-deep:#0d1f37;--pink:#cf0e5a;--rose:#fff2f6;--cream:#fbf9f7;--ink:#172d4f;--muted:#667289;--line:#dce2e8;--white:#fff}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--cream);color:var(--ink);font-family:Inter,"Noto Sans","Noto Sans Hebrew",Arial,sans-serif;line-height:1.6}
[dir="rtl"] body{font-family:Heebo,Arial,sans-serif}
[dir="rtl"] h1,[dir="rtl"] h2,[dir="rtl"] h3{letter-spacing:0!important;word-spacing:.08em}
[dir="rtl"] .market-hero-shade{background:linear-gradient(270deg,rgba(10,29,52,.88),rgba(10,29,52,.5) 46%,rgba(10,29,52,.1)),linear-gradient(0deg,rgba(10,29,52,.55),transparent 55%)}
[dir="rtl"] .funnel-hero{background-image:linear-gradient(270deg,rgba(9,26,48,.94),rgba(9,26,48,.55)),var(--market-image)}
[dir="rtl"] .share-market,[dir="rtl"] .share-toast{right:auto;left:20px}
a{color:inherit}
img{max-width:100%}
:focus-visible{outline:3px solid var(--pink);outline-offset:3px}
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
.market-footer{padding:38px clamp(20px,6vw,92px);background:#091a30;color:#fff;display:flex;justify-content:space-between;gap:30px;align-items:center;flex-wrap:wrap}.market-footer>div{max-width:680px}.market-footer .market-brand{filter:brightness(0) invert(1);margin-bottom:16px}.market-footer p{margin:0;color:rgba(255,255,255,.68);font-size:13px}.market-footer nav{display:flex;gap:18px;flex-wrap:wrap}.market-footer nav a{color:#fff}.market-footer .market-footer-markets{flex:0 0 100%;max-width:none;margin-top:8px;padding-top:26px;border-top:1px solid rgba(255,255,255,.14);text-align:center}.market-footer-markets h2{margin:0 0 16px;color:#fff;font-size:13px;line-height:1.2;letter-spacing:.18em;text-transform:uppercase}.market-footer-markets nav{justify-content:center;gap:9px 20px}.market-footer-markets nav a{color:rgba(255,255,255,.76);font-size:12px;text-decoration:none}.market-footer-markets nav a:hover,.market-footer-markets nav a:focus-visible{color:#fff;text-decoration:underline;text-underline-offset:4px}
.share-market{position:fixed;right:20px;bottom:20px;z-index:15;border:0;border-radius:999px;background:var(--pink);color:#fff;padding:13px 18px;font-weight:900;box-shadow:0 12px 30px rgba(237,23,100,.32)}.share-toast{position:fixed;right:20px;bottom:78px;z-index:16;background:var(--navy);color:#fff;border-radius:10px;padding:10px 14px;opacity:0;transform:translateY(8px);pointer-events:none;transition:.2s}.share-toast.is-visible{opacity:1;transform:none}
.hub-page{background:linear-gradient(180deg,#fff5f8,#f4f7fb 55%,#fff)}.hub-hero{padding:clamp(80px,12vw,160px) clamp(20px,7vw,110px) 60px;max-width:1200px}.hub-hero>p:last-of-type{max-width:780px;color:var(--muted);font-size:20px}.live-markets{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.live-markets span{background:#fff;border:1px solid var(--line);padding:10px 15px;border-radius:999px;font-weight:800}.live-markets strong{color:#168263;font-size:12px;letter-spacing:.12em}.hub-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding-top:20px}.hub-card{text-decoration:none;background:#fff;border:1px solid var(--line);border-radius:24px;padding:26px;min-height:250px;position:relative;transition:.2s;box-shadow:0 12px 30px rgba(20,43,75,.06)}.hub-card:hover{transform:translateY(-5px);box-shadow:0 20px 45px rgba(20,43,75,.13)}.hub-flag{font-size:42px}.hub-status{position:absolute;top:26px;right:26px;color:var(--pink);font-size:10px;font-weight:900;letter-spacing:.12em}.hub-card h2{font-size:30px;margin:32px 0 4px}.hub-card p{color:var(--muted)}.hub-card strong{display:block;margin-top:30px;color:var(--pink)}
.funnel-page{background:#f6f7fa}.funnel-hero{min-height:590px;display:grid;align-items:end;background-image:linear-gradient(90deg,rgba(9,26,48,.94),rgba(9,26,48,.55)),var(--market-image);background-size:cover;background-position:center}.funnel-hero-copy{color:#fff;max-width:920px;padding:clamp(70px,10vw,135px) clamp(20px,7vw,110px)}.funnel-hero h1{font-size:clamp(48px,7vw,92px);line-height:.98;letter-spacing:-.055em;margin:24px 0}.funnel-hero-copy>p{font-size:clamp(18px,2vw,24px);color:rgba(255,255,255,.82);max-width:760px}.funnel-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-top:34px}.funnel-tabs a{padding:12px 17px;border:1px solid rgba(255,255,255,.38);border-radius:999px;color:#fff;text-decoration:none;font-weight:850}.funnel-tabs a.is-active{background:#fff;color:var(--navy)}.funnel-content{display:grid;grid-template-columns:.85fr 1.15fr;gap:clamp(36px,7vw,100px);align-items:start}.funnel-explainer{position:sticky;top:120px}.funnel-explainer h2,.funnel-form h2{font-size:clamp(34px,4vw,56px);line-height:1.03;letter-spacing:-.04em}.funnel-explainer>p,.funnel-form>div>p{color:var(--muted);font-size:17px}.funnel-explainer ul{padding-inline-start:22px;margin:28px 0}.funnel-explainer li{margin:14px 0}.text-link{color:var(--pink);font-weight:850}.funnel-form{display:grid;grid-template-columns:1fr 1fr;gap:18px;background:#fff;border:1px solid var(--line);border-radius:28px;padding:clamp(24px,4vw,48px);box-shadow:0 24px 70px rgba(20,43,75,.1);scroll-margin-top:92px}.funnel-form>div,.field-wide{grid-column:1/-1}.funnel-form label{font-weight:800;font-size:13px}.funnel-form input,.funnel-form textarea,.funnel-form select{display:block;width:100%;margin-top:7px;border:1px solid #cfd6df;border-radius:13px;background:#fff;color:var(--ink);padding:13px 14px;font:inherit}.funnel-form input:focus,.funnel-form textarea:focus,.funnel-form select:focus{outline:3px solid var(--pink);outline-offset:2px;border-color:var(--pink)}.funnel-form .consent{display:flex;gap:10px;align-items:flex-start;font-weight:500;color:var(--muted)}.funnel-form .consent input{width:18px;height:18px;margin:3px 0 0;flex:0 0 auto}.form-status{min-height:24px;margin:0;color:#11684f;font-weight:800}.funnel-form.is-sending{opacity:.72;pointer-events:none}.form-progress{display:grid;gap:8px;color:var(--muted);font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.form-progress i{display:block;height:7px;border-radius:999px;background:#e7ebf0;overflow:hidden}.form-progress b{display:block;width:50%;height:100%;border-radius:inherit;background:var(--pink);transition:width .25s ease}.form-step{border:0;padding:0;margin:8px 0 0;min-width:0}.form-step legend{font-size:22px;font-weight:900;margin-bottom:22px;color:var(--navy)}.step-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.step-grid .field-wide{grid-column:1/-1}.step-next{margin-top:24px;width:100%}.step-actions{display:flex;justify-content:space-between;gap:12px;margin-top:24px}.step-actions .button{flex:1}.success-modal{position:fixed;inset:0;z-index:100;background:rgba(4,17,34,.72);display:grid;place-items:center;padding:20px}.success-modal[hidden]{display:none}.success-modal-card{position:relative;width:min(520px,100%);background:#fff;border-radius:28px;padding:clamp(30px,6vw,52px);text-align:center;box-shadow:0 30px 100px rgba(0,0,0,.3)}.success-modal-card h2{font-size:clamp(30px,5vw,46px);line-height:1.05;margin:18px 0 12px}.success-modal-card p{color:var(--muted);font-size:17px;margin:0 0 28px}.success-mark{display:grid;place-items:center;width:64px;height:64px;margin:auto;border-radius:50%;background:#e9fbf4;color:#11805e;font-size:34px;font-weight:900}.modal-close{position:absolute;top:14px;right:16px;border:0;background:transparent;color:var(--muted);font-size:28px;line-height:1;padding:8px}
.funnel-trust{font-size:15px!important;font-weight:850;color:#fff!important;margin:22px 0 0}.funnel-hero-cta{margin-top:18px}.spa-card-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;max-width:1240px;margin:auto}.spa-card-grid-three{grid-template-columns:repeat(3,1fr)}.spa-info-card,.spa-flow-card,.spa-payment-card{background:#fff;border:1px solid var(--line);border-radius:24px;padding:30px;box-shadow:0 14px 36px rgba(20,43,75,.06)}.spa-info-card h3,.spa-flow-card h3,.spa-payment-card h3{font-size:22px;line-height:1.15;margin-bottom:12px}.spa-info-card p,.spa-flow-card p,.spa-payment-card p{color:var(--muted);margin:0}.spa-profile-preview{display:grid;grid-template-columns:.8fr 1.2fr;gap:clamp(36px,7vw,96px);align-items:center;background:linear-gradient(135deg,#fff2f6,#eef4fb)}.spa-profile-copy h2,.spa-fit h2{font-size:clamp(38px,5vw,68px);line-height:1.02;letter-spacing:-.045em}.spa-profile-copy>p:last-child,.spa-fit>div>p:last-child{color:var(--muted);font-size:18px}.spa-profile-mockup{background:#fff;border:10px solid #fff;border-radius:28px;overflow:hidden;box-shadow:0 30px 80px rgba(20,43,75,.18)}.mockup-cover{height:260px;background-image:linear-gradient(0deg,rgba(9,26,48,.64),rgba(9,26,48,.08)),var(--market-image);background-size:cover;background-position:center;display:flex;align-items:flex-end;padding:20px}.mockup-cover span{background:#fff;color:var(--navy);border-radius:999px;padding:7px 11px;font-size:11px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.mockup-body{padding:24px}.mockup-brand{display:flex;align-items:center;gap:12px;font-size:18px}.mockup-brand span{font-size:30px}.mockup-lines{display:grid;gap:9px;margin:24px 0}.mockup-lines i{display:block;height:10px;background:#e7ebf0;border-radius:999px}.mockup-lines i:nth-child(2){width:85%}.mockup-lines i:nth-child(3){width:62%}.mockup-actions{display:flex;gap:12px}.mockup-actions span,.mockup-actions b{display:block;height:42px;border-radius:999px}.mockup-actions span{flex:1;background:#edf1f6}.mockup-actions b{width:35%;background:var(--pink)}.spa-operating{background:#fff}.spa-payments{background:var(--navy);color:#fff}.spa-payments .eyebrow{color:#ff75a7}.spa-payment-card{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.16);box-shadow:none}.spa-payment-card p{color:rgba(255,255,255,.72)}.local-terms-note{max-width:900px;margin:32px auto 0;text-align:center;color:rgba(255,255,255,.76)}.spa-fit{display:grid;grid-template-columns:1fr 1fr;gap:clamp(36px,7vw,100px);align-items:center}.spa-fit ul{margin:0;padding:30px 30px 30px 52px;background:#fff;border:1px solid var(--line);border-radius:24px;box-shadow:0 14px 36px rgba(20,43,75,.06)}.spa-fit li{margin:12px 0}.spa-process{background:#fff}.spa-process-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;max-width:1240px;margin:auto}.spa-process-grid article{padding:26px;border-top:3px solid var(--pink);background:#f7f8fb;border-radius:0 0 20px 20px}.spa-process-grid article>span{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:var(--navy);color:#fff;font-weight:900}.spa-process-grid h3{font-size:20px;margin:22px 0 8px}.spa-process-grid p{color:var(--muted);margin:0}.spa-faq{background:#f2f5f9}.spa-faq-list{max-width:920px;margin:auto;display:grid;gap:12px}.spa-faq details{background:#fff;border:1px solid var(--line);border-radius:16px;padding:0 22px}.spa-faq summary{cursor:pointer;font-weight:850;padding:20px 0}.spa-faq details p{color:var(--muted);padding:0 0 20px;margin:0}.choice-group{border:1px solid var(--line);border-radius:16px;padding:16px}.choice-group legend{font-size:13px;margin:0;padding:0 7px}.choice-group label{display:inline-flex;align-items:center;gap:8px;margin:5px 12px 5px 0;padding:8px 12px;border-radius:999px;background:#f3f5f8}.choice-group input{display:inline-block;width:18px;height:18px;margin:0}.response-note{grid-column:1/-1;margin:12px 0 0;color:var(--muted);font-size:13px;text-align:center}
@media(max-width:900px){.market-header{height:auto;flex-wrap:wrap}.market-header nav{display:flex;order:3;width:100%;min-width:0;overflow-x:auto;white-space:nowrap;padding-block:4px;scrollbar-width:none}.market-header nav::-webkit-scrollbar{display:none}.market-header nav a{min-height:44px;display:inline-flex;align-items:center}.market-hero{min-height:650px}.market-hero-shade{background:linear-gradient(0deg,rgba(10,29,52,.9),rgba(10,29,52,.22))}.search-mockup{grid-template-columns:1fr 1fr}.search-mockup button{grid-column:1/-1}.sample-grid,.benefit-grid,.hub-grid{grid-template-columns:1fr 1fr}.entrepreneur-section{grid-template-columns:1fr}.spa-section,.market-footer{align-items:flex-start;flex-direction:column}}
@media(max-width:900px){.funnel-content,.spa-profile-preview,.spa-fit{grid-template-columns:1fr}.funnel-explainer{position:static}.spa-card-grid{grid-template-columns:1fr 1fr}.spa-process-grid{grid-template-columns:1fr 1fr}}
@media(max-width:620px){.market-header{min-height:70px;padding:10px 16px;gap:8px 16px}.market-header nav{gap:18px}.market-brand img:first-child{width:38px;height:38px}.market-brand img:last-child{width:90px}.market-language>span{display:none}.market-hero{min-height:630px}.market-hero-copy{padding:70px 20px 42px}.market-hero h1{font-size:48px}.section{padding:70px 16px}.search-mockup,.sample-grid,.benefit-grid,.hub-grid,.spa-card-grid,.spa-process-grid{grid-template-columns:1fr}.sample-grid{padding:16px}.sample-card-image{height:170px}.entrepreneur-section{padding:70px 20px}.spa-section{padding:70px 20px}.market-footer{padding:34px 20px}.share-market{right:14px;bottom:14px}.hub-status{right:20px}.funnel-hero{min-height:540px}.funnel-hero-copy{padding:76px 18px 42px}.funnel-hero h1{font-size:47px}.funnel-form{grid-template-columns:1fr}.funnel-form label{grid-column:1/-1}.step-grid{grid-template-columns:1fr}.step-grid .field-wide{grid-column:1}.step-actions{flex-direction:column-reverse}.mockup-cover{height:190px}.spa-info-card,.spa-flow-card,.spa-payment-card{padding:24px}}
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
    } catch (error) {
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
  const formSteps = [...funnelForm.querySelectorAll("[data-form-step]")];
  const progress = funnelForm.querySelector(".form-progress");
  const progressLabel = funnelForm.querySelector("[data-progress-label]");
  const progressBar = funnelForm.querySelector("[data-progress-bar]");
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("a11y-reduce-motion");
  const showStep = (stepNumber, moveFocus = false) => {
    let activeStep = null;
    formSteps.forEach((step) => {
      const active = Number(step.dataset.formStep) === stepNumber;
      step.hidden = !active;
      step.classList.toggle("is-active", active);
      if (active) activeStep = step;
    });
    if (progressLabel) {
      progressLabel.textContent = stepNumber === 1
        ? funnelForm.dataset.stepOneLabel
        : funnelForm.dataset.stepTwoLabel;
    }
    if (progress) {
      progress.setAttribute("aria-valuenow", String(stepNumber));
      progress.setAttribute(
        "aria-valuetext",
        stepNumber === 1 ? funnelForm.dataset.stepOneLabel : funnelForm.dataset.stepTwoLabel,
      );
    }
    if (progressBar) progressBar.style.width = stepNumber === 1 ? "50%" : "100%";
    if (moveFocus && activeStep) {
      window.requestAnimationFrame(() => {
        activeStep.querySelector("legend")?.focus();
      });
    }
  };
  funnelForm.querySelector("[data-step-next]")?.addEventListener("click", () => {
    const firstStep = funnelForm.querySelector("[data-form-step='1']");
    const invalid = [...firstStep.querySelectorAll("input, select, textarea")].find(
      (field) => !field.checkValidity(),
    );
    if (invalid) {
      invalid.reportValidity();
      invalid.focus();
      return;
    }
    window.dataLayer.push({
      event: "spaplus_funnel_step_complete",
      step: 1,
      lead_type: funnelForm.elements.namedItem("leadType").value,
      market: funnelForm.elements.namedItem("market").value,
    });
    showStep(2, true);
    funnelForm.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  });
  funnelForm.querySelector("[data-step-back]")?.addEventListener("click", () => {
    showStep(1, true);
    funnelForm.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  });
  const successModal = document.querySelector("[data-success-modal]");
  const successModalCard = successModal?.querySelector(".success-modal-card");
  let successModalLastFocused = null;
  let successModalInertState = [];
  const closeSuccessModal = () => {
    if (!successModal || successModal.hidden) return;
    successModal.hidden = true;
    document.body.style.overflow = "";
    successModalInertState.forEach(({ element, inert }) => {
      element.inert = inert;
    });
    successModalInertState = [];
    if (successModalLastFocused instanceof HTMLElement) successModalLastFocused.focus();
    successModalLastFocused = null;
  };
  successModal?.querySelectorAll("[data-modal-close]").forEach((button) => {
    button.addEventListener("click", closeSuccessModal);
  });
  successModal?.addEventListener("click", (event) => {
    if (event.target === successModal) closeSuccessModal();
  });
  document.addEventListener("keydown", (event) => {
    if (!successModal || successModal.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeSuccessModal();
      return;
    }
    if (event.key !== "Tab" || !successModalCard) return;
    const focusable = [...successModalCard.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )].filter((element) => !element.hidden && element.offsetParent !== null);
    if (!focusable.length) {
      event.preventDefault();
      successModalCard.setAttribute("tabindex", "-1");
      successModalCard.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  const attributionKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "wbraid",
    "gbraid",
    "fbclid",
    "msclkid",
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
  funnelForm.addEventListener("focusin", () => {
    if (funnelForm.dataset.started) return;
    funnelForm.dataset.started = "true";
    window.dataLayer.push({
      event: "spaplus_funnel_start",
      lead_type: funnelForm.elements.namedItem("leadType").value,
      market: funnelForm.elements.namedItem("market").value,
      locale: funnelForm.elements.namedItem("locale").value,
    });
  });
  funnelForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = funnelForm.querySelector(".form-status");
    const submit = funnelForm.querySelector("button[type='submit']");
    const formData = new FormData(funnelForm);
    const formValues = Object.fromEntries(formData.entries());
    const selectedFacilities = formData.getAll("facilities");
    const emailLocaleMap = {
      "el-cy": "el",
      "el-gr": "el",
      "hu-hu": "hu",
      "it-it": "it",
      "de-de": "de",
      "de-ch": "de",
      "fr-fr": "fr",
      "nl-nl": "nl",
      "sv-se": "sv",
      "nb-no": "nb",
    };
    const fallbackAutoResponses = {
      "el-cy": "Ευχαριστούμε. Λάβαμε τα στοιχεία σας και η ομάδα SpaPlus θα επικοινωνήσει μαζί σας σύντομα.",
      "el-gr": "Ευχαριστούμε. Λάβαμε τα στοιχεία σας και η ομάδα SpaPlus θα επικοινωνήσει μαζί σας σύντομα.",
      "hu-hu": "Köszönjük. Megkaptuk az adatokat, és a SpaPlus csapata hamarosan jelentkezik.",
      "it-it": "Grazie. Abbiamo ricevuto i tuoi dati e il team SpaPlus ti contatterà presto.",
      "de-de": "Vielen Dank. Wir haben Ihre Angaben erhalten. Das SpaPlus-Team meldet sich in Kürze.",
      "de-ch": "Vielen Dank. Wir haben Ihre Angaben erhalten. Das SpaPlus-Team meldet sich in Kürze.",
      "fr-fr": "Merci. Nous avons bien reçu vos informations. L’équipe SpaPlus reviendra vers vous prochainement.",
      "nl-nl": "Bedankt. We hebben je gegevens ontvangen. Het SpaPlus-team neemt binnenkort contact op.",
      "sv-se": "Tack. Vi har tagit emot dina uppgifter. SpaPlus-teamet återkommer snart.",
      "nb-no": "Takk. Vi har mottatt opplysningene dine. SpaPlus-teamet tar snart kontakt.",
    };
    const topic = formValues.leadType === "spa_business"
      ? "Spa business lead | " + formValues.market
      : "Country entrepreneur lead | " + formValues.market;
    const campaignDetails = attributionKeys
      .filter((key) => formValues[key])
      .map((key) => key + ": " + formValues[key])
      .join("\\n");
    const payload = {
      submissionId: crypto.randomUUID(),
      privacyAccepted: formValues.privacyConsent === "accepted",
      name: formValues.name,
      email: formValues.email,
      organization: formValues.company,
      topic,
      publicTopic: formValues.displayTopic,
      locale: emailLocaleMap[formValues.locale] || "en",
      source: location.href,
      message: [
        formValues.message,
        "",
        "Market: " + formValues.market,
        "Lead type: " + formValues.leadType,
        "Phone: " + formValues.phone,
        "Website: " + (formValues.website || "Not provided"),
        formValues.city ? "City or region: " + formValues.city : "",
        formValues.role ? "Contact role: " + formValues.role : "",
        formValues.preferredContact ? "Preferred contact: " + formValues.preferredContact : "",
        formValues.businessType ? "Business type: " + formValues.businessType : "",
        formValues.operatingStatus ? "Operating status: " + formValues.operatingStatus : "",
        formValues.branches ? "Locations: " + formValues.branches : "",
        formValues.treatmentRooms ? "Treatment rooms: " + formValues.treatmentRooms : "",
        selectedFacilities.length ? "Facilities: " + selectedFacilities.join(", ") : "",
        formValues.onlineBooking ? "Online booking: " + formValues.onlineBooking : "",
        formValues.preferredBookingMethod ? "Preferred booking method: " + formValues.preferredBookingMethod : "",
        formValues.authorityConfirmed ? "Authority confirmed: Yes" : "",
        campaignDetails ? "\\nCampaign attribution:\\n" + campaignDetails : "",
        "Referrer: " + (formValues.referrer || "Direct"),
      ].filter(Boolean).join("\\n"),
    };
    funnelForm.classList.add("is-sending");
    submit.disabled = true;
    status.textContent = funnelForm.dataset.sending;
    try {
      let response = null;
      try {
        response = await fetch("https://spaplus-global-brand.adir-naor-7510.chatgpt.site/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        response = null;
      }
      if (!response?.ok) {
        response = await fetch("https://formsubmit.co/ajax/93567c940af3bbace0ca1b462708c256", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name: formValues.name,
            email: formValues.email,
            phone: formValues.phone,
            company: formValues.company,
            website: formValues.website || "Not provided",
            city_or_region: formValues.city || "Not provided",
            contact_role: formValues.role || "Not provided",
            preferred_contact: formValues.preferredContact || "Not provided",
            business_type: formValues.businessType || "Not provided",
            operating_status: formValues.operatingStatus || "Not provided",
            locations: formValues.branches || "Not provided",
            treatment_rooms: formValues.treatmentRooms || "Not provided",
            facilities: selectedFacilities.join(", ") || "Not provided",
            online_booking: formValues.onlineBooking || "Not provided",
            preferred_booking_method: formValues.preferredBookingMethod || "Not provided",
            authority_confirmed: formValues.authorityConfirmed || "Not applicable",
            market: formValues.market,
            lead_type: formValues.leadType,
            message: formValues.message,
            campaign_attribution: campaignDetails || "Direct",
            page: location.href,
            _subject: "[SpaPlus Global] " + topic,
            _template: "box",
            _cc: "palombo.r@gmail.com,s0509350015@gmail.com",
            _autoresponse:
              fallbackAutoResponses[formValues.locale] ||
              "Thank you for contacting SpaPlus Global. We have received your enquiry and our team will review it shortly.",
          }),
        });
      }
      if (!response.ok) throw new Error("Delivery endpoints failed");
      window.dataLayer.push({
        event: "generate_lead",
        lead_type: formValues.leadType,
        market: formValues.market,
        locale: formValues.locale,
      });
      funnelForm.reset();
      status.textContent = funnelForm.dataset.success;
      if (formSteps.length) showStep(1);
      if (successModal) {
        successModalLastFocused = document.activeElement;
        successModalInertState = [...document.body.children]
          .filter((element) => element !== successModal)
          .map((element) => ({ element, inert: element.inert }));
        successModalInertState.forEach(({ element }) => {
          element.inert = true;
        });
        successModal.hidden = false;
        document.body.style.overflow = "hidden";
        successModal.querySelector("[data-modal-close]")?.focus();
      }
    } catch {
      status.textContent = funnelForm.dataset.error;
      window.dataLayer.push({
        event: "spaplus_funnel_error",
        lead_type: formValues.leadType,
        market: formValues.market,
        locale: formValues.locale,
      });
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

  const spaDirectory = path.join(
    outputRoot,
    ...spaJoinPath(market).split("/").filter(Boolean),
  );
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

const productionPaths = [
  "/",
  "/en/",
  "/he/",
  "/fr-ca/",
  "/ru/",
  "/el/",
  "/it/",
  "/hu/",
  "/pl/",
  "/es/",
  "/en/markets/",
  "/he/markets/",
  ...markets.flatMap((market) => [
    marketPath(market),
    entrepreneurPath(market),
    spaJoinPath(market),
  ]),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...new Set(productionPaths)]
  .map(
    (route) =>
      `  <url><loc>${productionOrigin}${route}</loc><lastmod>2026-07-25</lastmod></url>`,
  )
  .join("\n")}
</urlset>
`;
await Promise.all([
  writeFile(path.join(outputRoot, "sitemap.xml"), sitemap, "utf8"),
  writeFile(
    path.join(outputRoot, "robots.production.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${productionOrigin}/sitemap.xml\n`,
    "utf8",
  ),
]);

console.log(
  `Generated ${markets.length} market pages, ${markets.length * 2} campaign funnels and 2 market hubs.`,
);
