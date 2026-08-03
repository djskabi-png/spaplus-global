import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRootLanguageRedirect } from "./root-language-redirect.mjs";

const source = path.resolve("codepen");
const target = path.resolve(".pages-dist");
const publicOrigin = "https://spaplus.co";
const githubOrigin = "https://djskabi-png.github.io/spaplus-global";
const legacyOrigin = "https://global.spaplus.co";

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

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
      .replaceAll(githubOrigin, publicOrigin)
      .replaceAll(legacyOrigin, publicOrigin)
      .replaceAll("/spaplus-global/", "/")
      .replace(
        /\s*<url><loc>https:\/\/spaplus\.co\/<\/loc><lastmod>[^<]+<\/lastmod><\/url>/g,
        "",
      );

    if (rewritten !== original) {
      await writeFile(fullPath, rewritten, "utf8");
    }
  }
}

await rewriteTree(target);
await writeFile(path.join(target, "index.html"), createRootLanguageRedirect(publicOrigin), "utf8");
console.log("Prepared SpaPlus Global for its public root domain.");
