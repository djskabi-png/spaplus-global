import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Israel recruitment world is Hebrew, RTL and honest about its launch state", async () => {
  const [page, client] = await Promise.all([
    readFile(new URL("../app/he-il/israel/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/market-launch/IsraelMarketPage.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /canonicalUrl = "https:\/\/app\.spaplus\.co\/he-il\/israel\//);
  assert.match(page, /index: false, follow: false/);
  assert.match(client, /lang="he"/);
  assert.match(client, /dir="rtl"/);
  assert.match(client, /אינו מציג בית ספא ישראלי או שותף קיים/);
  assert.match(client, /לא\. העמוד נועד לגייס את קבוצת השותפים הראשונית/);
});

test("Israel recruitment form uses the dedicated market and safe acknowledgement fields", async () => {
  const [client, endpoint, mail] = await Promise.all([
    readFile(new URL("../app/market-launch/IsraelMarketPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/market-spa-leads/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/market-email-templates.ts", import.meta.url), "utf8"),
  ]);

  assert.match(client, /market: "israel"/);
  assert.match(client, /privacyAccepted: values\.get\("privacy"\) === "accepted"/);
  assert.match(client, /acknowledgementAccepted:/);
  assert.match(endpoint, /requestedLocale\.startsWith\("he"\)/);
  assert.match(endpoint, /marketSlug === "israel"/);
  assert.match(mail, /const isHebrew = languageTag\.toLowerCase\(\)\.startsWith\("he"\)/);
});
