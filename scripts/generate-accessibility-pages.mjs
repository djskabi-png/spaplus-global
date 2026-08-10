import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "codepen");

const copy = {
  en: { title: "Accessibility statement", intro: "SpaPlus Global is committed to making its digital experience usable by as many people as possible, including people with disabilities.", measures: "What we have implemented", measuresBody: "The site includes keyboard navigation, visible focus indicators, semantic headings, form labels and feedback, alternative text, responsive layouts, support for reduced-motion preferences, and controls for text size, contrast and link visibility.", standard: "Our accessibility approach", standardBody: "We design and review the site with the Web Content Accessibility Guidelines, WCAG 2.2 Level AA, as our target. This statement describes the work carried out and is not a formal legal certification of full conformance.", limits: "Known limitations", limitsBody: "Some content supplied by external services, older browsers or device-level settings may behave differently. We continue to test new pages and correct barriers that we identify.", feedback: "Tell us about a barrier", feedbackBody: "If something prevents you from using the site, contact us and include the page address, what you tried to do and the device or browser you used. We will review the report and respond as soon as reasonably possible.", contact: "Contact us", reviewed: "Last reviewed: 27 July 2026", home: "Back to SpaPlus Global", language: "Statement language" },
  he: { title: "הצהרת נגישות", intro: "אנחנו מחויבים לאפשר לכמה שיותר אנשים להשתמש בחוויה הדיגיטלית של ספא פלוס גלובל, לרבות אנשים עם מוגבלות.", measures: "מה יישמנו באתר", measuresBody: "האתר כולל ניווט במקלדת, סימון ברור של המוקד, כותרות סמנטיות, תוויות ומשוב בטפסים, טקסט חלופי לתמונות, התאמה למסכים שונים, תמיכה בהפחתת תנועה וכלים לשינוי גודל הטקסט, הניגודיות והדגשת הקישורים.", standard: "גישת הנגישות שלנו", standardBody: "האתר מתוכנן ונבדק כאשר הנחיות הנגישות לתוכן באינטרנט ברמה 2.2 AA משמשות יעד מקצועי. הצהרה זו מתארת את הפעולות שבוצעו ואינה אישור משפטי רשמי לעמידה מלאה.", limits: "מגבלות ידועות", limitsBody: "תוכן שמגיע משירותים חיצוניים, דפדפנים ישנים או הגדרות ברמת המכשיר עלול להתנהג באופן שונה. אנחנו ממשיכים לבדוק עמודים חדשים ולתקן חסמים שמתגלים.", feedback: "נתקלתם בחסם", feedbackBody: "אם משהו מונע מכם להשתמש באתר, כתבו לנו וציינו את כתובת העמוד, מה ניסיתם לבצע ובאיזה מכשיר או דפדפן השתמשתם. נבדוק את הפנייה ונשיב בהקדם האפשרי.", contact: "יצירת קשר", reviewed: "נבדק לאחרונה: 27 ביולי 2026", home: "חזרה לספא פלוס גלובל", language: "שפת ההצהרה" },
  fr: { title: "Déclaration d’accessibilité", intro: "SpaPlus Global s’engage à rendre son expérience numérique utilisable par le plus grand nombre, y compris les personnes en situation de handicap.", measures: "Mesures mises en place", measuresBody: "Le site comprend une navigation au clavier, des indicateurs de focus visibles, des titres sémantiques, des libellés et retours de formulaires, des textes alternatifs, une mise en page adaptative, la prise en charge de la réduction des animations et des réglages de taille du texte, de contraste et de visibilité des liens.", standard: "Notre démarche", standardBody: "Nous concevons et révisons le site en prenant les WCAG 2.2 niveau AA comme objectif. Cette déclaration décrit le travail réalisé et ne constitue pas une certification juridique de conformité totale.", limits: "Limites connues", limitsBody: "Certains contenus fournis par des services externes, d’anciens navigateurs ou des réglages propres à l’appareil peuvent se comporter différemment. Nous continuons à tester les nouvelles pages et à corriger les obstacles identifiés.", feedback: "Signaler un obstacle", feedbackBody: "Si un élément vous empêche d’utiliser le site, contactez-nous en indiquant l’adresse de la page, l’action souhaitée et l’appareil ou le navigateur utilisé. Nous examinerons votre message dans les meilleurs délais.", contact: "Nous contacter", reviewed: "Dernière révision : 27 juillet 2026", home: "Retour à SpaPlus Global", language: "Langue de la déclaration" },
  ru: { title: "Заявление о доступности", intro: "SpaPlus Global стремится сделать цифровой сервис удобным для максимально широкого круга людей, включая людей с инвалидностью.", measures: "Что реализовано", measuresBody: "На сайте предусмотрены навигация с клавиатуры, заметный фокус, семантические заголовки, подписи и обратная связь в формах, альтернативный текст, адаптивная верстка, поддержка уменьшения анимации и настройки размера текста, контраста и отображения ссылок.", standard: "Наш подход", standardBody: "При разработке и проверке сайта мы используем WCAG 2.2 уровня AA как целевой ориентир. Это заявление описывает выполненную работу и не является официальным юридическим подтверждением полной совместимости.", limits: "Известные ограничения", limitsBody: "Контент внешних сервисов, старые браузеры и настройки устройства могут работать иначе. Мы продолжаем тестировать новые страницы и устранять выявленные препятствия.", feedback: "Сообщить о препятствии", feedbackBody: "Если что-либо мешает пользоваться сайтом, напишите нам, указав адрес страницы, желаемое действие, устройство и браузер. Мы рассмотрим обращение и ответим в разумный срок.", contact: "Связаться с нами", reviewed: "Последняя проверка: 27 июля 2026 года", home: "Вернуться в SpaPlus Global", language: "Язык заявления" },
  el: { title: "Δήλωση προσβασιμότητας", intro: "Η SpaPlus Global δεσμεύεται να κάνει την ψηφιακή εμπειρία εύχρηστη για όσο το δυνατόν περισσότερους ανθρώπους, συμπεριλαμβανομένων των ατόμων με αναπηρία.", measures: "Τι έχουμε εφαρμόσει", measuresBody: "Ο ιστότοπος περιλαμβάνει πλοήγηση με πληκτρολόγιο, ορατή εστίαση, σημασιολογικές επικεφαλίδες, ετικέτες και μηνύματα στις φόρμες, εναλλακτικό κείμενο, προσαρμοστική διάταξη, υποστήριξη μειωμένης κίνησης και ρυθμίσεις για μέγεθος κειμένου, αντίθεση και συνδέσμους.", standard: "Η προσέγγισή μας", standardBody: "Σχεδιάζουμε και ελέγχουμε τον ιστότοπο με στόχο τις WCAG 2.2 επιπέδου AA. Η δήλωση περιγράφει τις ενέργειες που έχουν γίνει και δεν αποτελεί επίσημη νομική πιστοποίηση πλήρους συμμόρφωσης.", limits: "Γνωστοί περιορισμοί", limitsBody: "Περιεχόμενο εξωτερικών υπηρεσιών, παλαιότερα προγράμματα περιήγησης ή ρυθμίσεις συσκευών μπορεί να λειτουργούν διαφορετικά. Συνεχίζουμε να ελέγχουμε νέες σελίδες και να διορθώνουμε εμπόδια.", feedback: "Αναφέρετε ένα εμπόδιο", feedbackBody: "Αν κάτι σας εμποδίζει να χρησιμοποιήσετε τον ιστότοπο, επικοινωνήστε μαζί μας αναφέροντας τη σελίδα, τι προσπαθήσατε να κάνετε και τη συσκευή ή το πρόγραμμα περιήγησης. Θα εξετάσουμε το αίτημα το συντομότερο δυνατό.", contact: "Επικοινωνία", reviewed: "Τελευταίος έλεγχος: 27 Ιουλίου 2026", home: "Επιστροφή στο SpaPlus Global", language: "Γλώσσα δήλωσης" },
  it: { title: "Dichiarazione di accessibilità", intro: "SpaPlus Global si impegna a rendere la propria esperienza digitale utilizzabile dal maggior numero possibile di persone, comprese le persone con disabilità.", measures: "Cosa abbiamo implementato", measuresBody: "Il sito include navigazione da tastiera, indicatori di focus visibili, titoli semantici, etichette e riscontri nei moduli, testi alternativi, layout responsive, supporto per la riduzione delle animazioni e controlli per dimensione del testo, contrasto e visibilità dei link.", standard: "Il nostro approccio", standardBody: "Progettiamo e verifichiamo il sito prendendo come obiettivo le WCAG 2.2 livello AA. Questa dichiarazione descrive il lavoro svolto e non costituisce una certificazione legale di piena conformità.", limits: "Limitazioni note", limitsBody: "I contenuti forniti da servizi esterni, browser datati o impostazioni del dispositivo possono comportarsi in modo diverso. Continuiamo a testare le nuove pagine e a correggere le barriere individuate.", feedback: "Segnala una barriera", feedbackBody: "Se qualcosa impedisce di usare il sito, contattaci indicando l’indirizzo della pagina, l’operazione desiderata e il dispositivo o browser utilizzato. Esamineremo la segnalazione appena possibile.", contact: "Contattaci", reviewed: "Ultima revisione: 27 luglio 2026", home: "Torna a SpaPlus Global", language: "Lingua della dichiarazione" },
  hu: { title: "Akadálymentességi nyilatkozat", intro: "A SpaPlus Global célja, hogy digitális felülete a lehető legtöbb ember, köztük a fogyatékossággal élők számára is használható legyen.", measures: "Megvalósított intézkedések", measuresBody: "A webhely támogatja a billentyűzetes navigációt, a jól látható fókuszt, a szemantikus címsorokat, az űrlapcímkéket és visszajelzéseket, az alternatív szövegeket, a reszponzív elrendezést, a csökkentett mozgást, valamint a szövegméret, a kontraszt és a hivatkozások láthatóságának beállítását.", standard: "Megközelítésünk", standardBody: "A webhelyet a WCAG 2.2 AA szintjét célul kitűzve tervezzük és ellenőrizzük. Ez a nyilatkozat az elvégzett munkát írja le, és nem minősül a teljes megfelelőség hivatalos jogi tanúsításának.", limits: "Ismert korlátok", limitsBody: "A külső szolgáltatások tartalma, a régebbi böngészők vagy az eszközbeállítások eltérően működhetnek. Az új oldalakat folyamatosan teszteljük, a feltárt akadályokat javítjuk.", feedback: "Akadály bejelentése", feedbackBody: "Ha valami akadályozza a webhely használatát, írja meg az oldal címét, a kívánt műveletet, valamint a használt eszközt és böngészőt. A jelzést a lehető leghamarabb megvizsgáljuk.", contact: "Kapcsolat", reviewed: "Utolsó felülvizsgálat: 2026. július 27.", home: "Vissza a SpaPlus Global oldalára", language: "A nyilatkozat nyelve" },
  pl: { title: "Deklaracja dostępności", intro: "SpaPlus Global dąży do tego, aby jej serwis cyfrowy był użyteczny dla jak największej liczby osób, w tym osób z niepełnosprawnościami.", measures: "Wprowadzone rozwiązania", measuresBody: "Serwis oferuje obsługę klawiaturą, widoczne oznaczenie fokusu, semantyczne nagłówki, etykiety i komunikaty formularzy, teksty alternatywne, układ responsywny, obsługę ograniczenia ruchu oraz ustawienia wielkości tekstu, kontrastu i widoczności linków.", standard: "Nasze podejście", standardBody: "Projektujemy i sprawdzamy serwis, traktując WCAG 2.2 na poziomie AA jako cel. Deklaracja opisuje wykonane prace i nie jest formalnym prawnym potwierdzeniem pełnej zgodności.", limits: "Znane ograniczenia", limitsBody: "Treści z usług zewnętrznych, starsze przeglądarki lub ustawienia urządzenia mogą działać inaczej. Nadal testujemy nowe strony i usuwamy rozpoznane bariery.", feedback: "Zgłoś barierę", feedbackBody: "Jeśli coś utrudnia korzystanie z serwisu, skontaktuj się z nami i podaj adres strony, wykonywaną czynność oraz używane urządzenie lub przeglądarkę. Zajmiemy się zgłoszeniem możliwie szybko.", contact: "Kontakt", reviewed: "Ostatni przegląd: 27 lipca 2026", home: "Powrót do SpaPlus Global", language: "Język deklaracji" },
  es: { title: "Declaración de accesibilidad", intro: "SpaPlus Global se compromete a que su experiencia digital pueda ser utilizada por el mayor número posible de personas, incluidas las personas con discapacidad.", measures: "Medidas implementadas", measuresBody: "El sitio incluye navegación por teclado, foco visible, encabezados semánticos, etiquetas y avisos en formularios, textos alternativos, diseño adaptable, compatibilidad con la reducción de movimiento y controles para el tamaño del texto, el contraste y la visibilidad de los enlaces.", standard: "Nuestro enfoque", standardBody: "Diseñamos y revisamos el sitio tomando como objetivo las WCAG 2.2 de nivel AA. Esta declaración describe el trabajo realizado y no constituye una certificación legal formal de conformidad total.", limits: "Limitaciones conocidas", limitsBody: "El contenido de servicios externos, los navegadores antiguos o la configuración del dispositivo pueden comportarse de forma diferente. Seguimos probando páginas nuevas y corrigiendo las barreras detectadas.", feedback: "Comunicar una barrera", feedbackBody: "Si algo le impide utilizar el sitio, contáctenos e indique la dirección de la página, la acción que quería realizar y el dispositivo o navegador utilizado. Revisaremos el aviso lo antes posible.", contact: "Contacto", reviewed: "Última revisión: 27 de julio de 2026", home: "Volver a SpaPlus Global", language: "Idioma de la declaración" },
  de: { title: "Erklärung zur Barrierefreiheit", intro: "SpaPlus Global setzt sich dafür ein, dass möglichst viele Menschen das digitale Angebot nutzen können, auch Menschen mit Behinderungen.", measures: "Umgesetzte Maßnahmen", measuresBody: "Die Website unterstützt Tastaturnavigation, deutlich sichtbare Fokusmarkierungen, semantische Überschriften, beschriftete Formulare mit Rückmeldungen, Alternativtexte, responsive Layouts, reduzierte Bewegung sowie Einstellungen für Textgröße, Kontrast und Linkdarstellung.", standard: "Unser Ansatz", standardBody: "Bei Gestaltung und Prüfung orientieren wir uns an WCAG 2.2 auf Konformitätsstufe AA. Diese Erklärung beschreibt die umgesetzten Maßnahmen und ist keine formelle rechtliche Zertifizierung vollständiger Konformität.", limits: "Bekannte Einschränkungen", limitsBody: "Inhalte externer Dienste, ältere Browser oder Geräteeinstellungen können sich abweichend verhalten. Neue Seiten werden weiter geprüft und erkannte Barrieren behoben.", feedback: "Barriere melden", feedbackBody: "Wenn Sie die Website an einer Stelle nicht nutzen können, senden Sie uns bitte die Seitenadresse, die gewünschte Aktion sowie Gerät und Browser. Wir prüfen die Meldung so schnell wie möglich.", contact: "Kontakt", reviewed: "Zuletzt geprüft: 27. Juli 2026", home: "Zurück zu SpaPlus Global", language: "Sprache der Erklärung" },
  nl: { title: "Toegankelijkheidsverklaring", intro: "SpaPlus Global wil de digitale ervaring bruikbaar maken voor zoveel mogelijk mensen, waaronder mensen met een beperking.", measures: "Wat we hebben ingevoerd", measuresBody: "De website ondersteunt toetsenbordnavigatie, duidelijke focusmarkering, semantische koppen, labels en feedback bij formulieren, alternatieve teksten, responsieve lay-outs, minder beweging en instellingen voor tekstgrootte, contrast en zichtbaarheid van links.", standard: "Onze aanpak", standardBody: "Bij ontwerp en controle gebruiken we WCAG 2.2 niveau AA als doel. Deze verklaring beschrijft het uitgevoerde werk en is geen formele juridische certificering van volledige conformiteit.", limits: "Bekende beperkingen", limitsBody: "Inhoud van externe diensten, oudere browsers of apparaatinstellingen kan anders werken. We blijven nieuwe pagina’s testen en gevonden belemmeringen oplossen.", feedback: "Een belemmering melden", feedbackBody: "Kunt u iets op de website niet gebruiken, stuur ons dan het adres van de pagina, wat u wilde doen en welk apparaat of welke browser u gebruikte. We bekijken de melding zo snel mogelijk.", contact: "Contact", reviewed: "Laatst beoordeeld: 27 juli 2026", home: "Terug naar SpaPlus Global", language: "Taal van de verklaring" },
  sv: { title: "Tillgänglighetsredogörelse", intro: "SpaPlus Global arbetar för att den digitala upplevelsen ska kunna användas av så många som möjligt, även personer med funktionsnedsättning.", measures: "Detta har vi genomfört", measuresBody: "Webbplatsen har tangentbordsnavigering, tydlig fokusmarkering, semantiska rubriker, etiketter och återkoppling i formulär, alternativtexter, responsiv layout, stöd för minskad rörelse samt inställningar för textstorlek, kontrast och länkar.", standard: "Vårt arbetssätt", standardBody: "Vi utformar och granskar webbplatsen med WCAG 2.2 nivå AA som mål. Redogörelsen beskriver utfört arbete och är inte en formell juridisk certifiering av full överensstämmelse.", limits: "Kända begränsningar", limitsBody: "Innehåll från externa tjänster, äldre webbläsare eller enhetsinställningar kan fungera annorlunda. Vi fortsätter att testa nya sidor och åtgärda hinder som upptäcks.", feedback: "Rapportera ett hinder", feedbackBody: "Om något hindrar dig från att använda webbplatsen, kontakta oss med sidans adress, vad du försökte göra samt enhet och webbläsare. Vi granskar rapporten så snart som möjligt.", contact: "Kontakta oss", reviewed: "Senast granskad: 27 juli 2026", home: "Tillbaka till SpaPlus Global", language: "Redogörelsens språk" },
  nb: { title: "Tilgjengelighetserklæring", intro: "SpaPlus Global arbeider for at den digitale opplevelsen skal kunne brukes av så mange som mulig, også personer med funksjonsnedsettelser.", measures: "Dette har vi gjennomført", measuresBody: "Nettstedet støtter tastaturnavigasjon, tydelig fokusmarkering, semantiske overskrifter, etiketter og tilbakemeldinger i skjemaer, alternativ tekst, responsiv utforming, redusert bevegelse og innstillinger for tekststørrelse, kontrast og lenker.", standard: "Vår tilnærming", standardBody: "Vi utformer og vurderer nettstedet med WCAG 2.2 nivå AA som mål. Erklæringen beskriver arbeidet som er gjort og er ikke en formell juridisk sertifisering av full samsvar.", limits: "Kjente begrensninger", limitsBody: "Innhold fra eksterne tjenester, eldre nettlesere eller enhetsinnstillinger kan fungere annerledes. Vi fortsetter å teste nye sider og rette barrierer som blir oppdaget.", feedback: "Meld fra om en barriere", feedbackBody: "Hvis noe hindrer deg i å bruke nettstedet, kontakt oss med sideadressen, hva du forsøkte å gjøre, samt enhet og nettleser. Vi vurderer meldingen så snart som mulig.", contact: "Kontakt oss", reviewed: "Sist gjennomgått: 27. juli 2026", home: "Tilbake til SpaPlus Global", language: "Språk for erklæringen" },
};

const locales = [
  ["en", "en", "ltr"], ["he", "he", "rtl"], ["fr-ca", "fr", "ltr"], ["ru", "ru", "ltr"], ["el", "el", "ltr"],
  ["it", "it", "ltr"], ["hu", "hu", "ltr"], ["pl", "pl", "ltr"], ["es", "es", "ltr"], ["en-us", "en", "ltr"],
  ["el-cy", "el", "ltr"], ["el-gr", "el", "ltr"], ["hu-hu", "hu", "ltr"], ["it-it", "it", "ltr"],
  ["en-gb", "en", "ltr"], ["de-de", "de", "ltr"], ["fr-fr", "fr", "ltr"], ["nl-nl", "nl", "ltr"],
  ["sv-se", "sv", "ltr"], ["nb-no", "nb", "ltr"], ["de-ch", "de", "ltr"], ["en-ae", "en", "ltr"],
];

const names = {
  en: "English", he: "עברית", "fr-ca": "Français canadien", ru: "Русский", el: "Ελληνικά", it: "Italiano",
  hu: "Magyar", pl: "Polski", es: "Español", "en-us": "English, United States", "el-cy": "Ελληνικά, Κύπρος",
  "el-gr": "Ελληνικά, Ελλάδα", "hu-hu": "Magyar, Magyarország", "it-it": "Italiano, Italia",
  "en-gb": "English, United Kingdom", "de-de": "Deutsch, Deutschland", "fr-fr": "Français, France",
  "nl-nl": "Nederlands", "sv-se": "Svenska", "nb-no": "Norsk", "de-ch": "Deutsch, Schweiz", "en-ae": "English, UAE",
};

const statementLabels = {
  en: "Accessibility statement", he: "הצהרת נגישות", "fr-ca": "Déclaration d’accessibilité",
  ru: "Заявление о доступности", el: "Δήλωση προσβασιμότητας", it: "Dichiarazione di accessibilità",
  hu: "Akadálymentességi nyilatkozat", pl: "Deklaracja dostępności", es: "Declaración de accesibilidad",
  "en-us": "Accessibility statement", "el-cy": "Δήλωση προσβασιμότητας", "el-gr": "Δήλωση προσβασιμότητας",
  "hu-hu": "Akadálymentességi nyilatkozat", "it-it": "Dichiarazione di accessibilità",
  "en-gb": "Accessibility statement", "de-de": "Erklärung zur Barrierefreiheit",
  "fr-fr": "Déclaration d’accessibilité", "nl-nl": "Toegankelijkheidsverklaring",
  "sv-se": "Tillgänglighetsredogörelse", "nb-no": "Tilgjengelighetserklæring",
  "de-ch": "Erklärung zur Barrierefreiheit", "en-ae": "Accessibility statement",
};

function page(locale, lang, dir) {
  const t = copy[lang] || copy.en;
  const homeLocale = ({ "en-us": "en", "en-gb": "en", "en-ae": "en", "el-cy": "el", "el-gr": "el", "hu-hu": "hu", "it-it": "it", "fr-fr": "fr-ca", "de-de": "en", "de-ch": "en", "nl-nl": "en", "sv-se": "en", "nb-no": "en" })[locale] || locale;
  const languageLinks = locales.map(([route]) => `<a href="/spaplus-global/${route}/accessibility/"${route === locale ? ' aria-current="page"' : ""}>${names[route]}</a>`).join("");
  const alternateLinks = locales.map(([route]) => `  <link rel="alternate" hreflang="${route}" href="https://global.spaplus.co/${route}/accessibility/">`).join("\n");
  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${t.title} | SpaPlus Global</title>
  <meta name="description" content="${t.intro}">
  <link rel="canonical" href="https://global.spaplus.co/${locale}/accessibility/">
${alternateLinks}
  <link rel="alternate" hreflang="x-default" href="https://global.spaplus.co/en/accessibility/">
  <link rel="stylesheet" href="/spaplus-global/accessibility.css?v=20260805-1">
  <style>
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#f8f5f7;color:#172d4d;font-family:Arial,"Noto Sans",sans-serif;line-height:1.75}.skip{position:absolute;inset-inline-start:1rem;top:-5rem;background:#fff;color:#172d4d;padding:.8rem 1rem;z-index:10}.skip:focus{top:1rem}header,main,footer{width:min(980px,calc(100% - 32px));margin:auto}header{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:24px 0;border-bottom:1px solid #d9dee7}.brand{font-size:1.35rem;font-weight:800;color:#172d4d;text-decoration:none}.home{color:#d81459;font-weight:700}main{padding:64px 0}article{background:#fff;border:1px solid #d9dee7;border-radius:28px;padding:clamp(24px,5vw,64px);box-shadow:0 18px 55px rgb(23 45 77 / 8%)}.eyebrow{color:#d81459;font-weight:800;letter-spacing:.12em;text-transform:uppercase}h1{font-size:clamp(2.25rem,7vw,4.8rem);line-height:1.02;margin:.15em 0 .45em}h2{font-size:clamp(1.35rem,3vw,2rem);line-height:1.25;margin-top:2rem}.contact{display:inline-flex;margin-top:1rem;border-radius:999px;background:#ed1760;color:#fff;padding:.8rem 1.3rem;text-decoration:none;font-weight:800}.reviewed{margin-top:2rem;padding-top:1.25rem;border-top:1px solid #d9dee7;font-weight:700}.languages{padding:28px 0}.languages h2{font-size:1.1rem;margin-top:0}.languages nav{display:flex;flex-wrap:wrap;gap:.55rem 1rem}.languages a{color:#172d4d}.languages a[aria-current="page"]{font-weight:800;text-decoration-thickness:3px}footer{padding:20px 0 44px;border-top:1px solid #d9dee7}.management-login-link{display:inline-block;margin-top:10px;color:#d81459;font-weight:700}a:focus-visible,button:focus-visible{outline:4px solid #ed1760;outline-offset:4px}@media(max-width:600px){header{align-items:flex-start;flex-direction:column}main{padding:32px 0}}
  </style>
</head>
<body>
  <a class="skip" href="#main">${lang === "he" ? "דילוג לתוכן" : "Skip to content"}</a>
  <header><a class="brand" href="/spaplus-global/${homeLocale}/">SpaPlus Global</a><a class="home" href="/spaplus-global/${homeLocale}/">${t.home}</a></header>
  <main id="main">
    <article>
      <p class="eyebrow">GLOBAL SPA MANAGEMENT LTD</p>
      <h1>${t.title}</h1>
      <p>${t.intro}</p>
      <h2>${t.measures}</h2><p>${t.measuresBody}</p>
      <h2>${t.standard}</h2><p>${t.standardBody}</p>
      <h2>${t.limits}</h2><p>${t.limitsBody}</p>
      <h2>${t.feedback}</h2><p>${t.feedbackBody}</p>
      <a class="contact" href="/spaplus-global/${homeLocale}/#contact">${t.contact}</a>
      <p class="reviewed">${t.reviewed}</p>
    </article>
    <section class="languages" aria-labelledby="statement-languages"><h2 id="statement-languages">${t.language}</h2><nav>${languageLinks}</nav></section>
  </main>
  <footer><strong>GLOBAL SPA MANAGEMENT LTD</strong><br>© 2026 SpaPlus Global</footer>
  <script src="/spaplus-global/accessibility.js?v=20260805-1" defer></script>
</body>
</html>`;
}

for (const [locale, lang, dir] of locales) {
  const directory = path.join(output, locale, "accessibility");
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, "index.html"), page(locale, lang, dir), "utf8");
}

const sitemapPath = path.join(output, "sitemap.xml");
try {
  let sitemap = await fs.readFile(sitemapPath, "utf8");
  sitemap = sitemap.replace(/\s*<url><loc>https:\/\/global\.spaplus\.co\/[^<]+\/accessibility\/<\/loc><lastmod>[^<]+<\/lastmod><\/url>/g, "");
  const accessibilityUrls = locales
    .map(([locale]) => `  <url><loc>https://global.spaplus.co/${locale}/accessibility/</loc><lastmod>2026-07-27</lastmod></url>`)
    .join("\n");
  sitemap = sitemap.replace("</urlset>", `${accessibilityUrls}\n</urlset>`);
  await fs.writeFile(sitemapPath, sitemap, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

for (const file of await walk(output)) {
  if (file.includes(`${path.sep}accessibility${path.sep}`)) continue;
  let html = await fs.readFile(file, "utf8");
  const relative = path.relative(output, file).split(path.sep);
  const routeLocale = locales.some(([locale]) => locale === relative[0]) ? relative[0] : "en";
  const href = `/spaplus-global/${routeLocale}/accessibility/`;
  html = html
    .replace(/\sclass="global-accessibility-link"/g, "")
    .replace(/<link rel="stylesheet" href="\/spaplus-global\/accessibility\.css[^"]*">\s*/g, "")
    .replace(/<script src="\/spaplus-global\/accessibility\.js[^"]*" defer><\/script>\s*/g, "")
    .replace(/href="\/(?:spaplus-global\/)?(?:en|he|fr-ca|ru|el|it|hu|pl|es)\/accessibility\/"/gi, `href="${href}"`)
    .replace(/href="(?:[^"]*\/)?#accessibility"/g, `href="${href}"`)
    .replace(/href="\/spaplus-global\/[^"]+\/#accessibility"/g, `href="${href}"`);
  html = html.replace("</head>", `  <link rel="stylesheet" href="/spaplus-global/accessibility.css?v=20260805-1">\n</head>`);
  if (!html.includes(`href="${href}"`)) {
    const label = statementLabels[routeLocale] || statementLabels.en;
    html = html.replace(/<\/footer>/, `<a class="global-accessibility-link" href="${href}">${label}</a>\n  </footer>`);
  } else {
    html = html.replace(new RegExp(`(<a\\s+)([^>]*href="${href.replaceAll("/", "\\/")}")`, "g"), "$1class=\"global-accessibility-link\" $2");
  }
  html = html.replace(/\s*<a\b[^>]*class="[^"]*management-login-link[^"]*"[^>]*>[^<]*<\/a>/gi, "");
  html = html.replace("</body>", `  <script src="/spaplus-global/accessibility.js?v=20260805-1" defer></script>\n</body>`);
  await fs.writeFile(file, html, "utf8");
}

console.log(`Generated ${locales.length} localized accessibility statements and updated public pages.`);
