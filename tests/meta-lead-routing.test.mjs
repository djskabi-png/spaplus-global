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
  assert.match(route, /sendVisitorEmail !== false/);
  assert.match(route, /recover_campaign/);
  assert.match(route, /x-spaplus-recovery-token/);
  assert.match(route, /META_RECOVERY_TOKEN/);
});

test("Meta leads distinguish Québec from Ontario before storage and notification", async () => {
  const route = await readFile(routeUrl, "utf8");

  assert.match(route, /const QUEBEC_MARKET/);
  assert.match(route, /resourceKey: "market:ca:qc"/);
  assert.match(route, /function inferMarket/);
  assert.match(route, /signal\.includes\("quebec"\) \|\| signal\.includes\("québec"\)/);
  assert.match(route, /const submissionId = `meta-\$\{market\.slug\}:\$\{leadId\}`/);
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
  assert.match(route, /if \(existing\) return "duplicate" as const/);
  assert.match(route, /return "inserted" as const/);
});

test("Meta webhook requires a valid signature and accepts every form owned by the Canada page", async () => {
  const route = await readFile(routeUrl, "utf8");

  assert.match(route, /values\.every\(\(value\) => clean\(value\.page_id\) === META_PAGE_ID\)/);
  assert.match(route, /if \(!hasValidSignature \|\| !hasAllowedLeadContext\)/);
  assert.doesNotMatch(route, /META_FORM_IDS/);
});
