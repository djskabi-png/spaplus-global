import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const analytics = fs.readFileSync(path.join(root, "app", "analytics.ts"), "utf8");
const launchPage = fs.readFileSync(
  path.join(root, "app", "market-launch", "MarketLaunchPage.tsx"),
  "utf8",
);

test("Ontario Meta Pixel uses the verified dataset and consent gate", () => {
  assert.match(analytics, /2038670133405498/);
  assert.match(analytics, /connect\.facebook\.net\/en_US\/fbevents\.js/);
  assert.match(analytics, /hasConsent\("ontario"\)/);
  assert.match(analytics, /window\.fbq\("track", "PageView"/);
});

test("Ontario lead completion sends one standard Meta Lead event", () => {
  assert.match(analytics, /eventName === "generate_lead"/);
  assert.match(analytics, /window\.fbq\("track", "Lead", metaParams\)/);
  assert.match(launchPage, /track\("generate_lead"/);
});

test("Ontario marketing events carry a province-specific reporting key", () => {
  assert.match(analytics, /province: "ontario"/);
  assert.match(analytics, /funnel: "spa_partner_recruitment"/);
});

