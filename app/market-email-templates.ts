export type MarketLeadEmailData = {
  name: string;
  role: string;
  email: string;
  phone: string;
  organization: string;
  website: string;
  city: string;
  region: string;
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
  activeMarket?: boolean;
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
  buttonHref,
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
  buttonHref?: string;
  languageTag: string;
  footerLine: string;
  companyName: string;
}) {
  const isRtl = /^(ar|he)(-|$)/i.test(languageTag);
  const direction = isRtl ? "rtl" : "ltr";
  const alignment = isRtl ? "right" : "left";
  return `<!doctype html>
<html lang="${escapeHtml(languageTag)}" dir="${direction}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
</head>
<body dir="${direction}" style="margin:0;padding:0;background:#f3f5f8;color:#192d4c;font-family:Heebo,Arial,sans-serif;direction:${direction};text-align:${alignment};">
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
              <p dir="${direction}" style="margin:0 0 12px;color:#cf0e5a;font-size:11px;line-height:1.4;font-weight:800;letter-spacing:2px;text-align:${alignment};">${escapeHtml(eyebrow)}</p>
              <h1 dir="${direction}" style="margin:0;color:#192d4c;font-size:38px;line-height:1.08;letter-spacing:-1.4px;text-align:${alignment};">${escapeHtml(title)}</h1>
              <p dir="${direction}" style="margin:20px 0 0;color:#5d6a7d;font-size:16px;line-height:1.7;text-align:${alignment};">${escapeHtml(intro)}</p>
            </td>
          </tr>
          <tr>
            <td dir="${direction}" style="padding:14px 34px 36px;direction:${direction};text-align:${alignment};">
              ${body}
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;">
                <tr>
                  <td style="border-radius:999px;background:#cf0e5a;">
                    <a href="${escapeHtml(buttonHref || pageUrl)}" style="display:inline-block;padding:15px 25px;color:#ffffff;text-decoration:none;font-size:14px;line-height:1;font-weight:800;">${escapeHtml(buttonLabel)}</a>
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

function replyLink(
  recipient: string,
  subject: string,
  body: string,
) {
  return `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildMarketOwnerEmail(
  data: MarketLeadEmailData,
  context: MarketEmailContext,
) {
  const { marketName, pageUrl } = context;
  const isHebrew = context.languageTag.toLowerCase().startsWith("he");
  const leadLabel = isHebrew
    ? "ליד חדש מבית ספא בישראל"
    : context.activeMarket
      ? `${marketName} spa partner lead`
      : `${marketName} founding spa lead`;
  const values = { name: data.name, organization: data.organization, hours: context.reviewWindowHours, market: marketName };
  const campaign = Object.entries(data.campaign)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  const replySubject = message(
    context,
    "emailOwnerReplySubject",
    isHebrew ? "SpaPlus ישראל | קיבלנו את פנייתכם" : "SpaPlus Ontario | Your registration",
    values,
  );
  const replyBody = message(
    context,
    "emailOwnerReplyBody",
    isHebrew
      ? "שלום {{name}},\n\nתודה ששלחתם את פרטי {{organization}} ל־SpaPlus ישראל. קיבלנו את הפנייה וניצור איתכם קשר בהקדם.\n\nבברכה,\nצוות SpaPlus ישראל"
      : "Hello {{name}},\n\nThank you for registering {{organization}} for SpaPlus Ontario. We have received your details and will be in touch shortly.\n\nBest regards,\nSpaPlus Ontario",
    values,
  );
  const body = `
    <div style="margin:4px 0 20px;padding:16px 18px;border:1px solid #f4c8d9;border-radius:16px;background:#fff0f6;color:#192d4c;font-size:13px;line-height:1.6;">
      <strong>${escapeHtml(leadLabel)}</strong><br>
      ${isHebrew
        ? `תגובה למייל הזה תגיע ישירות אל ${escapeHtml(data.name)}. הכפתור למטה פותח תשובה מוכנה לאיש הקשר של בית הספא.`
        : `Replying to this email goes directly to ${escapeHtml(data.name)}. The reply button below opens a prepared email to the spa contact.`}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e1e6ed;border-radius:16px;border-collapse:separate;overflow:hidden;">
      ${detailRow(isHebrew ? "בית הספא" : "Spa", data.organization)}
      ${detailRow(isHebrew ? "איש קשר" : "Contact", `${data.name}, ${data.role}`)}
      ${detailRow(isHebrew ? "דוא״ל" : "Email", data.email)}
      ${detailRow(isHebrew ? "טלפון" : "Phone", data.phone)}
      ${detailRow(isHebrew ? "דרך התקשרות מועדפת" : "Preferred contact", data.preferredContact)}
      ${detailRow(isHebrew ? "אתר או רשת חברתית" : "Website or social", data.website)}
      ${detailRow(isHebrew ? "מיקום" : "Location", `${data.city}${data.region ? `, ${data.region}` : ""}, ${marketName} ${data.postalCode}`)}
      ${detailRow(isHebrew ? "אזור הקמפיין" : "Campaign area", data.area || (isHebrew ? "ישראל" : `${marketName} general`))}
      ${detailRow(isHebrew ? "שפת העמוד" : "Page language", data.locale)}
      ${detailRow(isHebrew ? "סוג בית הספא" : "Spa type", data.spaType)}
      ${detailRow(isHebrew ? "מספר סניפים" : "Locations", data.locations)}
      ${detailRow(isHebrew ? "שירותים" : "Services", data.services.join(", "))}
      ${detailRow(isHebrew ? "מערכת הזמנות" : "Booking system", data.bookingSystem || (isHebrew ? "לא נמסר" : "Not provided"))}
      ${detailRow(isHebrew ? "הודעה" : "Message", data.message || (isHebrew ? "לא נוספה הודעה" : "No additional message"))}
      ${detailRow(isHebrew ? "מועד השליחה" : "Submitted", data.submittedAt)}
      ${detailRow(isHebrew ? "קמפיין" : "Campaign", campaign || (isHebrew ? "הגעה ישירה" : "Direct or untagged"))}
      ${detailRow(isHebrew ? "מקור" : "Source", data.source)}
    </table>`;
  const subject = message(
    context,
    "emailOwnerSubject",
    isHebrew ? "ליד חדש ל־SpaPlus ישראל: {{organization}}" : `${marketName} spa lead: {{organization}} | SpaPlus`,
    values,
  );
  const text = (isHebrew
    ? [
        leadLabel,
        "",
        `בית הספא: ${data.organization}`,
        `איש קשר: ${data.name}, ${data.role}`,
        `דוא״ל: ${data.email}`,
        `טלפון: ${data.phone}`,
        `דרך התקשרות מועדפת: ${data.preferredContact}`,
        `אתר או רשת חברתית: ${data.website}`,
        `מיקום: ${data.city}${data.region ? `, ${data.region}` : ""}, ישראל ${data.postalCode}`,
        `סוג בית הספא: ${data.spaType}`,
        `מספר סניפים: ${data.locations}`,
        `שירותים: ${data.services.join(", ")}`,
        `מערכת הזמנות: ${data.bookingSystem || "לא נמסר"}`,
        `הודעה: ${data.message || "לא נוספה הודעה"}`,
        `מועד השליחה: ${data.submittedAt}`,
        `קמפיין: ${campaign || "הגעה ישירה"}`,
        `מקור: ${data.source}`,
      ]
    : [
        `New ${leadLabel}`,
        "",
        `Spa: ${data.organization}`,
        `Contact: ${data.name}, ${data.role}`,
        `Email: ${data.email}`,
        `Phone: ${data.phone}`,
        `Preferred contact: ${data.preferredContact}`,
        `Website or social: ${data.website}`,
        `Location: ${data.city}${data.region ? `, ${data.region}` : ""}, ${marketName} ${data.postalCode}`,
        `Campaign area: ${data.area || `${marketName} general`}`,
        `Page language: ${data.locale}`,
        `Spa type: ${data.spaType}`,
        `Locations: ${data.locations}`,
        `Services: ${data.services.join(", ")}`,
        `Booking system: ${data.bookingSystem || "Not provided"}`,
        `Message: ${data.message || "No additional message"}`,
        `Submitted: ${data.submittedAt}`,
        `Campaign: ${campaign || "Direct or untagged"}`,
        `Source: ${data.source}`,
      ]).join("\n");

  return {
    subject,
    text,
    html: shell({
      pageUrl,
      preheader: isHebrew
        ? `התקבלה פנייה חדשה מבית הספא ${data.organization}.`
        : context.activeMarket
          ? `${data.organization} submitted a SpaPlus ${marketName} partner enquiry.`
          : `${data.organization} joined the ${marketName} early-access list.`,
      eyebrow: message(context, "emailOwnerEyebrow", isHebrew ? "ליד חדש מ־SpaPlus ישראל" : `NEW ${marketName.toUpperCase()} SPA LEAD`, values),
      title: data.organization,
      intro: message(
        context,
        "emailOwnerIntro",
        isHebrew
          ? "בית ספא ביקש להצטרף לפעילות SpaPlus בישראל. כל פרטי הפנייה מופיעים כאן ומוכנים להמשך טיפול."
          : context.activeMarket
            ? `A spa has asked to explore joining the active SpaPlus ${marketName} network. The full enquiry is ready for review.`
            : `A spa has joined the ${marketName} founding partner list. The full enquiry is ready for review.`,
        values,
      ),
      body,
      buttonLabel: message(context, "emailOwnerReplyButton", isHebrew ? "השבת פנייה לבית הספא" : "Reply to spa", values),
      buttonHref: replyLink(data.email, replySubject, replyBody),
      languageTag: isHebrew ? "he-IL" : "en",
      footerLine: message(context, "emailOwnerFooter", isHebrew ? "דרך טובה יותר לגלות, להזמין וליהנות מחוויות ספא." : "A better way to discover, book and enjoy spa experiences.", values),
      companyName: context.copy?.emailCompanyName || "GLOBAL SPA MANAGEMENT LTD",
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
  const isHebrew = languageTag.toLowerCase().startsWith("he");
  if (isHebrew) {
    const preferredContact = data.preferredContact === "Email"
      ? "דוא״ל"
      : data.preferredContact === "Phone"
        ? "טלפון"
        : data.preferredContact;
    const body = `
      <div style="margin:4px 0 22px;padding:19px;border:1px solid #f4c8d9;border-radius:16px;background:#fff0f6;">
        <strong style="display:block;margin-bottom:7px;color:#192d4c;font-size:14px;">מה קורה עכשיו</strong>
        <p style="margin:0;color:#5d6a7d;font-size:13px;line-height:1.7;">נבדוק את בית הספא, המיקום והשירותים. חבר או חברת צוות SpaPlus ייצרו איתך קשר בתוך ${escapeHtml(String(reviewWindowHours))} שעות בדרך ההתקשרות שבחרת.</p>
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e1e6ed;border-radius:16px;border-collapse:separate;overflow:hidden;">
        ${detailRow("בית הספא", data.organization)}
        ${detailRow("איש קשר", data.name)}
        ${detailRow("מיקום", `${data.city}${data.region ? `, ${data.region}` : ""}, ישראל`)}
        ${detailRow("דרך התקשרות מועדפת", preferredContact)}
      </table>
      <p style="margin:22px 0 0;color:#5d6a7d;font-size:12px;line-height:1.7;">הפנייה מביעה עניין בלבד. היא אינה יוצרת התחייבות, אינה דורשת תשלום ואינה מבקשת פרטי אשראי. כל הצעה מסחרית, אם תהיה, תוצג בנפרד לפני כל החלטה.</p>`;
    const subject = `קיבלנו את הפנייה שלך ל־SpaPlus ישראל`;
    const text = [
      `תודה, ${data.name}.`,
      "",
      `קיבלנו את פרטי ${data.organization} עבור SpaPlus ישראל.`,
      `נבדוק את הפרטים וניצור איתך קשר בתוך ${reviewWindowHours} שעות.`,
      "",
      "הפנייה מביעה עניין בלבד ואינה יוצרת התחייבות או דורשת תשלום.",
      "",
      pageUrl,
    ].join("\n");
    return {
      subject,
      text,
      html: shell({
        pageUrl,
        preheader: `קיבלנו את הפנייה שלך ל־SpaPlus ישראל וניצור איתך קשר בתוך ${reviewWindowHours} שעות.`,
        eyebrow: "SpaPlus ישראל",
        title: `תודה, ${data.name}.`,
        intro: `קיבלנו את הפרטים של ${data.organization} ונבדוק את ההתאמה לפעילות SpaPlus בישראל.`,
        body,
        buttonLabel: "חזרה ל־SpaPlus ישראל",
        languageTag: "he-IL",
        footerLine: "דרך טובה יותר לגלות, להזמין וליהנות מחוויות ספא.",
        companyName: context.copy?.emailCompanyName || "GLOBAL SPA MANAGEMENT LTD",
      }),
    };
  }
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
        ${detailRow("Emplacement", `${data.city}${data.region ? `, ${data.region}` : ""}, ${marketName}`)}
        ${detailRow("Contact préféré", preferredContact)}
      </table>
      <p style="margin:22px 0 0;color:#5d6a7d;font-size:12px;line-height:1.7;">Cette inscription exprime seulement votre intérêt. Elle ne crée aucun engagement, ne demande aucun paiement et ne recueille aucun renseignement de carte de crédit. Toute offre de lancement vous sera expliquée séparément avant que vous décidiez d’aller de l’avant.</p>`;
    const subject = message(
      context,
      "emailVisitorSubject",
      context.activeMarket
        ? `Nous avons reçu votre demande SpaPlus ${marketName}`
        : `Votre spa est sur la liste prioritaire de l’${marketName} | SpaPlus`,
      values,
    );
    const text = [
      `Merci, ${data.name}.`,
      "",
      context.activeMarket
        ? `Nous avons reçu la demande de partenariat de ${data.organization} pour SpaPlus ${marketName}.`
        : `${data.organization} est maintenant sur la liste prioritaire SpaPlus pour l’${marketName}.`,
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
        preheader: context.activeMarket
          ? `Nous avons reçu votre demande SpaPlus ${marketName}. Nous communiquerons avec vous dans un délai de ${reviewWindowHours} heures.`
          : `Votre spa est sur la liste prioritaire SpaPlus pour l’${marketName}. Nous communiquerons avec vous dans un délai de ${reviewWindowHours} heures.`,
        eyebrow: message(context, "emailVisitorEyebrow", `ACCÈS PRIORITAIRE ${marketName.toUpperCase()}`, values),
        title: message(context, "emailVisitorTitle", `Merci, {{name}}.`, values),
        intro: message(
          context,
          "emailVisitorIntro",
          context.activeMarket
            ? `Nous avons reçu les renseignements de ${data.organization} pour SpaPlus ${marketName}.`
            : `${data.organization} est maintenant sur la liste prioritaire SpaPlus pour l’${marketName}.`,
          values,
        ),
        body,
        buttonLabel: message(context, "emailVisitorButton", `Retourner à SpaPlus ${marketName}`, values),
        languageTag: "fr-CA",
        footerLine: message(context, "emailVisitorFooter", "Une meilleure façon de découvrir, réserver et vivre des expériences spa.", values),
        companyName: context.copy?.emailCompanyName || "GLOBAL SPA MANAGEMENT LTD",
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
      ${detailRow("Location", `${data.city}${data.region ? `, ${data.region}` : ""}, ${marketName}`)}
      ${detailRow("Preferred contact", data.preferredContact)}
    </table>
    <p style="margin:22px 0 0;color:#5d6a7d;font-size:12px;line-height:1.7;">This registration is an expression of interest only. It creates no commitment, requires no payment and does not request credit card information. Any launch offer will be explained separately before you decide whether to continue.</p>`;
  const subject = message(
    context,
    "emailVisitorSubject",
    context.activeMarket
      ? `We received your SpaPlus ${marketName} enquiry`
      : `Your spa is on the ${marketName} early list | SpaPlus`,
    values,
  );
  const text = [
    `Thank you, ${data.name}.`,
    "",
    context.activeMarket
      ? `We received the partner enquiry for ${data.organization} for SpaPlus ${marketName}.`
      : `${data.organization} is now on the SpaPlus ${marketName} early-access list.`,
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
      preheader: context.activeMarket
        ? `We received your SpaPlus ${marketName} enquiry. We will contact you within ${reviewWindowHours} hours.`
        : `Your spa is on the SpaPlus ${marketName} early-access list. We will contact you within ${reviewWindowHours} hours.`,
      eyebrow: message(context, "emailVisitorEyebrow", `${marketName.toUpperCase()} EARLY ACCESS`, values),
      title: message(context, "emailVisitorTitle", `Thank you, {{name}}.`, values),
      intro: message(
        context,
        "emailVisitorIntro",
        context.activeMarket
          ? `We received the information for ${data.organization} and will review its fit for SpaPlus ${marketName}.`
          : `${data.organization} is now on the SpaPlus ${marketName} early-access list.`,
        values,
      ),
      body,
      buttonLabel: message(context, "emailVisitorButton", `Return to SpaPlus ${marketName}`, values),
      languageTag: "en-CA",
      footerLine: message(context, "emailVisitorFooter", "A better way to discover, book and enjoy spa experiences.", values),
      companyName: context.copy?.emailCompanyName || "GLOBAL SPA MANAGEMENT LTD",
    }),
  };
}
