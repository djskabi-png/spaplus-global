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
  assert.match(html, /href="\.\/style\.css"/i);
  assert.match(html, /src="\.\/script\.js"/i);

  for (const id of [
    "main-content",
    "top",
    "countries",
    "vision",
    "story",
    "contact",
    "about",
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }

  assert.match(html, /class="founder-photo"/);
  assert.match(html, /href="mailto:info@spaplus\.ca"/);
  assert.match(html, /class="button button-primary copy-email"/);
  assert.match(html, /href="https:\/\/www\.spaplus\.co\.il\/"/);
  assert.match(html, /href="https:\/\/spaplus\.ca\/en\/"/);
});

test("all nine localized experiences are included", async () => {
  const script = await read("codepen/script.js");

  for (const locale of localeCodes) {
    assert.match(script, new RegExp(`"${locale}"\\s*:`));
  }

  assert.match(script, /new URLSearchParams\(location\.search\)\.get\("lang"\)/);
  assert.match(script, /history\.replaceState/);
  assert.match(script, /founderPhotoDataUri/);
  assert.match(script, /emailCopied/);
});

test("public copy follows the SpaPlus writing rules", async () => {
  const files = await Promise.all([
    read("codepen/index.html"),
    read("codepen/script.js"),
    read("app/page.tsx"),
    ...localeCodes.map((locale) => read(`app/i18n/${locale}.ts`)),
  ]);
  const copy = files.join("\n");

  assert.doesNotMatch(copy, /[—–]/);
  assert.doesNotMatch(copy, /🌐|→/);
});
