export type MarketLeadEmailData = {
  name: string;
  role: string;
  email: string;
  phone: string;
  organization: string;
  website: string;
  city: string;
  postalCode: string;
  spaType: string;
  locations: string;
  services: string[];
  bookingSystem: string;
  preferredContact: string;
  message: string;
  area: string;
  locale: string;
  source: string;
  campaign: Record<string, string>;
  submittedAt: string;
};

export type MarketEmailContext = {
  marketName: string;
  pageUrl: string;
  reviewWindowHours: number;
  languageTag: string;
  copy?: Record<string, string>;
};

const message = (
  context: MarketEmailContext,
  key: string,
  fallback: string,
  values: Record<string, string | number> = {},
) => (context.copy?.[key] || fallback).replace(/\{\{([a-zA-Z]+)\}\}/g, (_match, name: string) => String(values[name] ?? ""));

const logoUrl = "https://spaplus.co/spaplus-wordmark.png";
const markUrl = "https://spaplus.co/spaplus-mark.png";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const lineBreaks = (value: string) =>
  escapeHtml(value).replaceAll("\n", "<br>");

function shell({
  pageUrl,
  preheader,
  eyebrow,
  title,
  intro,
  body,
  buttonLabel,
  languageTag,
  footerLine,
  companyName,
}: {
  pageUrl: string;
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  body: string;
  buttonLabel: string;
  languageTag: string;
  footerLine: string;
  companyName: string;
}) {
  return `<!doctype html>
<html lang="${escapeHtml(languageTag)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f5f8;color:#192d4c;font-family:'Noto Sans',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f5f8;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:680px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 55px rgba(23,39,68,.12);">
          <tr>
            <td style="padding:24px 34px;border-bottom:1px solid #e4e8ef;">
              <a href="${pageUrl}" style="text-decoration:none;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding-right:10px;">
                      <img src="${markUrl}" width="42" height="42" alt="" style="display:block;width:42px;height:42px;border:0;border-radius:13px;">
                    </td>
                    <td>
                      <img src="${logoUrl}" width="112" alt="SpaPlus" style="display:block;width:112px;max-width:100%;height:auto;border:0;">
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:42px 34px 18px;background:linear-gradient(135deg,#fff4f8 0%,#ffffff 65%);">
              <p style="margin:0 0 12px;color:#cf0e5a;font-size:11px;line-height:1.4;font-weight:800;letter-spacing:2px;">${escapeHtml(eyebrow)}</p>
              <h1 style="margin:0;color:#192d4c;font-size:38px;line-height:1.08;letter-spacing:-1.4px;">${escapeHtml(title)}</h1>
              <p style="margin:20px 0 0;color:#5d6a7d;font-size:16px;line-height:1.7;">${escapeHtml(intro)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 34px 36px;">
              ${body}
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;">
                <tr>
                  <td style="border-radius:999px;background:#cf0e5a;">
                    <a href="${pageUrl}" style="display:inline-block;padding:15px 25px;color:#ffffff;text-decoration:none;font-size:14px;line-height:1;font-weight:800;">${escapeHtml(buttonLabel)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 34px;background:#192d4c;color:#b7c2d2;font-size:11px;line-height:1.7;">
              <strong style="color:#ffffff;">SpaPlus</strong><br>
              ${escapeHtml(footerLine)}<br>
              ${escapeHtml(companyName)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string) {
  if (!value) return "";
  return `<tr>
    <td style="width:34%;padding:11px 12px;border-bottom:1px solid #e6eaf0;color:#7a8595;font-size:12px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:11px 12px;border-bottom:1px solid #e6eaf0;color:#192d4c;font-size:13px;font-weight:700;vertical-align:top;">${lineBreaks(value)}</td>
  </tr>`;
}

export function buildMarketOwnerEmail(
  data: MarketLeadEmailData,
  context: MarketEmailContext,
) {
  const { marketName, pageUrl } = context;
  const values = { name: data.name, organization: data.organization, hours: context.reviewWindowHours, market: marketName };
  const campaign = Object.entries(data.campaign)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  const body = `
    <div style="margin:4px 0 20px;padding:16px 18px;border:1px solid #f4c8d9;border-radius:16px;background:#fff0f6;color:#192d4c;font-size:13px;line-height:1.6;">
      <strong>${escapeHtml(marketName)} founding spa lead</strong><br>
      Replying to this email goes directly to ${escapeHtml(data.name)}.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e1e6ed;border-radius:16px;border-collapse:separate;overflow:hidden;">
      ${detailRow("Spa", data.organization)}
      ${detailRow("Contact", `${data.name}, ${data.role}`)}
      ${detailRow("Email", data.email)}
      ${detailRow("Phone", data.phone)}
      ${detailRow("Preferred contact", data.preferredContact)}
      ${detailRow("Website or social", data.website)}
      ${detailRow("Location", `${data.city}, ${marketName} ${data.postalCode}`)}
      ${detailRow("Campaign area", data.area || "Ontario general")}
      ${detailRow("Page language", data.locale)}
      ${detailRow("Spa type", data.spaType)}
      ${detailRow("Locations", data.locations)}
      ${detailRow("Services", data.services.join(", "))}
      ${detailRow("Booking system", data.bookingSystem || "Not provided")}
      ${detailRow("Message", data.message || "No additional message")}
      ${detailRow("Submitted", data.submittedAt)}
      ${detailRow("Campaign", campaign || "Direct or untagged")}
      ${detailRow("Source", data.source)}
    </table>`;
  const subject = message(context, "emailOwnerSubject", `${marketName} spa lead: {{organization}} | SpaPlus`, values);
  const text = [
    `New ${marketName} founding spa lead`,
    "",
    `Spa: ${data.organization}`,
    `Contact: ${data.name}, ${data.role}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Preferred contact: ${data.preferredContact}`,
    `Website or social: ${data.website}`,
    `Location: ${data.city}, ${marketName} ${data.postalCode}`,
    `Campaign area: ${data.area || "Ontario general"}`,
    `Page language: ${data.locale}`,
    `Spa type: ${data.spaType}`,
    `Locations: ${data.locations}`,
    `Services: ${data.services.join(", ")}`,
    `Booking system: ${data.bookingSystem || "Not provided"}`,
    `Message: ${data.message || "No additional message"}`,
    `Submitted: ${data.submittedAt}`,
    `Campaign: ${campaign || "Direct or untagged"}`,
    `Source: ${data.source}`,
  ].join("\n");

  return {
    subject,
    text,
    html: shell({
      pageUrl,
      preheader: `${data.organization} joined the ${marketName} early-access list.`,
      eyebrow: message(context, "emailOwnerEyebrow", `NEW ${marketName.toUpperCase()} SPA LEAD`, values),
      title: data.organization,
      intro: message(context, "emailOwnerIntro", `A spa has joined the ${marketName} founding partner list. The full enquiry is ready for review.`, values),
      body,
      buttonLabel: message(context, "emailOwnerButton", `Open the ${marketName} page`, values),
      languageTag: "en",
      footerLine: message(context, "emailOwnerFooter", "A better way to discover, book and enjoy spa experiences.", values),
      companyName: context.copy?.emailCompanyName || "Global Spa Management Ltd.",
    }),
  };
}

export function buildMarketVisitorEmail(
  data: MarketLeadEmailData,
  context: MarketEmailContext,
) {
  const { marketName, pageUrl, reviewWindowHours, languageTag } = context;
  const values = { name: data.name, organization: data.organization, hours: reviewWindowHours, market: marketName };
  const isFrench = languageTag.toLowerCase().startsWith("fr");
  if (isFrench) {
    const preferredContact =
      data.preferredContact === "Email"
        ? "Courriel"
        : data.preferredContact === "Phone"
          ? "Téléphone"
          : data.preferredContact;
    const body = `
      <div style="margin:4px 0 22px;padding:19px;border:1px solid #f4c8d9;border-radius:16px;background:#fff0f6;">
        <strong style="display:block;margin-bottom:7px;color:#192d4c;font-size:14px;">${escapeHtml(message(context, "emailVisitorNextTitle", "La suite", values))}</strong>
        <p style="margin:0;color:#5d6a7d;font-size:13px;line-height:1.7;">${escapeHtml(message(context, "emailVisitorNextBody", `Nous examinerons votre spa, son emplacement et ses services. Un membre de l’équipe SpaPlus communiquera avec vous dans un délai de {{hours}} heures selon votre méthode de contact préférée.`, values))}</p>
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e1e6ed;border-radius:16px;border-collapse:separate;overflow:hidden;">
        ${detailRow("Spa", data.organization)}
        ${detailRow("Personne-ressource", data.name)}
        ${detailRow("Emplacement", `${data.city}, ${marketName}`)}
        ${detailRow("Contact préféré", preferredContact)}
      </table>
      <p style="margin:22px 0 0;color:#5d6a7d;font-size:12px;line-height:1.7;">Cette inscription exprime seulement votre intérêt. Elle ne crée aucun engagement, ne demande aucun paiement et ne recueille aucun renseignement de carte de crédit. Toute offre de lancement vous sera expliquée séparément avant que vous décidiez d’aller de l’avant.</p>`;
    const subject = message(context, "emailVisitorSubject", `Votre spa est sur la liste prioritaire de l’${marketName} | SpaPlus`, values);
    const text = [
      `Merci, ${data.name}.`,
      "",
      `${data.organization} est maintenant sur la liste prioritaire SpaPlus pour l’${marketName}.`,
      `Nous examinerons les renseignements et communiquerons avec vous dans un délai de ${reviewWindowHours} heures.`,
      "",
      "Cette inscription exprime seulement votre intérêt. Elle ne crée aucun engagement, ne demande aucun paiement et ne recueille aucun renseignement de carte de crédit.",
      "",
      pageUrl,
    ].join("\n");
    return {
      subject,
      text,
      html: shell({
        pageUrl,
        preheader: `Votre spa est sur la liste prioritaire SpaPlus pour l’${marketName}. Nous communiquerons avec vous dans un délai de ${reviewWindowHours} heures.`,
        eyebrow: message(context, "emailVisitorEyebrow", `ACCÈS PRIORITAIRE ${marketName.toUpperCase()}`, values),
        title: message(context, "emailVisitorTitle", `Merci, {{name}}.`, values),
        intro: message(context, "emailVisitorIntro", `${data.organization} est maintenant sur la liste prioritaire SpaPlus pour l’${marketName}.`, values),
        body,
        buttonLabel: message(context, "emailVisitorButton", `Retourner à SpaPlus ${marketName}`, values),
        languageTag: "fr-CA",
        footerLine: message(context, "emailVisitorFooter", "Une meilleure façon de découvrir, réserver et vivre des expériences spa.", values),
        companyName: context.copy?.emailCompanyName || "Global Spa Management Ltd.",
      }),
    };
  }
  const body = `
    <div style="margin:4px 0 22px;padding:19px;border:1px solid #f4c8d9;border-radius:16px;background:#fff0f6;">
      <strong style="display:block;margin-bottom:7px;color:#192d4c;font-size:14px;">${escapeHtml(message(context, "emailVisitorNextTitle", "What happens next", values))}</strong>
      <p style="margin:0;color:#5d6a7d;font-size:13px;line-height:1.7;">${escapeHtml(message(context, "emailVisitorNextBody", "We will review your spa, location and services. A member of the SpaPlus team will contact you within {{hours}} hours using your preferred contact method.", values))}</p>
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e1e6ed;border-radius:16px;border-collapse:separate;overflow:hidden;">
      ${detailRow("Spa", data.organization)}
      ${detailRow("Contact", data.name)}
      ${detailRow("Location", `${data.city}, ${marketName}`)}
      ${detailRow("Preferred contact", data.preferredContact)}
    </table>
    <p style="margin:22px 0 0;color:#5d6a7d;font-size:12px;line-height:1.7;">This registration is an expression of interest only. It creates no commitment, requires no payment and does not request credit card information. Any launch offer will be explained separately before you decide whether to continue.</p>`;
  const subject = message(context, "emailVisitorSubject", `Your spa is on the ${marketName} early list | SpaPlus`, values);
  const text = [
    `Thank you, ${data.name}.`,
    "",
    `${data.organization} is now on the SpaPlus ${marketName} early-access list.`,
    `We will review the details and contact you within ${reviewWindowHours} hours.`,
    "",
    "This registration is an expression of interest only. It creates no commitment, requires no payment and does not request credit card information.",
    "",
    pageUrl,
  ].join("\n");

  return {
    subject,
    text,
    html: shell({
      pageUrl,
      preheader: `Your spa is on the SpaPlus ${marketName} early-access list. We will contact you within ${reviewWindowHours} hours.`,
      eyebrow: message(context, "emailVisitorEyebrow", `${marketName.toUpperCase()} EARLY ACCESS`, values),
      title: message(context, "emailVisitorTitle", `Thank you, {{name}}.`, values),
      intro: message(context, "emailVisitorIntro", `${data.organization} is now on the SpaPlus ${marketName} early-access list.`, values),
      body,
      buttonLabel: message(context, "emailVisitorButton", `Return to SpaPlus ${marketName}`, values),
      languageTag: "en-CA",
      footerLine: message(context, "emailVisitorFooter", "A better way to discover, book and enjoy spa experiences.", values),
      companyName: context.copy?.emailCompanyName || "Global Spa Management Ltd.",
    }),
  };
}
