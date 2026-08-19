import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
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

test("RoomsVIP test leads are retained and clearly marked", async () => {
  const route = await read("app/api/integrations/roomsvip-leads/route.ts");
  assert.doesNotMatch(route, /lead\.isTest\s*\|\|\s*!leadId/);
  assert.match(route, /rooms-vip-owner-lead-test/);
  assert.match(route, /Lead type: Test lead/);
});

test("Ontario and Quebec Meta instant-form leads are authenticated, deduplicated, tagged and emailed", async () => {
  const [route, templates, fieldHelpers] = await Promise.all([
    read("app/api/integrations/meta-ontario-leads/route.ts"),
    read("app/market-email-templates.ts"),
    read("app/meta-lead-fields.ts"),
  ]);

  assert.match(route, /x-hub-signature-256/);
  assert.match(route, /META_WEBHOOK_VERIFY_TOKEN/);
  assert.match(route, /META_PAGE_ACCESS_TOKEN/);
  assert.match(route, /meta-\$\{market\.slug\}:\$\{leadId\}/);
  assert.match(route, /resourceKey: market\.resourceKey/);
  assert.match(route, /resourceKey: "market:ca:on"/);
  assert.match(route, /resourceKey: "market:ca:qc"/);
  assert.match(route, /findNormalizedMetaField as normalizedField/);
  assert.match(fieldHelpers, /function normalizeMetaFieldName/);
  assert.match(route, /nom_complet/);
  assert.match(route, /numero_de_telephone/);
  assert.match(route, /nom_de_l_entreprise/);
  assert.match(route, /source: `Meta paid lead form \| \$\{market\.name\}`/);
  assert.match(route, /formType: `\$\{market\.slug\}-meta-instant-form`/);
  assert.match(route, /Meta campaign name:/);
  assert.match(route, /Meta ad set name:/);
  assert.match(route, /Meta ad name:/);
  assert.match(route, /Submitted at:/);
  assert.match(route, /adir@spaplus\.co\.il,galia@spaplus\.ca/);
  assert.match(route, /buildMarketOwnerEmail/);
  assert.match(route, /buildMarketVisitorEmail/);
  assert.match(route, /X-Entity-Ref-ID.*spaplus-meta-\$\{market\.slug\}-/s);
  assert.match(route, /api\.resend\.com\/emails\/batch/);
  assert.match(route, /ownerEmails\.map\(\(ownerEmail, index\)/);
  assert.match(route, /to: \[ownerEmail\]/);
  assert.doesNotMatch(route, /to: ownerEmails/);
  assert.match(route, /to: \[data\.email\]/);
  assert.match(templates, /languageTag: isHebrew \? "he-IL" : "en"/);
  assert.match(templates, /dir="\$\{direction\}"/);
});

test("Ontario and Quebec Meta leads send an English LTR owner notification with resilient delivery", async () => {
  const route = await read("app/api/integrations/meta-ontario-leads/route.ts");
  assert.match(route, /META_\$\{market\.slug\.toUpperCase\(\)\}_CONTACT_TO_EMAILS/);
  assert.match(route, /api\.cloudflare\.com\/client\/v4\/accounts/);
  assert.match(route, /api\.resend\.com\/emails/);
  assert.match(route, /Idempotency-Key/);
  assert.match(route, /languageTag: market\.slug === "israel" \? "he-IL" : "en-CA"/);
  assert.match(route, /\$\{market\.name\} time/);
});

test("the public app worker verifies Meta lead webhooks at the edge and proxies delivery", async () => {
  const worker = await read("worker/index.ts");

  assert.match(worker, /META_WEBHOOK_VERIFY_TOKEN\?: string/);
  assert.match(worker, /META_ISRAEL_WEBHOOK_VERIFY_TOKEN\?: string/);
  assert.match(worker, /function constantTimeEqual/);
  assert.match(worker, /function verifyMetaWebhookRequest/);
  assert.match(worker, /value\.length >= 24/);
  assert.match(worker, /expectedTokens\.some\(\(expected\) => constantTimeEqual\(token, expected\)\)/);
  assert.match(worker, /request\.method === "GET"[\s\S]*?\/api\/integrations\/meta-ontario-leads/);
  assert.match(worker, /return verifyMetaWebhookRequest\(request, env\)/);
  assert.match(
    worker,
    /request\.method === "POST"[\s\S]*?recover_campaign[\s\S]*?verifyPayload[\s\S]*?proxyProtectedRequest\(request, env, session\)/,
  );
  assert.match(
    worker,
    /url\.pathname === "\/api\/integrations\/meta-ontario-leads"[\s\S]*?PRIVATE_AUTHORIZATION_HEADER[\s\S]*?request\.body/,
  );
  assert.ok(
    worker.indexOf('request.method === "GET"') <
      worker.lastIndexOf('url.pathname === "/api/integrations/meta-ontario-leads"'),
    "Meta GET verification must stay at the edge before POST delivery is proxied to the management backend",
  );
});

test("Ontario owner recipients prefer the production market setting", async () => {
  const route = await read("app/api/market-spa-leads/route.ts");
  assert.match(route, /setting\(marketOwnerEmailsKey\)\s*\|\|\s*marketContent\.notificationRecipients/);
  assert.match(route, /setting\("CONTACT_FROM_EMAIL"\)/);
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
  assert.match(ontarioPage, /initializeSpaPlusAnalytics\(analyticsSite\)/);
  assert.match(ontarioPage, /marketSlug === "ontario" \? "ontario" : "canada"/);
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
  assert.match(adminPage, /cmsContentResources[\s\S]*?\.some/);
  assert.match(adminPage, /redirect\("\/tools"\)/);
  assert.match(toolsPage, /allowedLeadResourceKeys/);
  assert.match(toolsPage, /canViewContentManagement/);
  assert.match(toolsPage, /canRecoverIsraelMetaLeads/);
  assert.match(toolsPage, /"market:il",[\s\S]*?"manageLeads"/);
  assert.match(toolsPage, /action="\/api\/integrations\/meta-ontario-leads\?recover_campaign=120251550743850512" method="post"/);
  assert.match(toolsPage, /\/auth\/logout\?return_to=\//);
  assert.match(dashboard, /allowedResourceKeys/);
  assert.match(dashboard, /allowedResourceKeys\.filter\(isLeadResourceKey\)/);
  assert.match(dashboard, /key === "market:ca:qc" \? t\.quebec/);
  assert.match(dashboard, /allowedBusinesses\.includes\("spaplus"\)/);
  assert.match(dashboard, /allowedBusinesses\.includes\("vila4u"\)/);
  assert.match(usersRoute, /replacePermissions/);
  assert.match(usersRoute, /validResourceKey/);
  assert.match(submissionsRoute, /inArray\(formSubmissions\.resourceKey, resources\)/);
  assert.match(submissionsRoute, /manageLeads/);
  assert.match(marketRoute, /resourceKey: market\.resourceKey \|\| "market:ca:on"/);
  assert.match(migration, /INSERT INTO `cms_permissions`/);
  assert.match(worker, /const assetResponse = await env\.ASSETS\.fetch\(request\)/);
  assert.match(worker, /assetResponse\.status !== 404/);
  assert.match(worker, /async function proxyPrivateAsset/);
  assert.match(worker, /replaceAll\("index-MnjarlW8\.js", "index-Dq2-pwm2\.js"\)/);
  assert.match(worker, /replaceAll\("index-fpqyGFwg\.css", "index-CKyI5e50\.css"\)/);
  assert.match(worker, /upstreamHeaders\.delete\("accept-encoding"\)/);
  assert.match(worker, /console\.error\("Protected administration proxy failed", error\)/);
  assert.match(worker, /localAssetUrl\.pathname = "\/assets\/index-Dq2-pwm2\.js"/);
  assert.match(worker, /url\.pathname\.startsWith\("\/assets\/"\)/);
});

test("VII leads are validated, tagged and filterable without changing the shared business permissions", async () => {
  const [route, roomsVipRoute, dashboard, worker] = await Promise.all([
    read("app/api/integrations/vii-leads/route.ts"),
    read("app/api/integrations/roomsvip-leads/route.ts"),
    read("app/tools/SubmissionsClient.tsx"),
    read("worker/index.ts"),
  ]);
  assert.match(route, /allowedOrigins/);
  assert.match(route, /isSubmissionId/);
  assert.match(route, /privacyAccepted/);
  assert.match(route, /onConflictDoNothing/);
  assert.match(route, /resourceKey: "business:vila4u:leads"/);
  assert.match(route, /formType: `vii-site-\$\{purposes\[acceptedPurpose\]\}`/);
  assert.match(route, /Brand: \$\{sourceBrand\}/);
  assert.match(route, /Lead source: \$\{sourceSite\}/);
  assert.match(roomsVipRoute, /Brand: RoomsVIP/);
  assert.match(roomsVipRoute, /World: hourly/);
  assert.match(dashboard, /function leadBrand/);
  assert.match(dashboard, /function leadWorld/);
  assert.match(dashboard, /lead-brand-tabs/);
  assert.match(dashboard, /setBrandFilter/);
  assert.match(dashboard, /setWorldFilter/);
  assert.match(worker, /url\.pathname === "\/api\/integrations\/vii-leads"/);
});

test("the static export never shadows the authenticated management route", async () => {
  const staticPreparation = await read("scripts/prepare-production-static.mjs");
  assert.doesNotMatch(staticPreparation, /"admin",/);
  assert.match(staticPreparation, /rm\(path\.join\(target, "admin"\)/);
});

test("Ontario documents declare their Canadian language on the server", async () => {
  const [middleware, layout] = await Promise.all([
    read("proxy.ts"),
    read("app/layout.tsx"),
  ]);
  assert.match(middleware, /pathname\.startsWith\("\/fr-ca\/"\).*"fr-CA"/);
  assert.match(middleware, /x-spaplus-document-language/);
  assert.match(layout, /headers\(\)/);
  assert.match(layout, /<html lang=\{documentLanguage\}/);
});

test("the Ontario application returns a branded localized page for unknown routes", async () => {
  const worker = await read("worker/index.ts");
  assert.match(worker, /function appNotFoundResponse/);
  assert.match(worker, /Page not found \| SpaPlus/);
  assert.match(worker, /Page introuvable \| SpaPlus/);
  assert.match(worker, /dynamicResponse\.status === 404/);
  assert.match(worker, /appNotFoundResponse\(url\.pathname\)/);
});

test("management access starts on a branded page before Google sign-in", async () => {
  const worker = await read("worker/index.ts");
  assert.match(worker, /function googleLoginLanding/);
  assert.match(worker, /function brandedAdministrationUnavailable/);
  assert.match(worker, /function isSitesAuthenticationGate/);
  assert.match(worker, /isSitesAuthenticationGate\(body, contentType\)/);
  assert.match(worker, /retry-after/);
  assert.match(worker, /כניסה מאובטחת/);
  assert.match(worker, /\/auth\/google\/authorize/);
  assert.match(worker, /url\.pathname === "\/auth\/google\/start"\)[\s\S]*googleLoginLanding/);
});

test("every Hebrew management surface is locked to the modern Heebo stack", async () => {
  const [globalStyles, adminStyles, projectStyles, bugStyles, demoStyles, demoTypography, demoPage, protectedDemoPage, layout, accessDenied, worker] = await Promise.all([
    read("app/globals.css"),
    read("app/admin/admin.css"),
    read("app/admin/projects/projects.css"),
    read("app/admin/bugs/bugs.css"),
    read("app/demo/new-spa/new-spa-demo.css"),
    read("app/demo/new-spa/new-spa-typography.css"),
    read("app/demo/new-spa/page.tsx"),
    read("app/admin/operations/spas/new/page.tsx"),
    read("app/layout.tsx"),
    read("app/access-denied/page.tsx"),
    read("worker/index.ts"),
  ]);

  assert.match(globalStyles, /font-family: var\(--font-heebo, "Heebo"\), Arial, sans-serif !important/);
  assert.match(adminStyles, /\.cms-shell\[lang="he"\],\.cms-shell\[lang="he"\] \*\{font-family:var\(--font-heebo,"Heebo"\),Arial,sans-serif!important/);
  assert.match(projectStyles, /\.projects-shell\[lang="he"\],\.projects-shell\[lang="he"\] \*\{font-family:var\(--font-heebo,"Heebo"\),Arial,sans-serif!important/);
  assert.match(bugStyles, /\.bugs-shell\[lang="he"\],\.bugs-shell\[lang="he"\] \*\{font-family:var\(--font-heebo,"Heebo"\),Arial,sans-serif!important/);
  assert.match(demoTypography, /font-family: var\(--font-heebo, "Heebo"\), Arial, sans-serif !important/);
  assert.match(demoPage, /new-spa-typography\.css/);
  assert.match(protectedDemoPage, /new-spa-typography\.css/);
  assert.match(accessDenied, /dir="rtl" lang="he"/);
  assert.match(worker, /fonts\.googleapis\.com\/css2\?family=Heebo/);
  assert.match(worker, /font-family:"Heebo",Arial,sans-serif/);
  assert.match(worker, /function textResponse[\s\S]*?background:#fff8fb;color:#172d4f;font-family:"Heebo",Arial,sans-serif/);
  assert.doesNotMatch(`${layout}\n${projectStyles}\n${bugStyles}`, /Assistant|font-assistant/);
  assert.doesNotMatch(`${globalStyles}\n${adminStyles}\n${projectStyles}\n${bugStyles}\n${demoStyles}\n${demoTypography}`, /font-family:(?:serif|cursive|fantasy)/i);
});

test("project cards and compact list are distinct, persistent and acknowledge view changes", async () => {
  const [client, styles] = await Promise.all([
    read("app/admin/projects/ProjectsClient.tsx"),
    read("app/admin/projects/projects.css"),
  ]);
  assert.match(client, /projects-view-mode/);
  assert.match(client, /aria-pressed=\{viewMode === "grid"\}/);
  assert.match(client, /aria-pressed=\{viewMode === "list"\}/);
  assert.match(client, /עברנו לתצוגת רשימה קומפקטית/);
  assert.match(client, /project-list-expand/);
  assert.match(client, /aria-expanded=\{expandedProjectId === project\.id\}/);
  assert.match(styles, /\.projects-grid\.is-list \.project-card:not\(\.is-list-expanded\)/);
  assert.match(styles, /\.project-card\.is-list-expanded/);
  assert.match(styles, /\.view-mode-status/);
});

test("bug routing includes every verified future work sheet", async () => {
  const [client, route] = await Promise.all([
    read("app/admin/bugs/BugsClient.tsx"),
    read("app/api/cms/bugs/route.ts"),
  ]);
  const futureTargets = [
    ["future", "עתידי", "318326031"],
    ["future_roy", "עתידי רועי", "2026080801"],
    ["future_adir", "עתידי אדיר", "2026080802"],
    ["future_gal", "עתידי גל", "2026080803"],
    ["future_maxim", "עתידי מקסים", "2026080804"],
    ["future_sergey", "עתידי סרגיי", "2026080805"],
    ["future_maor", "עתידי מאור", "2026080806"],
    ["future_shlomi", "עתידי שלומי", "2026080807"],
  ];
  for (const [key, label, sheetId] of futureTargets) {
    assert.match(client, new RegExp(`${key}: "${label}"`));
    assert.match(route, new RegExp(`${key}: \\{ sheetId: ${sheetId}, sheet: "${label}"`));
  }
  assert.match(route, /const validTargets = Object\.keys\(driveTargets\)/);
  assert.match(route, /async function findNextTaskRow/);
  assert.match(route, /A\$\{row\}:I\$\{row\}/);
  assert.match(route, /valueInputOption=USER_ENTERED`, \{ method: "PUT"/);
  assert.doesNotMatch(route, /insertDataOption=INSERT_ROWS/);
  assert.match(route, /row\.some\(\(cell\) => cell === taskId\)/);
});

test("lead management provides a localized four-state operational dashboard", async () => {
  const [dashboard, admin, page, systemLocale, route, schema, styles] = await Promise.all([
    read("app/tools/SubmissionsClient.tsx"),
    read("app/admin/AdminClient.tsx"),
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
  assert.match(dashboard, /key === "market:il" \? t\.israel/);
  assert.match(dashboard, /israel: "ישראל"/);
  assert.match(dashboard, /normalizeSystemLocale\(systemLocale\)/);
  assert.match(dashboard, /document\.documentElement\.lang = locale/);
  assert.match(dashboard, /document\.documentElement\.dir = locale === "he" \? "rtl" : "ltr"/);
  assert.match(admin, /document\.documentElement\.lang = uiLocale/);
  assert.match(admin, /document\.documentElement\.dir = direction/);
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
  assert.match(widget, /dataset\.accessibilityWidget !== "true"/);
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

  assert.match(siteStyles, /\.back-to-top\s*\{[\s\S]*?bottom:\s*86px;/);
  assert.match(siteStyles, /@media \(max-width:\s*700px\)[\s\S]*?\.back-to-top\s*\{[\s\S]*?bottom:\s*74px;/);
  assert.match(home, /desktop-nav[\s\S]*?global-accessibility-link/);
  assert.match(home, /mobile-menu[\s\S]*?global-accessibility-link/);

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
    manifestSource,
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
    read("scripts/generate-market-copy-manifest.mjs"),
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
  assert.match(client, /Spa businesses only/);
  assert.match(client, /Entreprises de spa seulement/);
  assert.match(client, /Commission only on confirmed SpaPlus bookings/);
  assert.match(client, /No monthly fee or extra costs/);
  assert.match(client, /No long-term commitment/);
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
  assert.match(client, /formRegionPlaceholder/);
  assert.match(client, /formSpaTypePlaceholder/);
  assert.match(client, /formLocationsPlaceholder/);
  assert.match(client, /formPreferredContactPlaceholder/);
  assert.match(manifestSource, /formRegionPlaceholder/);
  assert.match(manifestSource, /formSpaTypePlaceholder/);
  assert.match(manifestSource, /formLocationsPlaceholder/);
  assert.match(manifestSource, /formPreferredContactPlaceholder/);
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

  assert.match(route, /quebec_spa_partner_enquiry/);
  assert.match(route, /`\$\{marketSlug\}_spa_early_access`/);
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
  assert.match(templates, /GLOBAL SPA MANAGEMENT LTD/);
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

test("Québec partner funnel is bilingual, active-market aware and separately managed", async () => {
  const [englishPage, frenchPage, client, marketsSource, route, access, admin, sitemap] = await Promise.all([
    read("app/en-ca/quebec/page.tsx"),
    read("app/fr-ca/quebec/page.tsx"),
    read("app/market-launch/MarketLaunchPage.tsx"),
    read("app/market-launch/markets.ts"),
    read("app/api/market-spa-leads/route.ts"),
    read("app/cms-access.ts"),
    read("app/admin/AdminClient.tsx"),
    read("public/app-sitemap.xml"),
  ]);

  assert.match(englishPage, /https:\/\/app\.spaplus\.co\/en-ca\/quebec\//);
  assert.match(frenchPage, /https:\/\/app\.spaplus\.co\/fr-ca\/quebec\//);
  assert.match(englishPage, /"geo.region": "CA-QC"/);
  assert.match(frenchPage, /inLanguage: "fr-CA"/);
  assert.match(marketsSource, /SPAPLUS IS ALREADY IN QUÉBEC/);
  assert.match(marketsSource, /SPAPLUS EST DÉJÀ AU QUÉBEC/);
  assert.match(marketsSource, /marketSlug: "quebec"/);
  assert.match(marketsSource, /cmsSection: "market.ca-qc"/);
  assert.match(marketsSource, /resourceKey: "market:ca:qc"/);
  assert.match(marketsSource, /timeZone: "America\/Montreal"/);
  assert.match(route, /quebec_spa_partner_enquiry/);
  assert.match(route, /Québec spa partner/);
  assert.match(route, /galia@spaplus\.ca/);
  assert.match(route, /activeMarket: marketSlug === "quebec"/);
  assert.match(route, /const useOntarioEmailDelivery = marketSlug === "quebec"/);
  assert.match(route, /CLOUDFLARE_EMAIL_API_TOKEN/);
  assert.match(route, /CLOUDFLARE_EMAIL_ACCOUNT_ID/);
  assert.match(route, /email\/sending\/send/);
  assert.match(route, /SpaPlus Canada <hello@mailca\.spaplus\.co>/);
  assert.match(route, /spaplus-\$\{marketSlug\}-website-owner-\$\{submissionId\}/);
  assert.match(access, /market:ca:qc/);
  assert.match(admin, /tab === "quebec"/);
  assert.match(client, /\/en-ca\/quebec\//);
  assert.match(client, /protectedSpaLeadFormFlags/);
  assert.match(client, /"formFieldPhoneVisible"/);
  assert.match(client, /"formFieldSpaTypeVisible"/);
  assert.match(client, /"formFieldServicesVisible"/);
  assert.match(client, /const requiredSpaLeadFields = new Set\(\[[\s\S]*?"Organization"[\s\S]*?"Phone"[\s\S]*?"Name"[\s\S]*?"City"[\s\S]*?"Email"[\s\S]*?\]\)/);
  assert.match(client, /marketSlug === "quebec" \|\| marketSlug === "ontario"[\s\S]*?requiredSpaLeadFields\.has\(field\)/);
  assert.match(client, /Only five business details are required\./);
  assert.match(client, /Seulement cinq renseignements sur l’entreprise sont obligatoires\./);
  assert.match(client, /data-validation-attempted=\{validationAttempted\}/);
  assert.match(client, /data-error-label=\{tr\("Business address", "Adresse de l’entreprise"\)\}/);
  assert.match(client, /data-error-label=\{tr\("Business website or Instagram", "Site Web ou Instagram de l’entreprise"\)\}/);
  assert.match(client, /\(marketSlug === "quebec" \|\| marketSlug === "ontario" \|\| marketSlug === "israel"\) && protectedSpaLeadFormFlags\.has\(field\)/);
  assert.match(client, /if \(!form\.checkValidity\(\)\)/);
  assert.match(client, /form\.querySelector<HTMLElement>\(":invalid"\)\?\.focus\(\)/);
  assert.match(client, /form\.reportValidity\(\)/);
  assert.match(client, /noValidate/);
  assert.match(client, /aria-busy=\{submitState === "submitting"\}/);
  assert.match(client, /aria-describedby=\{submitState === "error" \? "market-form-error" : undefined\}/);
  assert.match(client, /id="market-form-error"/);
  assert.match(client, /id="phone"[\s\S]*?required=\{fieldRequired\("Phone"\)\}[\s\S]*?minLength=\{7\}/);
  assert.match(route, /const requiredSpaLeadFields = new Set\(\[[\s\S]*?"Organization"[\s\S]*?"Phone"[\s\S]*?"Name"[\s\S]*?"City"[\s\S]*?"Email"[\s\S]*?\]\)/);
  assert.match(route, /marketSlug === "quebec" \|\| marketSlug === "ontario"[\s\S]*?requiredSpaLeadFields\.has\(field\)/);
  assert.match(route, /marketSlug === "canada" && !data\.region/);
  assert.match(route, /if \(isEmail\(data\.email\)\)/);
  assert.match(sitemap, /https:\/\/app\.spaplus\.co\/en-ca\/quebec\//);
  assert.match(sitemap, /https:\/\/app\.spaplus\.co\/fr-ca\/quebec\//);
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
  assert.match(admin, /disabled=\{contentLoading \|\| !marketDraftCount \|\| Boolean\(savingAction\)\}/);
  assert.match(client, /marketCopyFieldKey/);
  assert.match(client, /dynamicCopy/);
  assert.match(client, /isNetwork \? "seoTitleOutsideOntario" : "seoTitle"/);
  assert.match(worker, /applyManagedOntarioMetadata/);
  assert.match(worker, /copy\.seoTitle/);
  assert.match(worker, /no-store, must-revalidate/);
});

test("Canada partner funnel excludes Ontario and requires another Canadian region", async () => {
  const [marketConfig, client, route, englishPage, frenchPage, analytics] = await Promise.all([
    read("app/market-launch/markets.ts"),
    read("app/market-launch/MarketLaunchPage.tsx"),
    read("app/api/market-spa-leads/route.ts"),
    read("app/en-ca/canada/page.tsx"),
    read("app/fr-ca/canada/page.tsx"),
    read("app/analytics.ts"),
  ]);

  const canadaRegions = marketConfig.match(/const canadaRegions = \[([\s\S]*?)\] as const;/)?.[1] || "";
  assert.doesNotMatch(canadaRegions, /\["Ontario", "Ontario"\]/);
  assert.match(marketConfig, /regionOptions: canadaRegionOptions/);
  assert.match(client, /name="region"/);
  assert.match(client, /Ontario is not included here/);
  assert.match(route, /marketSlug === "canada" \|\| marketSlug === "quebec"/);
  assert.match(route, /Canada outside Ontario spa partner/);
  assert.match(englishPage, /outside Ontario/);
  assert.match(frenchPage, /hors Ontario/);
  assert.match(analytics, /site === "ontario"/);
  assert.match(analytics, /AnalyticsSite = "global" \| "ontario" \| "canada"/);
});

test("Adir project showcase is public, branded and managed from the main administration", async () => {
  const [portal, portalCss, projectsClient, projectsRoute, publicRoute, page, worker, config] = await Promise.all([
    read("app/adir/AdirProjectsClient.tsx"),
    read("app/adir/adir-projects.css"),
    read("app/admin/projects/ProjectsClient.tsx"),
    read("app/api/cms/projects/route.ts"),
    read("app/api/cms/projects-public/route.ts"),
    read("app/adir/page.tsx"),
    read("worker/index.ts"),
    read("wrangler.public.jsonc"),
  ]);
  assert.match(config, /"pattern": "adir\.spaplus\.co"/);
  assert.match(config, /"custom_domain": true/);
  assert.doesNotMatch(worker, /PROJECT_PORTAL_COOKIE/);
  assert.match(worker, /projectShowcaseData/);
  assert.match(worker, /User-agent: \*\\nAllow: \//);
  assert.match(worker, /sitemap\.xml/);
  assert.match(worker, /x-frame-options/);
  assert.match(projectsClient, /עמוד תדמית ציבורי/);
  assert.match(projectsClient, /moveShowcaseProject/);
  assert.match(projectsClient, /קישור כניסה לאתר/);
  assert.match(projectsClient, /הצגה בעמוד הציבורי/);
  assert.match(projectsRoute, /kind === "showcase_order"/);
  assert.match(projectsRoute, /project_showcase_order/);
  assert.match(publicRoute, /publicVisible/);
  assert.doesNotMatch(publicRoute, /PROJECT_PORTAL_BACKEND_SECRET/);
  assert.match(worker, /SITES_BYPASS_TOKEN/);
  assert.doesNotMatch(publicRoute, /blockers: project\.blockers/);
  assert.match(portal, /הפרויקטים של אדיר/);
  assert.match(portal, /adir-ai-empire-icon\.png/);
  assert.match(portal, /כניסה לפרויקט/);
  assert.match(portal, /google\.com\/s2\/favicons/);
  assert.doesNotMatch(portal, /adir-filters|adir-manifesto|adir-numbers/);
  assert.match(page, /index: true/);
  assert.match(page, /https:\/\/adir\.spaplus\.co\//);
  assert.match(portalCss, /"SpaPlus Heebo",Arial,sans-serif!important/);
  assert.match(portalCss, /@media\(max-width:640px\)/);
});

test("operations includes a clearly labelled illustrative sales dashboard and downloadable reports", async () => {
  const [page, client, css, operations] = await Promise.all([
    read("app/admin/operations/dashboard-preview/page.tsx"),
    read("app/admin/operations/dashboard-preview/DashboardPreviewClient.tsx"),
    read("app/admin/operations/dashboard-preview/dashboard-preview.css"),
    read("app/admin/operations/OperationsClient.tsx"),
  ]);
  assert.match(page, /requireAuthorizedAdmin/);
  assert.match(client, /נתוני המחשה בלבד/);
  assert.match(client, /מקור הנתונים המאומת של גל/);
  assert.match(client, /הכנסה ברוטו/);
  assert.match(client, /מרכז הדוחות/);
  assert.match(client, /new Blob/);
  assert.match(client, /text\/csv/);
  assert.match(operations, /dashboard-preview/);
  assert.match(css, /SpaPlus Heebo/);
  assert.match(css, /@media\(max-width:650px\)/);
});

test("spa preview migrations are safe to replay after a partial deployment", async () => {
  const migrations = await Promise.all([
    read("drizzle/0008_cute_orphan.sql"),
    read("drizzle/0009_spa_previews_runtime.sql"),
  ]);
  for (const migration of migrations) {
    assert.match(migration, /CREATE TABLE IF NOT EXISTS `spa_previews`/);
    assert.match(migration, /CREATE UNIQUE INDEX IF NOT EXISTS `spa_previews_slug_unique`/);
  }
});

test("spa preview builder stays English LTR with large controls and lead header links stay legible", async () => {
  const [builderPage, builderCss, leadsCss] = await Promise.all([
    read("app/admin/spa-previews/page.tsx"),
    read("app/admin/spa-previews/spa-previews-fast.css"),
    read("app/tools/leads.css"),
  ]);

  assert.match(builderPage, /className="spa-cms-shell" dir="ltr" lang="en"/);
  assert.doesNotMatch(builderPage, /admin\.systemLocale === "he"/);
  assert.match(builderCss, /\.spa-cms-card label\{[^}]*font-size:19px/);
  assert.match(builderCss, /\.spa-cms-card input,[^{]+\{[^}]*min-height:62px/);
  assert.match(builderCss, /\.spa-cms-card textarea\{[^}]*min-height:150px/);
  assert.match(builderCss, /@media\(max-width:600px\)[\s\S]*?\.spa-cms-save\{position:static/);
  assert.match(leadsCss, /\.cms-header \.cms-user \.cms-preview\{[^}]*color:#fff/);
  assert.match(leadsCss, /-webkit-text-fill-color:#fff/);
});

test("spa preview builder creates a complete bilingual profile from only the spa name", async () => {
  const [builder, profile, page, api, schema, migration, mediaSource] = await Promise.all([
    read("app/admin/spa-previews/SpaPreviewManager.tsx"),
    read("app/ca/[slug]/CanadaSpaProfile.tsx"),
    read("app/ca/[slug]/page.tsx"),
    read("app/api/cms/spa-previews/route.ts"),
    read("db/schema.ts"),
    read("drizzle/0012_spa_preview_bilingual_content.sql"),
    read("project_knowledge/SPA_PREVIEW_DEFAULT_MEDIA.md"),
  ]);

  assert.match(builder, /useState<Draft>\(\(\) => completeDraft\(\)\)/);
  assert.match(builder, /localizedContent: SpaPreviewLocalizations = \{ en: templateContent\("en"\), "fr-CA": templateContent\("fr-CA"\) \}/);
  assert.match(builder, /defaultPhotoUrls = \[1, 2, 3, 4, 5\]/);
  assert.match(builder, /defaultLogoUrl = "https:\/\/app\.spaplus\.co\/spa-preview-logo\.svg"/);
  assert.match(builder, /<label>Spa name<input required/);
  assert.doesNotMatch(builder, /<label>Address<textarea required/);
  assert.doesNotMatch(builder, /<label>About us<textarea required/);
  assert.doesNotMatch(builder, /<label>Name<input required/);
  assert.match(builder, /Open English/);
  assert.match(builder, /Open French/);
  assert.match(builder, /English \+ Français/);
  assert.match(builder, /fetch\(`\/admin\/spa-previews\/records\?fresh=\$\{Date\.now\(\)\}`/);
  assert.match(profile, /toggleLanguage/);
  assert.match(profile, /window\.history\.replaceState/);
  assert.match(profile, /Images d’illustration/);
  assert.match(profile, /Illustrative images/);
  assert.doesNotMatch(profile, /\{packageFilter !== "couple" \? <article/);
  assert.doesNotMatch(profile, /\{treatmentFilter === "solo" \? <div/);
  assert.match(page, /initialLanguage=\{lang === "fr-CA" \? "fr-CA" : "en"\}/);
  assert.match(api, /localizedContent: JSON\.stringify\(data\.localizedContent\)/);
  assert.match(api, /"Cache-Control": "no-store, max-age=0"/);
  assert.match(schema, /localizedContent: text\("localized_content"\)/);
  assert.match(migration, /ALTER TABLE `spa_previews` ADD `localized_content`/);
  assert.match(mediaSource, /generated specifically for SpaPlus recruitment previews/);
  for (let number = 1; number <= 5; number += 1) {
    await stat(new URL(`public/spa-preview-gallery-${number}.webp`, root));
  }
  await stat(new URL("public/spa-preview-logo.svg", root));
});
