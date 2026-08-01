const fs = require("fs");
const path = require("path");
const sharp = require("../../node_modules/.pnpm/node_modules/sharp");

const root = path.resolve(__dirname, "../..");
const outDir = path.join(__dirname, "creative");
fs.mkdirSync(outDir, { recursive: true });

const brand = {
  navy: "#192d4c",
  navyDeep: "#102646",
  pink: "#cf0e5a",
  blush: "#fff0f6",
  white: "#ffffff",
  soft: "#eef3f8"
};

const logoMark = path.join(root, "public", "spaplus-mark.png");
const logoWordmark = path.join(root, "public", "spaplus-wordmark.png");
const sources = {
  concept: path.join(root, "public", "ontario", "hero-ontario-campaign-v2.jpg"),
  quebec: path.join(root, "public", "ontario", "quebec-balnea.jpg")
};

const formats = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 }
};

const copy = {
  en: {
    a: {
      eyebrow: "ONTARIO, YOU'RE NEXT",
      title: ["Founding spa", "partners wanted."],
      body: ["Free registration.", "No commitment. No credit card."],
      cta: "INTRODUCE YOUR SPA",
      note: "Illustrative launch concept. Not an Ontario partner location."
    },
    b: {
      eyebrow: "LIVE IN QUÉBEC. ONTARIO IS NEXT.",
      title: ["Bring your hotel", "or resort spa", "to SpaPlus."],
      body: ["A new discovery and booking", "channel is coming to Ontario."],
      cta: "JOIN THE FOUNDING LIST",
      note: "SpaPlus Canada platform imagery from Québec."
    },
    c: {
      eyebrow: "A STRONGER WAY TO GROW",
      title: ["More discovery.", "More guests.", "One spa platform."],
      body: ["For established Ontario spas,", "hotel spas and wellness venues."],
      cta: "JOIN SPA PLUS ONTARIO",
      note: "Free registration. No commitment. No credit card."
    }
  },
  fr: {
    a: {
      eyebrow: "L'ONTARIO, C'EST À VOTRE TOUR",
      title: ["Spas fondateurs", "recherchés."],
      body: ["Inscription gratuite.", "Sans engagement. Sans carte de crédit."],
      cta: "PRÉSENTEZ VOTRE SPA",
      note: "Concept visuel. Il ne s'agit pas d'un spa partenaire en Ontario."
    },
    b: {
      eyebrow: "PRÉSENT AU QUÉBEC. BIENTÔT EN ONTARIO.",
      title: ["Présentez votre spa", "hôtelier ou centre", "de villégiature."],
      body: ["Un nouveau canal de découverte", "et de réservation arrive."],
      cta: "JOIGNEZ LA LISTE FONDATRICE",
      note: "Images de la plateforme SpaPlus Canada au Québec."
    },
    c: {
      eyebrow: "UNE MEILLEURE FAÇON DE GRANDIR",
      title: ["Plus de visibilité.", "Plus de clients.", "Une plateforme."],
      body: ["Pour les spas ontariens établis,", "les spas hôteliers et mieux-être."],
      cta: "JOIGNEZ SPAPLUS ONTARIO",
      note: "Inscription gratuite. Sans engagement. Sans carte de crédit."
    }
  }
};

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function textLines(lines, x, y, size, lineHeight, weight = 700, fill = brand.white) {
  return lines.map((line, index) =>
    `<text x="${x}" y="${y + index * lineHeight}" font-family="Noto Sans, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(line)}</text>`
  ).join("");
}

function overlaySvg({ width, height, item, concept }) {
  const side = Math.round(width * 0.075);
  const compact = height <= 1080;
  const titleSize = compact ? 76 : height >= 1800 ? 92 : 84;
  const titleLine = Math.round(titleSize * 1.03);
  const titleY = compact ? 445 : height >= 1800 ? 690 : 555;
  const bodyY = titleY + item.title.length * titleLine + 58;
  const ctaY = Math.min(height - 170, bodyY + 170);
  const noteY = height - 54;
  const photoOverlay = concept === "b" ? 0.48 : 0.56;
  const background = concept === "c"
    ? `<rect width="${width}" height="${height}" fill="${brand.blush}"/><circle cx="${width * 0.78}" cy="${height * 0.18}" r="${width * 0.45}" fill="#f9bdd5" opacity="0.5"/><circle cx="${width * 0.18}" cy="${height * 0.82}" r="${width * 0.38}" fill="#dce6f2" opacity="0.9"/><rect x="${side}" y="${side * 2.8}" width="${width - side * 2}" height="${height - side * 4.5}" rx="46" fill="${brand.navyDeep}"/>`
    : `<rect width="${width}" height="${height}" fill="rgba(10,25,45,${photoOverlay})"/><rect width="${width}" height="${height}" fill="url(#shade)"/>`;
  const textX = concept === "c" ? side * 1.7 : side;
  const titleFill = brand.white;
  const bodyFill = concept === "c" ? "#dbe5f1" : brand.white;
  return Buffer.from(`
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#102646" stop-opacity="0.12"/><stop offset="1" stop-color="#102646" stop-opacity="0.96"/></linearGradient></defs>
    ${background}
    <text x="${textX}" y="${compact ? 310 : height >= 1800 ? 520 : 420}" font-family="Noto Sans, Arial, sans-serif" font-size="30" font-weight="800" letter-spacing="3" fill="#ff78ae">${esc(item.eyebrow)}</text>
    ${textLines(item.title, textX, titleY, titleSize, titleLine, 800, titleFill)}
    ${textLines(item.body, textX, bodyY, compact ? 32 : 34, 48, 500, bodyFill)}
    <rect x="${textX}" y="${ctaY}" width="${Math.min(width - textX - side, 610)}" height="92" rx="46" fill="${brand.pink}"/>
    <text x="${textX + 36}" y="${ctaY + 59}" font-family="Noto Sans, Arial, sans-serif" font-size="30" font-weight="800" fill="white">${esc(item.cta)}</text>
    <text x="${textX}" y="${noteY}" font-family="Noto Sans, Arial, sans-serif" font-size="22" font-weight="500" fill="${concept === "c" ? "#aebbd0" : "#e5ebf2"}">${esc(item.note)}</text>
  </svg>`);
}

async function buildOne(lang, concept, format, size) {
  const item = copy[lang][concept];
  const background = concept === "a" ? sources.concept : concept === "b" ? sources.quebec : null;
  let image = background
    ? sharp(background).resize(size.width, size.height, { fit: "cover", position: concept === "b" ? "centre" : "east" })
    : sharp({ create: { ...size, channels: 4, background: brand.blush } });
  const logoMarkWidth = Math.round(size.width * 0.085);
  const logoWordWidth = Math.round(size.width * 0.15);
  const logoMarkBuffer = await sharp(logoMark).resize({ width: logoMarkWidth }).png().toBuffer();
  const logoWordBuffer = await sharp(logoWordmark).resize({ width: logoWordWidth }).png().toBuffer();
  const plateWidth = logoMarkWidth + logoWordWidth + 72;
  const plateHeight = logoMarkWidth + 36;
  const logoPlate = Buffer.from(`<svg width="${plateWidth}" height="${plateHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" rx="26" fill="white" fill-opacity="0.96"/></svg>`);
  const side = Math.round(size.width * 0.075);
  image = image.composite([
    { input: overlaySvg({ ...size, item, concept }), left: 0, top: 0 },
    { input: logoPlate, left: side, top: side },
    { input: logoMarkBuffer, left: side + 18, top: side + 18 },
    { input: logoWordBuffer, left: side + logoMarkWidth + 36, top: side + Math.round((plateHeight - logoMarkWidth * 0.28) / 2) }
  ]);
  const out = path.join(outDir, `${lang}-${concept}-${format}.jpg`);
  await image.jpeg({ quality: 92, chromaSubsampling: "4:4:4" }).toFile(out);
  return out;
}

(async () => {
  const files = [];
  for (const lang of Object.keys(copy)) {
    for (const concept of ["a", "b", "c"]) {
      for (const [format, size] of Object.entries(formats)) {
        files.push(await buildOne(lang, concept, format, size));
      }
    }
  }
  console.log(files.join("\n"));
})();
