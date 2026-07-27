(() => {
  const text = {
    en: { open: "Accessibility", title: "Accessibility options", close: "Close accessibility options", larger: "Increase text size", smaller: "Decrease text size", contrast: "High contrast", links: "Underline links", motion: "Reduce motion", reset: "Reset settings", statement: "Accessibility statement" },
    he: { open: "נגישות", title: "אפשרויות נגישות", close: "סגירת אפשרויות נגישות", larger: "הגדלת הטקסט", smaller: "הקטנת הטקסט", contrast: "ניגודיות גבוהה", links: "הדגשת קישורים", motion: "הפחתת תנועה", reset: "איפוס הגדרות", statement: "הצהרת נגישות" },
    fr: { open: "Accessibilité", title: "Options d’accessibilité", close: "Fermer les options d’accessibilité", larger: "Agrandir le texte", smaller: "Réduire le texte", contrast: "Contraste élevé", links: "Souligner les liens", motion: "Réduire les animations", reset: "Réinitialiser", statement: "Déclaration d’accessibilité" },
    ru: { open: "Доступность", title: "Настройки доступности", close: "Закрыть настройки доступности", larger: "Увеличить текст", smaller: "Уменьшить текст", contrast: "Высокая контрастность", links: "Подчеркнуть ссылки", motion: "Уменьшить анимацию", reset: "Сбросить настройки", statement: "Заявление о доступности" },
    el: { open: "Προσβασιμότητα", title: "Επιλογές προσβασιμότητας", close: "Κλείσιμο επιλογών προσβασιμότητας", larger: "Μεγέθυνση κειμένου", smaller: "Σμίκρυνση κειμένου", contrast: "Υψηλή αντίθεση", links: "Υπογράμμιση συνδέσμων", motion: "Μείωση κίνησης", reset: "Επαναφορά ρυθμίσεων", statement: "Δήλωση προσβασιμότητας" },
    it: { open: "Accessibilità", title: "Opzioni di accessibilità", close: "Chiudi le opzioni di accessibilità", larger: "Aumenta il testo", smaller: "Riduci il testo", contrast: "Contrasto elevato", links: "Sottolinea i link", motion: "Riduci le animazioni", reset: "Ripristina", statement: "Dichiarazione di accessibilità" },
    hu: { open: "Akadálymentesség", title: "Akadálymentesítési beállítások", close: "Beállítások bezárása", larger: "Szöveg nagyítása", smaller: "Szöveg kicsinyítése", contrast: "Nagy kontraszt", links: "Hivatkozások aláhúzása", motion: "Mozgás csökkentése", reset: "Beállítások visszaállítása", statement: "Akadálymentességi nyilatkozat" },
    pl: { open: "Dostępność", title: "Opcje dostępności", close: "Zamknij opcje dostępności", larger: "Powiększ tekst", smaller: "Zmniejsz tekst", contrast: "Wysoki kontrast", links: "Podkreśl linki", motion: "Ogranicz animacje", reset: "Zresetuj ustawienia", statement: "Deklaracja dostępności" },
    es: { open: "Accesibilidad", title: "Opciones de accesibilidad", close: "Cerrar opciones de accesibilidad", larger: "Aumentar texto", smaller: "Reducir texto", contrast: "Alto contraste", links: "Subrayar enlaces", motion: "Reducir movimiento", reset: "Restablecer", statement: "Declaración de accesibilidad" },
    de: { open: "Barrierefreiheit", title: "Einstellungen zur Barrierefreiheit", close: "Einstellungen schließen", larger: "Text vergrößern", smaller: "Text verkleinern", contrast: "Hoher Kontrast", links: "Links unterstreichen", motion: "Bewegung reduzieren", reset: "Einstellungen zurücksetzen", statement: "Erklärung zur Barrierefreiheit" },
    nl: { open: "Toegankelijkheid", title: "Toegankelijkheidsopties", close: "Opties sluiten", larger: "Tekst vergroten", smaller: "Tekst verkleinen", contrast: "Hoog contrast", links: "Links onderstrepen", motion: "Beweging verminderen", reset: "Instellingen herstellen", statement: "Toegankelijkheidsverklaring" },
    sv: { open: "Tillgänglighet", title: "Tillgänglighetsalternativ", close: "Stäng alternativen", larger: "Förstora text", smaller: "Minska text", contrast: "Hög kontrast", links: "Stryk under länkar", motion: "Minska rörelse", reset: "Återställ", statement: "Tillgänglighetsredogörelse" },
    nb: { open: "Tilgjengelighet", title: "Tilgjengelighetsvalg", close: "Lukk valgene", larger: "Forstørr tekst", smaller: "Reduser tekst", contrast: "Høy kontrast", links: "Understrek lenker", motion: "Reduser bevegelse", reset: "Tilbakestill", statement: "Tilgjengelighetserklæring" },
  };

  const localeMap = {
    "fr-ca": "fr-ca", "fr-fr": "fr-fr", "el-cy": "el-cy", "el-gr": "el-gr",
    "hu-hu": "hu-hu", "it-it": "it-it", "en-us": "en-us", "en-gb": "en-gb",
    "de-de": "de-de", "nl-nl": "nl-nl", "sv-se": "sv-se", "nb-no": "nb-no",
    "de-ch": "de-ch", "en-ae": "en-ae",
  };

  const queryLanguage = new URLSearchParams(location.search).get("lang")?.toLowerCase();
  const documentLanguage = (queryLanguage || document.documentElement.lang || "en").toLowerCase();
  const language = documentLanguage.split("-")[0];
  const copy = text[language] || text.en;
  const pathLocale = location.pathname.split("/").filter(Boolean)[1];
  const statementLocale = localeMap[pathLocale] || localeMap[documentLanguage] || (["he", "ru", "el", "it", "hu", "pl", "es"].includes(language) ? language : language === "fr" ? "fr-ca" : "en");
  const statementHref = `/spaplus-global/${statementLocale}/accessibility/`;
  document.querySelectorAll(".global-accessibility-link").forEach((link) => {
    link.href = statementHref;
  });

  const stateKey = "spaplus-accessibility-v1";
  let state = { textSize: 0, contrast: false, links: false, motion: false };
  try {
    state = { ...state, ...JSON.parse(localStorage.getItem(stateKey) || "{}") };
  } catch {}

  const root = document.documentElement;
  function apply() {
    root.classList.toggle("a11y-text-lg", state.textSize === 1);
    root.classList.toggle("a11y-text-xl", state.textSize === 2);
    root.classList.toggle("a11y-contrast", state.contrast);
    root.classList.toggle("a11y-underline-links", state.links);
    root.classList.toggle("a11y-reduce-motion", state.motion);
    try { localStorage.setItem(stateKey, JSON.stringify(state)); } catch {}
    document.querySelector('[data-a11y="contrast"]')?.setAttribute("aria-pressed", String(state.contrast));
    document.querySelector('[data-a11y="links"]')?.setAttribute("aria-pressed", String(state.links));
    document.querySelector('[data-a11y="motion"]')?.setAttribute("aria-pressed", String(state.motion));
  }

  const launcher = document.createElement("button");
  launcher.className = "a11y-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "spaplus-a11y-panel");
  launcher.textContent = copy.open;

  const panel = document.createElement("section");
  panel.className = "a11y-panel";
  panel.id = "spaplus-a11y-panel";
  panel.hidden = true;
  panel.setAttribute("aria-labelledby", "spaplus-a11y-title");
  panel.innerHTML = `
    <div class="a11y-panel-header">
      <h2 class="a11y-panel-title" id="spaplus-a11y-title">${copy.title}</h2>
      <button class="a11y-panel-close" type="button" aria-label="${copy.close}">×</button>
    </div>
    <div class="a11y-controls">
      <button class="a11y-control" type="button" data-a11y="larger">${copy.larger}</button>
      <button class="a11y-control" type="button" data-a11y="smaller">${copy.smaller}</button>
      <button class="a11y-control" type="button" data-a11y="contrast" aria-pressed="false">${copy.contrast}</button>
      <button class="a11y-control" type="button" data-a11y="links" aria-pressed="false">${copy.links}</button>
      <button class="a11y-control" type="button" data-a11y="motion" aria-pressed="false">${copy.motion}</button>
      <button class="a11y-control" type="button" data-a11y="reset">${copy.reset}</button>
      <a class="a11y-statement-link" href="${statementHref}">${copy.statement}</a>
    </div>`;

  function closePanel() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }

  launcher.addEventListener("click", () => {
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    launcher.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) panel.querySelector("button")?.focus();
  });
  panel.querySelector(".a11y-panel-close").addEventListener("click", closePanel);
  panel.addEventListener("click", (event) => {
    const action = event.target.closest("[data-a11y]")?.dataset.a11y;
    if (!action) return;
    if (action === "larger") state.textSize = Math.min(2, state.textSize + 1);
    if (action === "smaller") state.textSize = Math.max(0, state.textSize - 1);
    if (action === "contrast") state.contrast = !state.contrast;
    if (action === "links") state.links = !state.links;
    if (action === "motion") state.motion = !state.motion;
    if (action === "reset") state = { textSize: 0, contrast: false, links: false, motion: false };
    apply();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) closePanel();
  });

  document.body.append(panel, launcher);
  apply();
})();
