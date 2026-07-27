import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const localeCodes = ["en", "he", "fr-CA", "ru", "el", "it", "hu", "pl", "es"];
const accessibilityRoutes = [
  "en", "he", "fr-ca", "ru", "el", "it", "hu", "pl", "es", "en-us", "el-cy",
  "el-gr", "hu-hu", "it-it", "en-gb", "de-de", "fr-fr", "nl-nl", "sv-se",
  "nb-no", "de-ch", "en-ae",
];

async function read(path) {
  return readFile(new URL(path, root), "utf8");
}

test("static preview is a complete standalone website", async () => {
  const html = await read("codepen/index.html");

  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<meta charset="utf-8">/i);
  assert.match(html, /href="\.\/style\.css\?v=[^"]+"/i);
  assert.match(html, /src="\.\/script\.js\?v=[^"]+"/i);

  for (const id of [
    "main-content",
    "top",
    "countries",
    "vision",
    "better-day",
    "products",
    "global-partners",
    "story",
    "contact",
    "about",
    "privacy",
    "accessibility",
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }

  assert.match(html, /class="founder-photo"/);
  assert.match(html, /class="contact-form"/);
  assert.match(html, /class="contact-assurance"/);
  assert.match(html, /class="privacy-consent form-wide"/);
  assert.match(html, /name="privacy" type="checkbox" value="accepted" required/);
  assert.match(html, /class="legal-section"/);
  assert.match(html, /class="audience-grid"/);
  assert.match(html, /class="products-grid"/);
  assert.match(html, /class="growth-section"/);
  assert.doesNotMatch(html, /info@spaplus\.ca/);
  assert.match(html, /class="back-to-top"/);
  assert.match(html, /class="success-modal"/);
  assert.match(html, /role="dialog"/);
  assert.match(html, /data-team-group="leadership"/);
  assert.match(html, /data-team-group="technology"/);
  assert.match(html, /data-team-group="business"/);
  assert.match(html, /href="https:\/\/www\.spaplus\.co\.il\/"/);
  assert.match(html, /class="country-card canada-card" href="#contact"/);
  assert.doesNotMatch(html, /href="https:\/\/(?:www\.)?spaplus\.ca/);
  assert.match(html, /class="usa-flag"/);
  assert.match(html, /class="usa-coming">COMING SOON/);
  assert.match(html, /class="global-route"/);
  assert.match(html, /class="route-node route-israel"/);
  assert.match(html, /class="route-node route-canada"/);
  assert.match(html, /class="route-node route-usa"/);
  assert.match(html, /class="platform-pillars"/);
  assert.match(html, /class="scroll-progress"/);
  assert.match(html, /class="atmosphere-section"/);
  assert.match(html, /src="\.\/vision-resort\.webp"/);
  assert.match(html, /src="\.\/vision-people\.webp"/);
  assert.match(html, /src="\.\/vision-ritual\.webp"/);
});

test("all nine localized experiences are included", async () => {
  const html = await read("codepen/index.html");
  const script = await read("codepen/script.js");

  for (const locale of localeCodes) {
    assert.match(script, new RegExp(`"${locale}"\\s*:`));
  }

  assert.match(script, /new URLSearchParams\(location\.search\)\.get\("lang"\)/);
  assert.match(script, /history\.replaceState/);
  assert.match(script, /founderPhotoDataUri/);
  assert.match(script, /spaplus-mark\.png/);
  assert.match(script, /spaplus-wordmark\.png/);
  assert.match(script, /contactForm\.addEventListener\("submit"/);
  assert.match(script, /backToTopButton\.addEventListener\("click"/);
  assert.match(html, /class="share-page"/);
  assert.match(script, /shareButton\.addEventListener\("click"/);
  assert.match(script, /navigator\.share/);
  assert.match(script, /navigator\.clipboard\.writeText\(location\.href\)/);
  assert.match(script, /companyData\.linkCopied\[activeLocale\]/);
  assert.match(script, /setText\("\.usa-status-local", t\.comingSoon\)/);
  assert.match(script, /setText\("\.route-israel strong", t\.israelName\)/);
  assert.match(script, /setAllText\("\.platform-pillars span", platformPillars\[locale\]\)/);
  assert.match(script, /scrollProgress\.style\.transform/);
  assert.match(script, /chatgpt\.site\/api\/contact/);
  assert.match(script, /submissionId: crypto\.randomUUID\(\)/);
  assert.match(script, /contactFormFallbackEndpoint/);
  assert.match(script, /formsubmit\.co\/ajax/);
  assert.match(script, /await fetch\(contactFormEndpoint/);
  assert.match(script, /openSuccessModal\(\)/);
  assert.match(script, /privacyAccepted,/);
  assert.match(script, /setText\("#privacy summary", t\.privacyTitle\)/);
  assert.match(script, /setAllText\("\.products-heading > \*"/);
  assert.match(script, /successModalClose\.focus\(\)/);
  assert.doesNotMatch(script, /djskabi@gmail\.com/);
  assert.match(script, /"Roy Plombo"/);
  assert.match(script, /"Shahaf Yifrah"/);
  assert.match(script, /"Shahar Turgeman"/);
  assert.match(script, /"Rachel Shilman"/);
  assert.match(script, /"Galia"/);
  assert.match(script, /"Noy Saib"/);
  assert.match(script, /"Maxim"/);
  assert.match(script, /"Anat"/);
  assert.match(script, /"Karin"/);
  assert.match(script, /"Shiraz"/);
  assert.match(script, /"Sapir"/);
  assert.match(script, /"Or"/);
  assert.match(script, /"Adi"/);
  assert.match(script, /"Betty"/);
  assert.match(script, /"Liran Sweisa"/);
  assert.match(script, /"vacationEventsOperations"/);
  assert.doesNotMatch(script, /"Tova Lavi"/);
  assert.doesNotMatch(script, /"Koral Cohen"/);
  assert.equal((script.match(/"nameLatin":/g) || []).length, 32);
  assert.match(script, /document\.createElement\("h4"\)/);
  assert.match(script, /document\.createElement\("p"\)/);
  assert.match(script, /toggle\.setAttribute\("aria-expanded", "false"\)/);
  assert.match(script, /const previewCount = 1/);
  assert.match(script, /card\.hidden = index >= previewCount/);
  assert.doesNotMatch(script, /const name = document\.createElement\("strong"\)/);
});

test("public copy follows the SpaPlus writing rules", async () => {
  const files = await Promise.all([
    read("codepen/index.html"),
    read("codepen/script.js"),
    read("app/page.tsx"),
    read("app/company-data.json"),
    ...localeCodes.map((locale) => read(`app/i18n/${locale}.ts`)),
  ]);
  const copy = files.join("\n");

  assert.doesNotMatch(copy, /[—–]/);
  assert.doesNotMatch(copy, /🌐|→/);
});

test("brand images use direct public assets", async () => {
  const page = await read("app/page.tsx");

  assert.doesNotMatch(page, /from "next\/image"/);
  assert.match(page, /src="\/spaplus-mark\.png"/);
  assert.match(page, /src="\/spaplus-wordmark\.png"/);
  assert.match(page, /src="\/adir-naor-founder\.jpg"/);
});

test("contact email delivery is branded and sends two messages", async () => {
  const [route, templates] = await Promise.all([
    read("app/api/contact/route.ts"),
    read("app/email-templates.ts"),
  ]);

  assert.match(route, /api\.resend\.com\/emails\/batch/);
  assert.match(route, /process\.env\.RESEND_API_KEY/);
  assert.match(route, /process\.env\.CONTACT_TO_EMAILS/);
  assert.match(route, /body\.privacyAccepted === true/);
  assert.match(route, /!privacyAccepted/);
  assert.match(route, /to: ownerEmails/);
  assert.match(route, /to: \[data\.email\]/);
  assert.match(route, /reply_to: data\.email/);
  assert.match(route, /reply_to: ownerEmails\[0\]/);
  assert.match(route, /Idempotency-Key/);
  assert.match(route, /SpaPlus-Global-Contact\/1\.0/);
  assert.match(route, /text: owner\.text/);
  assert.match(route, /text: visitor\.text/);
  assert.match(templates, /buildOwnerEmail/);
  assert.match(templates, /buildVisitorEmail/);
  assert.match(templates, /preheader/);
  assert.match(templates, /'Heebo', Arial, sans-serif/);
  assert.match(templates, /fonts\.googleapis\.com/);
  assert.doesNotMatch(templates, /info@spaplus\.ca/);
  assert.match(templates, /dir="\$\{dir\}"/);
  assert.match(templates, /direction:\$\{dir\}/);
  assert.match(route, /hello@mail\.spaplus\.co/);
  assert.match(templates, /(?:background|background-color):#e9176a/);
  assert.match(templates, /(?:background|background-color):#172744/);
  for (const locale of localeCodes) {
    assert.match(templates, new RegExp(`"${locale}"|\\b${locale}:`));
  }
});

test("country partner page is complete, bilingual and connected", async () => {
  const [html, hebrewHtml, script, css, homeHtml, homeScript] = await Promise.all([
    read("codepen/country-partners/index.html"),
    read("codepen/country-partners/he/index.html"),
    read("codepen/country-partners/script.js"),
    read("codepen/country-partners/style.css"),
    read("codepen/index.html"),
    read("codepen/script.js"),
  ]);

  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /id="model"/);
  assert.match(html, /id="apply"/);
  assert.match(html, /class="responsibility-grid"/);
  assert.match(html, /class="process-list"/);
  assert.match(html, /class="page-nav"/);
  assert.match(html, /class="human-section"/);
  assert.match(html, /class="faq-section"/);
  assert.match(html, /class="partner-form"/);
  assert.match(html, /name="privacy" type="checkbox" value="accepted" required/);
  assert.match(html, /name="partnershipAcknowledgement" type="checkbox" value="accepted" required/);
  assert.match(html, /class="privacy-link"/);
  assert.match(html, /name="profile"/);
  assert.doesNotMatch(html, /name="operations"|name="resources"|name="plan"/);
  assert.match(script, /en:\s*\{/);
  assert.match(script, /he:\s*\{/);
  assert.match(script, /chatgpt\.site\/api\/contact/);
  assert.match(script, /fallbackEndpoint/);
  assert.match(script, /formsubmit\.co\/ajax/);
  assert.match(script, /privacyAccepted: values\.get\("privacy"\) === "accepted"/);
  assert.match(script, /This is not an investment offer/);
  assert.match(script, /אין מדובר בהצעת השקעה/);
  assert.match(script, /Partnership acknowledgement accepted/);
  assert.match(script, /external email service provider/);
  assert.match(script, /focusable/);
  assert.match(html, /class="share-page"/);
  assert.match(script, /shareButton\.addEventListener\("click"/);
  assert.match(script, /navigator\.share/);
  assert.match(script, /navigator\.clipboard\.writeText\(location\.href\)/);
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /@media \(max-width: 380px\)/);
  assert.match(homeHtml, /href="\.\/country-partners\/\?lang=en"/);
  assert.match(homeScript, /siteRoot \+ "country-partners\/\?lang="/);
  assert.match(hebrewHtml, /<html lang="he" dir="rtl">/);
  assert.match(hebrewHtml, /<link rel="canonical" href="https:\/\/djskabi-png\.github\.io\/spaplus-global\/country-partners\/he\/">/);
  assert.match(hebrewHtml, /<title>שותפי מדינה של SpaPlus/);
  assert.match(hebrewHtml, /aria-label="בחירת שפה"/);
  assert.match(hebrewHtml, /<script src="\.\.\/script\.js\?v=/);
  assert.doesNotMatch(hebrewHtml, /<script src="\.\.\/\.\.\/script\.js/);
  assert.doesNotMatch(`${html}\n${hebrewHtml}\n${css}`, /chatgpt\.site|openai|generated by ai/i);
  assert.match(script, /chatgpt\.site\/api\/contact/);
});

test("every country market includes Hebrew, English and the local language", async () => {
  const slugs = [
    "united-states",
    "cyprus",
    "greece",
    "hungary",
    "italy",
    "united-kingdom",
    "germany",
    "france",
    "netherlands",
    "sweden",
    "norway",
    "switzerland",
    "united-arab-emirates",
  ];
  const nativeEnglishRoutes = {
    "united-states": "en-us",
    cyprus: "en",
    "united-kingdom": "en-gb",
    "united-arab-emirates": "en-ae",
  };
  const css = await read("codepen/markets/market.css");

  assert.match(css, /family=Heebo/);
  assert.match(css, /\[dir="rtl"\] body\{font-family:Heebo/);

  for (const slug of slugs) {
    const englishLocale = nativeEnglishRoutes[slug] || "en";
    const [hebrewMarket, hebrewPartner, hebrewSpa, englishMarket] =
      await Promise.all([
        read(`codepen/he/markets/${slug}/index.html`),
        read(`codepen/he/partners/${slug}/index.html`),
        read(`codepen/he/spas/join/${slug}/index.html`),
        read(`codepen/${englishLocale}/markets/${slug}/index.html`),
      ]);

    for (const page of [hebrewMarket, hebrewPartner, hebrewSpa]) {
      assert.match(page, /<html lang="he" dir="rtl">/);
      assert.match(page, /hreflang="he"/);
      assert.match(page, /data-market-language/);
      assert.match(page, />עברית<\/option>/);
      assert.match(page, />English<\/option>/);
    }

    assert.match(englishMarket, /hreflang="he"/);
    assert.match(
      hebrewMarket,
      new RegExp(`value="/he/markets/${slug}/" selected`),
    );
  }
});

test("cookie consent is localized, persistent and available on every page", async () => {
  const [page, homeHtml, homeScript, partnerHtml, partnerHebrewHtml, partnerScript] =
    await Promise.all([
      read("app/page.tsx"),
      read("codepen/index.html"),
      read("codepen/script.js"),
      read("codepen/country-partners/index.html"),
      read("codepen/country-partners/he/index.html"),
      read("codepen/country-partners/script.js"),
    ]);

  for (const source of [page, homeScript, partnerScript]) {
    assert.match(source, /spaplus-cookie-consent-v1/);
    assert.match(source, /spaplus:consent-changed/);
    assert.match(source, /essential/);
  }
  for (const html of [homeHtml, partnerHtml, partnerHebrewHtml]) {
    assert.match(html, /class="cookie-banner"/);
    assert.match(html, /data-cookie-choice="essential"/);
    assert.match(html, /data-cookie-choice="all"/);
    assert.match(html, /class="cookie-settings-link"/);
  }
  assert.match(homeScript, /const cookieCopy =/);
  assert.match(homeScript, /"he": \{/);
  assert.match(homeScript, /"fr-CA": \{/);
  assert.match(partnerScript, /cookieBanner\.hidden = true/);
});

test("every target market has English pages and every page template has Coming Soon links", async () => {
  const englishMarkets = [
    ["en-us", "united-states", "en-us/spas/join"],
    ["en", "cyprus", "en/spas/join/cyprus"],
    ["en", "greece", "en/spas/join/greece"],
    ["en", "hungary", "en/spas/join/hungary"],
    ["en", "italy", "en/spas/join/italy"],
    ["en-gb", "united-kingdom", "en-gb/spas/join"],
    ["en", "germany", "en/spas/join/germany"],
    ["en", "france", "en/spas/join/france"],
    ["en", "netherlands", "en/spas/join/netherlands"],
    ["en", "sweden", "en/spas/join/sweden"],
    ["en", "norway", "en/spas/join/norway"],
    ["en", "switzerland", "en/spas/join/switzerland"],
    ["en-ae", "united-arab-emirates", "en-ae/spas/join"],
  ];

  for (const [locale, slug, spaPath] of englishMarkets) {
    const [market, partner, spa] = await Promise.all([
      read(`codepen/${locale}/markets/${slug}/index.html`),
      read(`codepen/${locale}/partners/${slug}/index.html`),
      read(`codepen/${spaPath}/index.html`),
    ]);
    for (const page of [market, partner, spa]) {
      assert.match(page, /<html lang="en(?:-[A-Z]{2})?"/);
      assert.match(page, /class="market-footer-markets"/);
      assert.match(page, /<h2>Coming Soon<\/h2>/);
    }
    assert.match(spa, /name="preferredContact"/);
    assert.match(spa, /name="operatingStatus"/);
    assert.match(spa, /name="branches"/);
    assert.match(spa, /name="facilities"/);
    assert.match(spa, /name="preferredBookingMethod"/);
    assert.match(spa, /within 72 hours/);
    assert.match(spa, /Illustrative concept/);
    assert.match(spa, /Monthly settlement/);
  }

  const [home, countryPartners, hebrewSpa] = await Promise.all([
    read("codepen/index.html"),
    read("codepen/country-partners/index.html"),
    read("codepen/he/spas/join/italy/index.html"),
  ]);
  for (const page of [home, countryPartners]) {
    assert.match(page, /class="footer-markets-block"/);
    assert.match(page, />Coming Soon<\/h2>/);
  }
  assert.match(hebrewSpa, /<h2>בקרוב<\/h2>/);
  assert.match(hebrewSpa, /href="\/spaplus-global\/he\/markets\/italy\/">איטליה<\/a>/);
  assert.doesNotMatch(hebrewSpa, /href="\/spaplus-global\/en\/markets\/italy\/">Italy<\/a>/);
});

test("accessibility controls and statements are available in every published language", async () => {
  const [widget, styles, home] = await Promise.all([
    read("codepen/accessibility.js"),
    read("codepen/accessibility.css"),
    read("codepen/index.html"),
  ]);
  const [englishMarketHub, hebrewMarketHub, siteStyles] = await Promise.all([
    read("codepen/en/markets/index.html"),
    read("codepen/he/markets/index.html"),
    read("codepen/style.css"),
  ]);

  assert.match(home, /global-accessibility-link/);
  assert.match(home, /accessibility\.css/);
  assert.match(home, /accessibility\.js/);
  assert.doesNotMatch(home, /<span aria-hidden="true">A<\/span>/);
  assert.match(widget, /aria-expanded/);
  assert.match(widget, /event\.key === "Escape"/);
  assert.match(widget, /localStorage/);
  assert.match(widget, /a11y-contrast/);
  assert.match(widget, /a11y-underline-links/);
  assert.match(widget, /a11y-reduce-motion/);
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /a11y-text-xl/);
  assert.match(englishMarketHub, /class="skip-link" href="#main"/);
  assert.match(hebrewMarketHub, /class="skip-link" href="#main"/);
  assert.match(
    siteStyles,
    /\[lang="he"\] :is\(h1, h2, h3, h4\) \{\s*font-weight:\s*700;\s*letter-spacing:\s*0;\s*word-spacing:\s*0\.08em;/,
  );

  for (const locale of accessibilityRoutes) {
    const html = await read(`codepen/${locale}/accessibility/index.html`);
    assert.match(html, /<h1>[^<]+<\/h1>/);
    assert.match(html, /GLOBAL SPA MANAGEMENT LTD/);
    assert.match(html, /2\.2/);
    assert.match(html, /27/);
    assert.match(html, /accessibility\.css/);
    assert.match(html, /accessibility\.js/);
    assert.doesNotMatch(html, /formally certified|fully compliant/i);
  }
});

test("every Coming Soon country link points to an existing English market page", async () => {
  const markets = [
    ["en-us", "united-states"],
    ["en", "cyprus"],
    ["en", "greece"],
    ["en", "hungary"],
    ["en", "italy"],
    ["en-gb", "united-kingdom"],
    ["en", "germany"],
    ["en", "france"],
    ["en", "netherlands"],
    ["en", "sweden"],
    ["en", "norway"],
    ["en", "switzerland"],
    ["en-ae", "united-arab-emirates"],
  ];
  const footerPages = await Promise.all(
    [
      "index.html",
      "country-partners/index.html",
      "country-partners/he/index.html",
      "en/index.html",
      "he/index.html",
      "fr-ca/index.html",
      "ru/index.html",
      "el/index.html",
      "it/index.html",
      "hu/index.html",
      "pl/index.html",
      "es/index.html",
      "en/country-partners/index.html",
      "he/country-partners/index.html",
    ].map((page) => read(`codepen/${page}`)),
  );

  for (const [locale, slug] of markets) {
    const href = `/spaplus-global/${locale}/markets/${slug}/`;
    await read(`codepen/${locale}/markets/${slug}/index.html`);
    for (const page of footerPages) {
      assert.ok(page.includes(`href="${href}"`), `Missing footer link ${href}`);
    }
  }

  const combined = footerPages.join("\n");
  for (const invalidLocale of [
    "en-gr",
    "en-hu",
    "en-it",
    "en-de",
    "en-fr",
    "en-nl",
    "en-se",
    "en-no",
    "en-ch",
  ]) {
    assert.doesNotMatch(
      combined,
      new RegExp(`/spaplus-global/${invalidLocale}/markets/`),
    );
  }
});
