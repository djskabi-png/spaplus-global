import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const source = path.resolve("codepen");
const target = path.resolve("public");
const productionOrigin = "https://spaplus.co";
const previewOrigin =
  "https://spaplus-global-brand.adir-naor-7510.chatgpt.site";
const githubOrigin = "https://djskabi-png.github.io/spaplus-global";
const generatedDirectories = [
  "country-partners",
  "de-ch",
  "de-de",
  "el",
  "el-cy",
  "el-gr",
  "en",
  "en-ae",
  "en-gb",
  "en-us",
  "es",
  "fr-ca",
  "fr-fr",
  "he",
  "hu",
  "hu-hu",
  "it",
  "it-it",
  "markets",
  "nb-no",
  "nl-nl",
  "pl",
  "ru",
  "sv-se",
];

const sharedFiles = [
  "accessibility.css",
  "accessibility.js",
  "adir-naor-founder.jpg",
  "bizspa-booking.jpg",
  "bizspa-logo.webp",
  "canada.jpg",
  "cyprus-market-hero.png",
  "favicon.svg",
  "hero.jpg",
  "israel.jpeg",
  "robots.txt",
  "script.js",
  "sitemap.xml",
  "spaplus-experience.jpeg",
  "style.css",
  "vision-people.webp",
  "vision-resort.webp",
  "vision-ritual.webp",
];

await mkdir(target, { recursive: true });

for (const directory of generatedDirectories) {
  const destination = path.join(target, directory);
  await rm(destination, { recursive: true, force: true });
  await cp(path.join(source, directory), destination, { recursive: true });
}

for (const file of sharedFiles) {
  await cp(path.join(source, file), path.join(target, file));
}

async function rewriteTree(directory) {
  for (const entry of await readdir(directory)) {
    const fullPath = path.join(directory, entry);
    const info = await stat(fullPath);
    if (info.isDirectory()) {
      await rewriteTree(fullPath);
      continue;
    }
    if (!/\.(html|css|js|xml|txt)$/i.test(entry)) continue;
    const original = await readFile(fullPath, "utf8");
    const rewritten = original
      .replaceAll(githubOrigin, productionOrigin)
      .replaceAll(`${previewOrigin}/api/contact`, "/api/contact")
      .replaceAll("/spaplus-global/", "/");
    if (rewritten !== original) await writeFile(fullPath, rewritten, "utf8");
  }
}

await rewriteTree(target);
