import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Israel uses the complete market experience with Hebrew RTL copy", async () => {
  const [page, launchPage, copy, styles, sitemap] = await Promise.all([
    readFile(new URL("../app/he-il/israel/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/market-launch/MarketLaunchPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/market-launch/israel-market-copy.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/market-launch/market-launch.module.css", import.meta.url), "utf8"),
    readFile(new URL("../public/app-sitemap.xml", import.meta.url), "utf8"),
  ]);

  assert.match(page, /canonicalUrl = "https:\/\/app\.spaplus\.co\/he-il\/israel\/"/);
  assert.match(page, /index: true, follow: true/);
  assert.match(page, /<MarketLaunchPage config=\{israelMarket\}/);
  assert.match(launchPage, /document\.documentElement\.dir = isHebrew \? "rtl" : "ltr"/);
  assert.match(launchPage, /window\.matchMedia\("\(min-width: 981px\)"\)/);
  assert.match(launchPage, /if \(desktopViewport\.matches\) setMenuOpen\(false\)/);
  assert.match(launchPage, /<main[^>]+dir=\{isHebrew \? "rtl" : "ltr"\}/);
  assert.match(styles, /\[dir="rtl"\]/);
  assert.match(styles, /var\(--font-heebo/);
  assert.match(copy, /SPAPLUS בישראל מאז 2005/);
  assert.match(copy, /בתי הספא המובילים בישראל כבר איתנו/);
  assert.match(copy, /עכשיו תורכם להצטרף/);
  assert.match(copy, /אנחנו פתוחים להוסיף ל־SpaPlus בתי ספא איכותיים/);
  assert.match(launchPage, /marketSlug !== "israel"/);
  assert.match(styles, /\.page\[data-market="israel"\] \.hero h1/);
  assert.match(copy, /seoTitle: "הצטרפות בתי ספא ל־SpaPlus ישראל \| פועלים מאז 2005"/);
  assert.match(copy, /"Join SpaPlus": "הצטרפות ל־SpaPlus"/);
  assert.match(copy, /formCityLabelOutsideOntario: "עיר או יישוב בישראל"/);
  assert.doesNotMatch(copy, /דמי מנוי|ללא עלות|השקה ישראלית|מועד ההשקה|שותפים הראשונים|קבוצת השותפים|מקימה בישראל|מגיעה לישראל/);
  assert.match(copy, /הצוות שלנו בודק כל פנייה מלאה בתוך 72 שעות/);
  assert.match(sitemap, /https:\/\/app\.spaplus\.co\/he-il\/israel\//);
});

test("Israel market configuration is localized and uses verified network proof", async () => {
  const markets = await readFile(new URL("../app/market-launch/markets.ts", import.meta.url), "utf8");

  assert.match(markets, /export const israelMarket: MarketLaunchConfig/);
  assert.match(markets, /marketName: "ישראל"/);
  assert.match(markets, /languageTag: "he-IL"/);
  assert.match(markets, /pageMode: "network"/);
  assert.match(markets, /referenceMarketName: "SpaPlus ישראל"/);
  assert.match(markets, /ספא דה ג׳ורג׳/);
  assert.match(markets, /ספא דריה/);
  assert.match(markets, /ספא קלרינס/);
  assert.match(markets, /תל אביב והמרכז/);
  assert.match(markets, /ירושלים והסביבה/);
  assert.match(markets, /חיפה והצפון/);
  assert.match(markets, /showVideo: false/);
});

test("Israel recruitment form keeps protected market and acknowledgement fields", async () => {
  const [client, endpoint, mail, worker] = await Promise.all([
    readFile(new URL("../app/market-launch/MarketLaunchPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/market-spa-leads/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/market-email-templates.ts", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
  ]);

  assert.match(client, /marketSlug === "israel"/);
  assert.match(client, /!isIsrael && fieldVisible\("Services"\)/);
  assert.match(client, /!isIsrael && fieldVisible\("Role"\)/);
  assert.match(client, /dir="ltr"/);
  assert.match(client, /privacyAccepted: values\.get\("privacy"\) === "accepted"/);
  assert.match(client, /acknowledgementAccepted:/);
  assert.match(endpoint, /requestedLocale\.startsWith\("he"\)/);
  assert.match(endpoint, /marketSlug === "israel"/);
  assert.match(mail, /const isHebrew = languageTag\.toLowerCase\(\)\.startsWith\("he"\)/);
  assert.match(worker, /pathname !== "\/he-il\/israel"/);
  assert.match(worker, /'<html lang="he-IL" dir="rtl">'/);
});
