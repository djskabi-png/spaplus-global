import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeUrl = new URL(
  "../app/api/integrations/meta-ontario-leads/route.ts",
  import.meta.url,
);

test("Meta spa leads are archived, attributed and emailed to the verified owners", async () => {
  const route = await readFile(routeUrl, "utf8");

  assert.match(route, /source: `Meta paid lead form \| \$\{market\.name\}`/);
  assert.match(route, /resourceKey: market\.resourceKey/);
  assert.match(route, /status: "new"/);
  assert.match(route, /adir@spaplus\.co\.il,galia@spaplus\.ca/);
  assert.match(route, /buildMarketOwnerEmail/);
  assert.match(route, /spaplus-\$\{market\.slug\}-meta-owner-/);
  assert.match(route, /await sendMarketOwnerNotification\([\s\S]*?notificationData,[\s\S]*?leadId,[\s\S]*?market,/);
  assert.match(route, /dedupeByContact\?: boolean/);
  assert.match(route, /enrichExisting\?: boolean/);
  assert.match(route, /updates: Partial<Pick<typeof formSubmissions\.\$inferInsert, "phone" \| "organization">>/);
  assert.match(route, /\.update\(formSubmissions\)\.set\(updates\)\.where\(eq\(formSubmissions\.id, existing\.id\)\)/);
  assert.match(route, /enrichExisting: true/);
  assert.match(route, /else if \(outcome === "enriched"\) enriched \+= 1/);
  assert.match(route, /sendVisitorEmail !== false/);
  assert.match(route, /leadId\?: string/);
  assert.match(route, /organization\?: string/);
  assert.match(route, /suppressNotifications/);
  assert.match(route, /leadId\s*\?\s*`meta-\$\{market\.slug\}:\$\{leadId\}`/);
  assert.match(route, /organization,/);
  assert.match(route, /recover_campaign/);
  assert.match(route, /x-spaplus-recovery-token/);
  assert.match(route, /META_RECOVERY_TOKEN/);
});

test("Meta leads distinguish Québec from Ontario before storage and notification", async () => {
  const route = await readFile(routeUrl, "utf8");

  assert.match(route, /const QUEBEC_MARKET/);
  assert.match(route, /resourceKey: "market:ca:qc"/);
  assert.match(route, /function inferMarket/);
  assert.match(route, /QUEBEC_FORM_MARKET_IDS\.has\(formId\)/);
  assert.match(route, /ONTARIO_FORM_MARKET_IDS\.has\(formId\)/);
  assert.match(route, /directSignal\.includes\("ontario"\)/);
  assert.match(route, /directSignal\.includes\("quebec"\) \|\| directSignal\.includes\("québec"\)/);
  assert.match(route, /const submissionId = `meta-\$\{market\.slug\}:\$\{leadId\}`/);
});

test("Israel Meta leads route to the Israel CRM market and Hebrew owner workflow", async () => {
  const route = await readFile(routeUrl, "utf8");

  assert.match(route, /const ISRAEL_MARKET/);
  assert.match(route, /slug: "israel"/);
  assert.match(route, /name: "ישראל"/);
  assert.match(route, /resourceKey: "market:il"/);
  assert.match(route, /pageUrl: "https:\/\/app\.spaplus\.co\/he-il\/israel\//);
  assert.match(route, /timeZone: "Asia\/Jerusalem"/);
  assert.match(route, /META_ISRAEL_FORM_IDS/);
  assert.match(route, /directSignal\.includes\("ישראל"\)/);
  assert.match(route, /campaignSignal\.includes\("ישראל"\)/);
  assert.match(route, /market\.slug === "israel" \? "he-IL"/);
  assert.match(route, /שם בית הספא או העסק/);
  assert.match(route, /שם בית הספא/);
  assert.match(route, /שם העסק/);
  assert.match(route, /עיר או יישוב בישראל/);
  assert.match(route, /עיר \/ יישוב/);
  assert.match(route, /market\.slug !== "israel"/);
  assert.match(route, /META_\$\{market\.slug\.toUpperCase\(\)\}_CONTACT_TO_EMAILS/);
});

test("Ontario Meta lead custom fields support the English and Canadian French forms", async () => {
  const route = await readFile(routeUrl, "utf8");

  assert.match(route, /name_of_your_spa_or_business/);
  assert.match(route, /nom_de_votre_spa_ou_entreprise/);
  assert.match(route, /your_city_or_region/);
  assert.match(route, /votre_ville_ou_region/);
  assert.match(route, /website_or_social_media_page/);
  assert.match(route, /site_web_ou_page_de_reseau_social/);
});

test("Meta webhook reports failures so Meta can retry safely", async () => {
  const route = await readFile(routeUrl, "utf8");

  assert.match(route, /const result = await processLeadValues\(values\)/);
  assert.match(route, /status: 503/);
  assert.match(route, /return options\.enrichExisting/);
  assert.match(route, /return "inserted" as const/);
});

test("Meta webhook requires a valid signature and accepts every form owned by the Canada page", async () => {
  const route = await readFile(routeUrl, "utf8");

  assert.match(route, /values\.every\(\(value\) => META_ALLOWED_PAGE_IDS\.has\(clean\(value\.page_id\)\)\)/);
  assert.match(route, /if \(!hasValidSignature \|\| !hasAllowedLeadContext\)/);
  assert.doesNotMatch(route, /META_FORM_IDS/);
});

test("Meta webhook explicitly allows the Canadian and Israeli pages with conservative defaults", async () => {
  const route = await readFile(routeUrl, "utf8");

  assert.match(route, /META_CANADA_PAGE_ID = setting\("META_CANADA_PAGE_ID"\) \|\| "1065026380020011"/);
  assert.match(route, /META_ISRAEL_PAGE_ID = setting\("META_ISRAEL_PAGE_ID"\) \|\| "120456011329432"/);
  assert.match(route, /new Set\(\[META_CANADA_PAGE_ID, META_ISRAEL_PAGE_ID\]\)/);
  assert.match(route, /META_ALLOWED_PAGE_IDS\.has\(clean\(value\.page_id\)\)/);
});

test("Meta Graph reads use market-specific page tokens with a safe shared fallback", async () => {
  const route = await readFile(routeUrl, "utf8");

  assert.match(route, /function pageAccessToken\(pageId = ""\)/);
  assert.match(route, /META_ISRAEL_PAGE_ACCESS_TOKEN/);
  assert.match(route, /META_CANADA_PAGE_ACCESS_TOKEN/);
  assert.match(route, /configured \|\| setting\("META_PAGE_ACCESS_TOKEN"\)/);
  assert.match(route, /fetchLead\(leadgenId, value\.page_id\)/);
  assert.match(route, /fetchName\(formId, webhookValue\.page_id\)/);
});

test("Israel owner notifications render Hebrew lead details and never send visitor email", async () => {
  const route = await readFile(routeUrl, "utf8");

  assert.match(route, /languageTag: market\.slug === "israel" \? "he-IL" : "en-CA"/);
  assert.match(route, /const owner = buildMarketOwnerEmail\(data, ownerContext\)/);
  assert.match(route, /const visitor = buildMarketVisitorEmail\(data, visitorContext\)/);
  assert.match(route, /market\.slug !== "israel"/);
  assert.match(route, /city,/);
  assert.match(route, /lead_id: leadId/);

  const template = await readFile(new URL("../app/market-email-templates.ts", import.meta.url), "utf8");
  assert.match(template, /בית הספא/);
  assert.match(template, /איש קשר/);
  assert.match(template, /דוא״ל/);
  assert.match(template, /טלפון/);
});

test("Meta recovery reads leads from campaign ads and classifies each lead independently", async () => {
  const route = await readFile(routeUrl, "utf8");

  assert.match(route, /\$\{encodeURIComponent\(campaignId\)\}\/ads/);
  assert.match(route, /\$\{encodeURIComponent\(adId\)\}\/leads/);
  assert.match(route, /inferMarket\(clean\(lead\.form_id\), formName, campaignName, adName\)/);
  assert.match(route, /markets\[leadMarket\.slug\] \+= 1/);
  assert.doesNotMatch(route, /enrichExisting: true, market, sendVisitorEmail: false/);
});
