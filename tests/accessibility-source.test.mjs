import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const codepenRoot = path.join(root, "codepen");

async function collectHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectHtml(target)));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(target);
  }
  return files;
}

function relative(file) {
  return path.relative(codepenRoot, file).replaceAll("\\", "/");
}

function luminance(hex) {
  const channels = hex
    .replace("#", "")
    .match(/.{2}/g)
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("every generated public page keeps the baseline accessibility structure", async () => {
  const files = await collectHtml(codepenRoot);
  assert.equal(files.length, 146);
  for (const file of files) {
    const html = await readFile(file, "utf8");
    const skipTarget = html.match(/<a[^>]+href="#(main|main-content)"[^>]*>/)?.[1];
    assert.ok(skipTarget, `${relative(file)} is missing a skip link`);
    assert.match(
      html,
      new RegExp(`<main[^>]+id="${skipTarget}"`),
      `${relative(file)} has no target for its skip link`,
    );
    assert.equal(
      [...html.matchAll(/<h1(?:\s|>)/g)].length,
      1,
      `${relative(file)} must contain one h1`,
    );
    assert.match(html, /accessibility\.css/, `${relative(file)} is missing accessibility.css`);
    assert.match(html, /accessibility\.js/, `${relative(file)} is missing accessibility.js`);
  }
});

test("all spa funnels expose progress and focusable step headings", async () => {
  const files = (await collectHtml(codepenRoot)).filter((file) =>
    relative(file).includes("/spas/join/"),
  );
  assert.equal(files.length, 36);
  for (const file of files) {
    const html = await readFile(file, "utf8");
    assert.match(html, /class="form-progress[^"]*" role="progressbar"/);
    assert.match(html, /aria-valuemin="1"/);
    assert.match(html, /aria-valuemax="2"/);
    assert.equal([...html.matchAll(/<legend tabindex="-1">/g)].length, 2);
  }
});

test("market templates retain navigation on mobile and strong focus indicators", async () => {
  const css = await readFile(path.join(codepenRoot, "markets", "market.css"), "utf8");
  assert.doesNotMatch(css, /\.market-header nav\{display:none\}/);
  assert.match(css, /@media\(max-width:900px\)\{\.market-header\{[^}]*flex-wrap:wrap/);
  assert.match(css, /:focus-visible\{outline:3px solid var\(--pink\)/);
  assert.match(css, /\.funnel-form input:focus[^}]*outline:3px solid var\(--pink\)/);
});

test("modal and multi-step scripts preserve keyboard focus", async () => {
  const market = await readFile(path.join(codepenRoot, "markets", "market.js"), "utf8");
  const home = await readFile(path.join(codepenRoot, "script.js"), "utf8");
  for (const [name, source] of [
    ["market", market],
    ["home", home],
  ]) {
    assert.match(source, /event\.key === "Escape"/, `${name} modal must close with Escape`);
    assert.match(source, /event\.key (?:!==|===) "Tab"/, `${name} modal must trap Tab`);
    assert.match(source, /\.inert = true/, `${name} modal must make its background inert`);
    assert.match(source, /LastFocused/, `${name} modal must restore focus`);
  }
  assert.match(market, /aria-valuenow/);
  assert.match(market, /querySelector\("legend"\)\?\.focus\(\)/);
});

test("manual accessibility modes affect fixed-size text, contrast and scripted motion", async () => {
  const accessibility = await readFile(path.join(codepenRoot, "accessibility.css"), "utf8");
  const home = await readFile(path.join(codepenRoot, "script.js"), "utf8");
  const market = await readFile(path.join(codepenRoot, "markets", "market.js"), "utf8");
  assert.match(accessibility, /html\.a11y-text-lg body\s*\{\s*zoom: 1\.125/);
  assert.match(accessibility, /html\.a11y-text-xl body\s*\{\s*zoom: 1\.25/);
  assert.match(accessibility, /html\.a11y-contrast a,[\s\S]*background-color: #000000 !important/);
  assert.match(home, /prefersReducedMotion\(\) \? "auto" : "smooth"/);
  assert.match(market, /prefersReducedMotion\(\) \? "auto" : "smooth"/);
});

test("primary brand buttons meet AA text contrast against white", async () => {
  const styles = [
    await readFile(path.join(root, "app", "globals.css"), "utf8"),
    await readFile(path.join(codepenRoot, "country-partners", "style.css"), "utf8"),
    await readFile(path.join(codepenRoot, "markets", "market.css"), "utf8"),
  ];
  for (const css of styles) {
    const pink = css.match(/--pink:\s*(#[0-9a-f]{6})/i)?.[1];
    assert.ok(pink, "missing --pink colour token");
    assert.ok(contrast(pink, "#ffffff") >= 4.5, `${pink} fails AA contrast with white`);
  }
});
