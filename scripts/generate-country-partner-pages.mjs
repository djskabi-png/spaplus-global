import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pageRoot = path.join(root, "codepen", "country-partners");
const [htmlSource, scriptSource] = await Promise.all([
  readFile(path.join(pageRoot, "index.html"), "utf8"),
  readFile(path.join(pageRoot, "script.js"), "utf8"),
]);

const copyStart = scriptSource.indexOf("{", scriptSource.indexOf("const copy"));
const copyEnd = scriptSource.indexOf("\n};", copyStart);
const translations = Function(
  `"use strict"; return (${scriptSource.slice(copyStart, copyEnd + 2)});`,
)();

function localizeElementText(html, key, value) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `(<([a-z0-9]+)(?=[^>]*data-copy="${escapedKey}")[^>]*>)([\\s\\S]*?)(<\\/\\2>)`,
    "gi",
  );
  return html.replace(pattern, `$1${value}$4`);
}

let hebrew = htmlSource
  .replace('<html lang="en" dir="ltr">', '<html lang="he" dir="rtl">')
  .replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${translations.he.pageTitle}</title>`,
  )
  .replace(
    /(<meta name="description" content=")[^"]*(">)/,
    `$1${translations.he.pageDescription}$2`,
  )
  .replace(
    /(<link rel="canonical" href=")[^"]*(">)/,
    '$1https://djskabi-png.github.io/spaplus-global/country-partners/he/$2',
  )
  .replace(
    /(<meta property="og:title" content=")[^"]*(">)/,
    `$1${translations.he.pageTitle}$2`,
  )
  .replace(
    /(<meta property="og:description" content=")[^"]*(">)/,
    `$1${translations.he.pageDescription}$2`,
  )
  .replace(
    /(<meta property="og:url" content=")[^"]*(">)/,
    '$1https://djskabi-png.github.io/spaplus-global/country-partners/he/$2',
  )
  .replace('href="./style.css', 'href="../style.css')
  .replace('src="./script.js', 'src="../script.js')
  .replaceAll('src="../spaplus-', 'src="../../spaplus-')
  .replaceAll('src="../adir-naor-founder.jpg', 'src="../../adir-naor-founder.jpg')
  .replaceAll('href="../"', 'href="../../"')
  .replaceAll('href="../#privacy"', 'href="../../#privacy"')
  .replace('<option value="en">English</option>', '<option value="en">English</option>')
  .replace('<option value="he">עברית</option>', '<option value="he" selected>עברית</option>');

for (const [key, value] of Object.entries(translations.he)) {
  hebrew = localizeElementText(hebrew, key, value);
}

hebrew = hebrew.replace(
  /<[^>]*data-aria-copy="([^"]+)"[^>]*>/g,
  (tag, key) =>
    translations.he[key]
      ? tag.replace(/aria-label="[^"]*"/, `aria-label="${translations.he[key]}"`)
      : tag,
);

const hebrewDir = path.join(pageRoot, "he");
await mkdir(hebrewDir, { recursive: true });
await writeFile(path.join(hebrewDir, "index.html"), hebrew, "utf8");
