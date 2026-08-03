import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(root, "codepen");
const source = await readFile(path.join(outputRoot, "index.html"), "utf8");
const [partnerEnglish, partnerHebrew] = await Promise.all([
  readFile(path.join(outputRoot, "country-partners", "index.html"), "utf8"),
  readFile(path.join(outputRoot, "country-partners", "he", "index.html"), "utf8"),
]);

const routes = [
  ["en", "en", "ltr"],
  ["he", "he", "rtl"],
  ["fr-ca", "fr-CA", "ltr"],
  ["ru", "ru", "ltr"],
  ["el", "el", "ltr"],
  ["it", "it", "ltr"],
  ["hu", "hu", "ltr"],
  ["pl", "pl", "ltr"],
  ["es", "es", "ltr"],
];

const alternateLinks = routes
  .map(([segment, lang]) =>
    `<link rel="alternate" hreflang="${lang}" href="https://djskabi-png.github.io/spaplus-global/${segment}/">`,
  )
  .concat(
    '<link rel="alternate" hreflang="x-default" href="https://djskabi-png.github.io/spaplus-global/en/">',
  )
  .join("\n  ");

for (const [segment, lang, dir] of routes) {
  const directory = path.join(outputRoot, segment);
  await mkdir(directory, { recursive: true });
  const canonical = `https://djskabi-png.github.io/spaplus-global/${segment}/`;
  const html = source
    .replace(/<html lang="[^"]+"(?: dir="[^"]+")?>/, `<html lang="${lang}" dir="${dir}">`)
    .replace("<head>", `<head>\n  <base href="/spaplus-global/">`)
    .replace(
      /<link rel="canonical" href="[^"]+">/,
      `<link rel="canonical" href="${canonical}">`,
    )
    .replace(
      /<link rel="alternate" hreflang="[^"]+" href="[^"]+">(?:\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+">)*/,
      alternateLinks,
    )
    .replace(
      /<meta property="og:url" content="[^"]+">/,
      `<meta property="og:url" content="${canonical}">`,
    );
  await writeFile(path.join(directory, "index.html"), html, "utf8");
}

for (const [segment, sourceHtml, base] of [
  ["en", partnerEnglish, "/spaplus-global/country-partners/"],
  ["he", partnerHebrew, "/spaplus-global/country-partners/he/"],
]) {
  const directory = path.join(outputRoot, segment, "country-partners");
  await mkdir(directory, { recursive: true });
  const html = sourceHtml.replace("<head>", `<head>\n  <base href="${base}">`);
  await writeFile(path.join(directory, "index.html"), html, "utf8");
}

console.log(`Generated ${routes.length} physical language routes and 2 partner aliases.`);
