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

test("the browser icon uses the official SpaPlus mark", async () => {
  const layout = await read("app/layout.tsx");

  assert.match(layout, /spaplus-mark\.png\?v=3/);
  assert.doesNotMatch(layout, /icon:\s*"\/spaplus-logo\.png"/);
});

test("static pages use the official SpaPlus mark instead of the retired heart icon", async () => {
  const [home, favicon] = await Promise.all([
    read("codepen/index.html"),
    read("codepen/favicon.svg"),
  ]);

  assert.match(home, /href="https:\/\/spaplus\.co\/spaplus-mark\.png\?v=3" type="image\/png"/);
  assert.match(favicon, /https:\/\/spaplus\.co\/spaplus-mark\.png\?v=3/);
  assert.doesNotMatch(favicon, /M32 51C15 40/);
});

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
  assert.match(script, /app\.spaplus\.co\/api\/contact/);
  assert.match(script, /submissionId: crypto\.randomUUID\(\)/);
  assert.doesNotMatch(script, /contactFormFallbackEndpoint|formsubmit\.co\/ajax/);
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
  assert.match(script, /app\.spaplus\.co\/api\/contact/);
  assert.doesNotMatch(script, /fallbackEndpoint|formsubmit\.co\/ajax/);
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
  assert.match(script, /app\.spaplus\.co\/api\/contact/);
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

test("analytics is separated by site and remains blocked until consent", async () => {
  const [analytics, globalPage, ontarioPage] = await Promise.all([
    read("app/analytics.ts"),
    read("app/page.tsx"),
    read("app/market-launch/MarketLaunchPage.tsx"),
  ]);

  assert.match(analytics, /GTM-TRNPLFMK/);
  assert.match(analytics, /GTM-KKN2S8SP/);
  assert.match(analytics, /hostname === "spaplus\.co"/);
  assert.match(analytics, /hostname === "app\.spaplus\.co"/);
  assert.match(analytics, /analytics_storage: granted \? "granted" : "denied"/);
  assert.match(analytics, /ad_storage: "denied"/);
  assert.match(analytics, /if \(!isPublicSite\(site\) \|\| !hasConsent\(site\)\) return/);
  assert.match(globalPage, /initializeSpaPlusAnalytics\("global"\)/);
  assert.match(globalPage, /trackAnalyticsEvent\("global", "generate_lead"/);
  assert.match(ontarioPage, /initializeSpaPlusAnalytics\("ontario"\)/);
  assert.match(ontarioPage, /track\("generate_lead"/);
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

test("management permissions fail closed and leads are scoped by market", async () => {
  const [access, adminPage, toolsPage, dashboard, usersRoute, submissionsRoute, marketRoute, migration, worker] = await Promise.all([
    read("app/cms-access.ts"),
    read("app/admin/page.tsx"),
    read("app/tools/page.tsx"),
    read("app/tools/SubmissionsClient.tsx"),
    read("app/api/cms/users/route.ts"),
    read("app/api/cms/submissions/route.ts"),
    read("app/api/market-spa-leads/route.ts"),
    read("drizzle/0002_motionless_spectrum.sql"),
    read("worker/index.ts"),
  ]);
  assert.match(access, /if \(role === "owner"\) return true/);
  assert.match(access, /return false/);
  assert.match(access, /resource\.type === "site" \|\| resource\.type === "market"/);
  assert.doesNotMatch(access, /permissions\.length === 0/);
  assert.match(adminPage, /cmsContentResources\.some/);
  assert.match(adminPage, /redirect\("\/tools"\)/);
  assert.match(toolsPage, /allowedLeadResourceKeys/);
  assert.match(toolsPage, /canViewContentManagement/);
  assert.match(toolsPage, /\/auth\/logout\?return_to=\//);
  assert.match(dashboard, /allowedResourceKeys/);
  assert.match(dashboard, /allowedBusinesses\.includes\("spaplus"\)/);
  assert.match(dashboard, /allowedBusinesses\.includes\("vila4u"\)/);
  assert.match(usersRoute, /replacePermissions/);
  assert.match(usersRoute, /validResourceKey/);
  assert.match(submissionsRoute, /inArray\(formSubmissions\.resourceKey, resources\)/);
  assert.match(submissionsRoute, /manageLeads/);
  assert.match(marketRoute, /resourceKey: "market:ca:on"/);
  assert.match(migration, /INSERT INTO `cms_permissions`/);
  assert.match(worker, /const assetResponse = await env\.ASSETS\.fetch\(request\)/);
  assert.match(worker, /assetResponse\.status !== 404/);
});

test("lead management provides a localized four-state operational dashboard", async () => {
  const [dashboard, page, systemLocale, route, schema, styles] = await Promise.all([
    read("app/tools/SubmissionsClient.tsx"),
    read("app/tools/page.tsx"),
    read("app/system-locale.ts"),
    read("app/api/cms/submissions/route.ts"),
    read("db/schema.ts"),
    read("app/tools/leads.css"),
  ]);
  for (const status of ["new", "won", "irrelevant", "deleted"]) {
    assert.match(dashboard, new RegExp(`"${status}"`));
    assert.match(route, new RegExp(`"${status}"`));
    assert.match(schema, new RegExp(`"${status}"`));
  }
  assert.match(dashboard, /lead-status-grid/);
  assert.match(dashboard, /normalizeStatus/);
  assert.match(dashboard, /setStatusFilter\("all"\)/);
  assert.match(dashboard, /type="search"/);
  assert.match(dashboard, /Deleted leads remain available here and can be restored/);
  assert.match(dashboard, /דשבורד לידים/);
  assert.match(dashboard, /Tableau de bord des prospects/);
  assert.match(dashboard, /normalizeSystemLocale\(systemLocale\)/);
  assert.match(dashboard, /document\.documentElement\.lang = locale/);
  assert.match(dashboard, /document\.documentElement\.dir = locale === "he" \? "rtl" : "ltr"/);
  assert.match(page, /normalizeSystemLocale\(admin\.systemLocale\)/);
  assert.match(page, /lang=\{systemLocale\}/);
  assert.match(systemLocale, /locale\.startsWith\("he-"\)/);
  assert.match(systemLocale, /locale\.startsWith\("fr-"\)/);
  assert.match(route, /manageLeads/);
  assert.doesNotMatch(route, /export async function DELETE/);
  assert.match(styles, /grid-template-columns:repeat\(4/);
  assert.match(styles, /@media\(max-width:560px\)/);
});

test("accessibility controls and statements are available in every published language", async () => {
  const [widget, styles, home] = await Promise.all([
    read("codepen/accessibility.js"),
    read("codepen/accessibility.css"),
    read("codepen/index.html"),
  ]);
  const [englishMarketHub, hebrewMarketHub, siteStyles, partnerStyles] =
    await Promise.all([
    read("codepen/en/markets/index.html"),
    read("codepen/he/markets/index.html"),
    read("codepen/style.css"),
    read("codepen/country-partners/style.css"),
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
  for (const pageStyles of [siteStyles, partnerStyles]) {
    assert.match(
      pageStyles,
      /\.share-page\s*\{[\s\S]*?inset-inline-end:\s*24px;/,
    );
    assert.match(
      pageStyles,
      /@media \(max-width:\s*700px\)[\s\S]*?\.share-page\s*\{[\s\S]*?inset-inline-end:\s*16px;/,
    );
  }

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

test("Ontario early-access funnel is complete, bilingual, regional and launch-gated", async () => {
  const [
    page,
    frenchPage,
    englishAreaPage,
    frenchAreaPage,
    client,
    marketConfig,
    styles,
    route,
    templates,
    sources,
    playbook,
    sitemap,
    llms,
  ] = await Promise.all([
    read("app/en-ca/ontario/page.tsx"),
    read("app/fr-ca/ontario/page.tsx"),
    read("app/en-ca/ontario/[area]/page.tsx"),
    read("app/fr-ca/ontario/[area]/page.tsx"),
    read("app/market-launch/MarketLaunchPage.tsx"),
    read("app/market-launch/markets.ts"),
    read("app/market-launch/market-launch.module.css"),
    read("app/api/market-spa-leads/route.ts"),
    read("app/market-email-templates.ts"),
    read("project_knowledge/ONTARIO_MEDIA_SOURCES.md"),
    read("project_knowledge/ONTARIO_LAUNCH_PLAYBOOK.md"),
    read("public/app-sitemap.xml"),
    read("public/llms.txt"),
  ]);
  const marketPage = `${client}\n${marketConfig}`;

  assert.match(page, /https:\/\/app\.spaplus\.co\/en-ca\/ontario\//);
  assert.match(page, /const isPublicLaunch = true/);
  assert.match(page, /index:\s*isPublicLaunch/);
  assert.match(page, /"@type": "Organization"/);
  assert.match(page, /"@type": "WebPage"/);
  assert.match(page, /"@type": "BreadcrumbList"/);
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /"@type": "ItemList"/);
  assert.match(page, /"geo.region": "CA-ON"/);
  assert.match(page, /"x-default": canonicalUrl/);
  assert.doesNotMatch(page, /LocalBusiness/);
  assert.match(page, /"fr-CA": "https:\/\/app\.spaplus\.co\/fr-ca\/ontario\//);
  assert.match(frenchPage, /SpaPlus arrive en Ontario/);
  assert.match(frenchPage, /inLanguage: "fr-CA"/);
  assert.match(frenchPage, /"content-language": "fr-CA"/);
  assert.match(frenchPage, /"@type": "BreadcrumbList"/);
  assert.match(frenchPage, /index: isPublicLaunch/);
  assert.match(englishAreaPage, /generateStaticParams/);
  assert.match(englishAreaPage, /buildOntarioAreaConfig\(area, "en"\)/);
  assert.match(frenchAreaPage, /buildOntarioAreaConfig\(area, "fr"\)/);

  assert.match(marketPage, /marketName: "Ontario"/);
  assert.match(client, /`SpaPlus is coming to \$\{marketName\}\.`/);
  assert.match(client, /`SpaPlus arrive en \$\{marketName\}\.`/);
  assert.match(client, /No fee to register/);
  assert.match(client, /Inscription gratuite/);
  assert.match(client, /No commitment/);
  assert.match(client, /No credit card/);
  assert.match(client, /reviewWindowHours/);
  assert.match(client, /\{marketName\} listings are not live/);
  assert.match(client, /do not depict future/);
  assert.match(client, /name="organization"/);
  assert.match(client, /name="website"/);
  assert.match(client, /name="city"/);
  assert.match(client, /name="postalCode"/);
  assert.match(client, /name="spaType"/);
  assert.match(client, /name="locations"/);
  assert.match(client, /name="services"/);
  assert.match(client, /name="role"/);
  assert.match(client, /name="phone"/);
  assert.match(client, /name="preferredContact"/);
  assert.match(client, /name="privacy"/);
  assert.match(client, /name="acknowledgement"/);
  assert.match(client, /name="website_confirm"/);
  assert.match(marketConfig, /\/api\/market-spa-leads/);
  assert.match(marketConfig, /homeHref: "https:\/\/spaplus\.co\/en\/"/);
  assert.match(marketConfig, /homeHref: "https:\/\/spaplus\.co\/fr-ca\/"/);
  assert.match(client, /role="dialog"/);
  assert.match(client, /submit_\$\{eventPrefix\}_spa_form/);
  assert.match(client, /utm_campaign/);
  assert.match(client, /spaplus-consent/);
  assert.match(client, /Essential only/);
  assert.match(client, /Allow measurement/);
  assert.match(client, /spaplus:consent/);
  assert.match(client, /languageLinks\.map/);
  assert.match(client, /window\.location\.assign\(link\.href\)/);
  assert.match(client, /document\.documentElement\.lang = languageTag/);
  assert.match(client, /hrefLang=\{link\.languageTag\}/);
  assert.match(marketConfig, /label: "FR CA"/);
  assert.match(marketConfig, /ariaLabel: "Français canadien"/);
  assert.match(marketConfig, /referenceSpas: frenchReferenceSpas/);
  assert.match(client, /priorityAreas\.map/);
  assert.match(client, /selectedArea\.focus\.map/);
  assert.match(client, /SpaPlus Global/);
  assert.match(client, /className=\{styles\.brand\}[\s\S]*?href=""/);
  assert.match(client, /className=\{styles\.footerBrand\}[\s\S]*?href=""/);
  assert.match(client, /https:\/\/spaplus\.ca\/en\//);
  assert.match(client, /https:\/\/spaplus\.ca\/fr\//);
  assert.match(client, /target="_blank"/);
  assert.match(client, /rel="noopener noreferrer"/);
  assert.match(client, /aria-label=\{tr\("Back to top"/);
  assert.match(client, /aria-controls="market-navigation"/);
  assert.match(client, /IntersectionObserver/);
  assert.match(client, /scrollProgress/);
  assert.match(marketConfig, /slug: "toronto"/);
  assert.match(marketConfig, /slug: "greater-toronto-area"/);
  assert.match(marketConfig, /slug: "niagara"/);
  assert.match(marketConfig, /slug: "ottawa"/);
  assert.match(marketConfig, /slug: "muskoka"/);
  assert.match(marketConfig, /slug: "hamilton"/);
  assert.doesNotMatch(client, /[–—]/);

  assert.match(styles, /@media \(max-width: 640px\)/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /\.foundingOffer/);
  assert.match(styles, /\.localFocus/);
  assert.match(styles, /\.backToTop/);
  assert.match(styles, /\.scrollProgress/);
  assert.match(styles, /\.menuOpen/);
  assert.match(styles, /\.footerColumn/);

  assert.match(route, /formType: `\$\{marketSlug\}_spa_early_access`/);
  assert.match(route, /Market not supported/);
  assert.match(route, /export async function GET/);
  assert.match(route, /body\.privacyAccepted !== true/);
  assert.match(route, /body\.acknowledgementAccepted !== true/);
  assert.match(route, /api\.resend\.com\/emails\/batch/);
  assert.match(route, /to: ownerEmails/);
  assert.match(route, /to: \[data\.email\]/);
  assert.match(route, /Idempotency-Key/);
  assert.match(route, /SpaPlus-Market-Leads\/1\.0/);
  assert.match(route, /"https:\/\/app\.spaplus\.co"/);
  assert.match(route, /languageTag: data\.locale/);

  assert.match(templates, /\$\{marketName\} spa lead:/);
  assert.match(templates, /Your spa is on the \$\{marketName\} early list/);
  assert.match(templates, /Votre spa est sur la liste prioritaire/);
  assert.match(templates, /Global Spa Management Ltd\./);
  assert.match(templates, /does not request credit card information/);
  assert.match(sources, /official\s+SpaPlus Canada website/);
  assert.match(sources, /do not depict Ontario\s+partners/);
  assert.match(playbook, /Status: Published for organic discovery/);
  assert.match(playbook, /Qualified Ontario spa leads/);
  assert.match(playbook, /public and indexable/);
  assert.match(sitemap, /https:\/\/app\.spaplus\.co\/en-ca\/ontario\/toronto\//);
  assert.match(sitemap, /https:\/\/app\.spaplus\.co\/fr-ca\/ontario\/hamilton\//);
  assert.match(llms, /The launch date has not been announced/);
  assert.match(llms, /does not depict an Ontario spa or partner/);
});

test("Ontario management exposes the complete bilingual page copy", async () => {
  const [admin, client, manifestSource, worker] = await Promise.all([
    read("app/admin/AdminClient.tsx"),
    read("app/market-launch/MarketLaunchPage.tsx"),
    read("app/market-launch/generated-market-copy.json"),
    read("worker/index.ts"),
  ]);
  const manifest = JSON.parse(manifestSource);
  const fields = new Set(manifest.map((entry) => entry.field));
  assert.ok(manifest.length >= 250, `Expected at least 250 editable fields, received ${manifest.length}`);
  assert.equal(fields.size, manifest.length, "Editable field keys must be unique");
  for (const field of [
    "heroTitle",
    "heroLead",
    "seoTitle",
    "seoDescription",
    "formSubmitButton",
    "heroDisclosure",
    "referenceSpa1Alt",
    "priorityArea6Label",
    "successBody",
  ]) {
    assert.ok(fields.has(field), `Missing editable Ontario field: ${field}`);
  }
  assert.match(admin, /marketCopyManifest/);
  assert.match(admin, /saveAllMarketChanges/);
  assert.match(admin, /type="search"/);
  assert.match(admin, /contentRequestId/);
  assert.match(admin, /requestId !== contentRequestId\.current/);
  assert.match(admin, /disabled=\{contentLoading \|\| !marketDraftCount\}/);
  assert.match(client, /marketCopyFieldKey/);
  assert.match(client, /dynamicCopy/);
  assert.match(client, /managed\("seoTitle"/);
  assert.match(worker, /applyManagedOntarioMetadata/);
  assert.match(worker, /copy\.seoTitle/);
});
