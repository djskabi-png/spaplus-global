import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const localeCodes = ["en", "he", "fr-CA", "ru", "el", "it", "hu", "pl", "es"];

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
  assert.match(script, /setText\("\.usa-status-local", t\.comingSoon\)/);
  assert.match(script, /setText\("\.route-israel strong", t\.israelName\)/);
  assert.match(script, /setAllText\("\.platform-pillars span", platformPillars\[locale\]\)/);
  assert.match(script, /scrollProgress\.style\.transform/);
  assert.match(script, /formsubmit\.co\/ajax\//);
  assert.match(script, /_template: "box"/);
  assert.match(script, /await fetch\(contactFormEndpoint/);
  assert.match(script, /openSuccessModal\(\)/);
  assert.match(script, /"Privacy consent": privacyAccepted \? "Accepted" : "Not accepted"/);
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
  assert.match(templates, /'Segoe UI', Tahoma, Arial, sans-serif/);
  assert.doesNotMatch(templates, /fonts\.googleapis\.com/);
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
  assert.match(script, /formsubmit\.co\/ajax\//);
  assert.match(script, /"Privacy consent"/);
  assert.match(script, /This is not an investment offer/);
  assert.match(script, /אין מדובר בהצעת השקעה/);
  assert.match(script, /"Partnership acknowledgement"/);
  assert.match(script, /external form service provider/);
  assert.match(script, /focusable/);
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /@media \(max-width: 380px\)/);
  assert.match(homeHtml, /href="\.\/country-partners\/\?lang=en"/);
  assert.match(homeScript, /\.\/country-partners\/\?lang=/);
  assert.match(hebrewHtml, /<html lang="he" dir="rtl">/);
  assert.match(hebrewHtml, /<link rel="canonical" href="https:\/\/djskabi-png\.github\.io\/spaplus-global\/country-partners\/he\/">/);
  assert.match(hebrewHtml, /<title>שותפי מדינה של SpaPlus/);
  assert.match(hebrewHtml, /aria-label="בחירת שפה"/);
  assert.match(hebrewHtml, /<script src="\.\.\/script\.js\?v=/);
  assert.doesNotMatch(hebrewHtml, /<script src="\.\.\/\.\.\/script\.js/);
  assert.doesNotMatch(`${html}\n${hebrewHtml}\n${script}\n${css}`, /chatgpt\.site|openai|generated by ai/i);
});
