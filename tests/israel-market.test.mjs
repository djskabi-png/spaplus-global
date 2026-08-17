import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Israel uses the complete market experience with Hebrew RTL copy", async () => {
  const [page, launchPage, copy, styles] = await Promise.all([
    readFile(new URL("../app/he-il/israel/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/market-launch/MarketLaunchPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/market-launch/israel-market-copy.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/market-launch/market-launch.module.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /canonicalUrl = "https:\/\/app\.spaplus\.co\/he-il\/israel\/"/);
  assert.match(page, /index: false, follow: false/);
  assert.match(page, /<MarketLaunchPage config=\{israelMarket\}/);
  assert.match(launchPage, /document\.documentElement\.dir = isHebrew \? "rtl" : "ltr"/);
  assert.match(launchPage, /<main[^>]+dir=\{isHebrew \? "rtl" : "ltr"\}/);
  assert.match(styles, /\[dir="rtl"\]/);
  assert.match(styles, /var\(--font-heebo/);
  assert.match(copy, /יותר אורחים מחפשים חוויית ספא/);
  assert.match(copy, /seoTitle: "SpaPlus ישראל \| שותפים מבתי ספא"/);
  assert.match(copy, /אינה מציגה בית ספא ישראלי או שותף קיים/);
  assert.match(copy, /הצוות שלנו בודק כל פנייה מלאה בתוך 72 שעות/);
});

test("Israel market configuration is localized and uses verified network proof", async () => {
  const markets = await readFile(new URL("../app/market-launch/markets.ts", import.meta.url), "utf8");

  assert.match(markets, /export const israelMarket: MarketLaunchConfig/);
  assert.match(markets, /marketName: "ישראל"/);
  assert.match(markets, /languageTag: "he-IL"/);
  assert.match(markets, /referenceSpas,/);
  assert.match(markets, /תל אביב והמרכז/);
  assert.match(markets, /ירושלים והסביבה/);
  assert.match(markets, /חיפה והצפון/);
  assert.match(markets, /showVideo: false/);
});

test("Israel recruitment form keeps protected market and acknowledgement fields", async () => {
  const [client, endpoint, mail] = await Promise.all([
    readFile(new URL("../app/market-launch/MarketLaunchPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/market-spa-leads/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/market-email-templates.ts", import.meta.url), "utf8"),
  ]);

  assert.match(client, /marketSlug === "israel"/);
  assert.match(client, /privacyAccepted: values\.get\("privacy"\) === "accepted"/);
  assert.match(client, /acknowledgementAccepted:/);
  assert.match(endpoint, /requestedLocale\.startsWith\("he"\)/);
  assert.match(endpoint, /marketSlug === "israel"/);
  assert.match(mail, /const isHebrew = languageTag\.toLowerCase\(\)\.startsWith\("he"\)/);
});
