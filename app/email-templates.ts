type EmailLocale =
  | "en"
  | "he"
  | "fr-CA"
  | "ru"
  | "el"
  | "it"
  | "hu"
  | "pl"
  | "es";

export type ContactEmailData = {
  name: string;
  email: string;
  organization: string;
  topic: string;
  message: string;
  locale: EmailLocale;
  source: string;
  submittedAt: string;
};

const logoUrl =
  "https://djskabi-png.github.io/spaplus-global/spaplus-wordmark.png";
const siteUrl = "https://spaplus.co";
const contactEmail = "info@spaplus.ca";

type VisitorCopy = {
  dir: "ltr" | "rtl";
  subject: string;
  preheader: string;
  eyebrow: string;
  title: (name: string) => string;
  intro: string;
  topic: string;
  message: string;
  response: string;
  cta: string;
  footer: string;
};

const visitorCopy: Record<EmailLocale, VisitorCopy> = {
  en: {
    dir: "ltr",
    subject: "We received your message | SpaPlus Global",
    preheader: "Thank you for contacting SpaPlus. Our team will be in touch soon.",
    eyebrow: "Message received",
    title: (name) => `Thank you, ${name}.`,
    intro:
      "Your message is now with the SpaPlus team. We will review it personally and reply as soon as possible.",
    topic: "Your enquiry",
    message: "Your message",
    response: "A member of our team will reply directly to the email address you provided.",
    cta: "Explore SpaPlus Global",
    footer: "A local spa experience. A global SpaPlus vision.",
  },
  he: {
    dir: "rtl",
    subject: "קיבלנו את ההודעה שלך | SpaPlus Global",
    preheader: "תודה שפנית ל-SpaPlus. הצוות שלנו יחזור אליך בהקדם.",
    eyebrow: "ההודעה התקבלה",
    title: (name) => `תודה ${name}.`,
    intro:
      "ההודעה שלך הגיעה לצוות SpaPlus. נעבור עליה באופן אישי ונחזור אליך בהקדם האפשרי.",
    topic: "נושא הפנייה",
    message: "ההודעה שלך",
    response: "אחד מאנשי הצוות שלנו ישיב ישירות לכתובת המייל שמסרת.",
    cta: "לאתר SpaPlus Global",
    footer: "חוויית ספא מקומית. חזון SpaPlus עולמי.",
  },
  "fr-CA": {
    dir: "ltr",
    subject: "Nous avons reçu votre message | SpaPlus Global",
    preheader: "Merci d’avoir communiqué avec SpaPlus. Notre équipe vous répondra bientôt.",
    eyebrow: "Message reçu",
    title: (name) => `Merci, ${name}.`,
    intro:
      "Votre message est maintenant entre les mains de l’équipe SpaPlus. Nous le lirons avec attention et vous répondrons dès que possible.",
    topic: "Votre demande",
    message: "Votre message",
    response: "Un membre de notre équipe vous répondra directement à l’adresse courriel fournie.",
    cta: "Découvrir SpaPlus Global",
    footer: "Une expérience spa d’ici. Une vision SpaPlus mondiale.",
  },
  ru: {
    dir: "ltr",
    subject: "Мы получили ваше сообщение | SpaPlus Global",
    preheader: "Спасибо за обращение в SpaPlus. Наша команда скоро свяжется с вами.",
    eyebrow: "Сообщение получено",
    title: (name) => `Спасибо, ${name}.`,
    intro:
      "Ваше сообщение передано команде SpaPlus. Мы внимательно его рассмотрим и ответим вам в ближайшее время.",
    topic: "Тема обращения",
    message: "Ваше сообщение",
    response: "Представитель нашей команды ответит на указанный вами адрес электронной почты.",
    cta: "Открыть SpaPlus Global",
    footer: "Локальный опыт в мире спа. Глобальное видение SpaPlus.",
  },
  el: {
    dir: "ltr",
    subject: "Λάβαμε το μήνυμά σας | SpaPlus Global",
    preheader: "Σας ευχαριστούμε που επικοινωνήσατε με τη SpaPlus. Θα σας απαντήσουμε σύντομα.",
    eyebrow: "Το μήνυμα ελήφθη",
    title: (name) => `Ευχαριστούμε, ${name}.`,
    intro:
      "Το μήνυμά σας βρίσκεται πλέον στην ομάδα της SpaPlus. Θα το εξετάσουμε προσωπικά και θα επικοινωνήσουμε μαζί σας το συντομότερο δυνατό.",
    topic: "Το αίτημά σας",
    message: "Το μήνυμά σας",
    response: "Ένα μέλος της ομάδας μας θα απαντήσει απευθείας στη διεύθυνση email που δηλώσατε.",
    cta: "Ανακαλύψτε τη SpaPlus Global",
    footer: "Μια τοπική εμπειρία spa. Ένα παγκόσμιο όραμα SpaPlus.",
  },
  it: {
    dir: "ltr",
    subject: "Abbiamo ricevuto il tuo messaggio | SpaPlus Global",
    preheader: "Grazie per aver contattato SpaPlus. Il nostro team ti risponderà presto.",
    eyebrow: "Messaggio ricevuto",
    title: (name) => `Grazie, ${name}.`,
    intro:
      "Il tuo messaggio è ora nelle mani del team SpaPlus. Lo leggeremo con attenzione e ti risponderemo al più presto.",
    topic: "La tua richiesta",
    message: "Il tuo messaggio",
    response: "Un membro del nostro team risponderà direttamente all’indirizzo email che hai indicato.",
    cta: "Scopri SpaPlus Global",
    footer: "Un’esperienza spa locale. Una visione SpaPlus globale.",
  },
  hu: {
    dir: "ltr",
    subject: "Megkaptuk az üzeneted | SpaPlus Global",
    preheader: "Köszönjük, hogy felkerested a SpaPlust. Csapatunk hamarosan jelentkezik.",
    eyebrow: "Üzenet megérkezett",
    title: (name) => `Köszönjük, ${name}.`,
    intro:
      "Üzeneted megérkezett a SpaPlus csapatához. Személyesen átnézzük, és a lehető leghamarabb válaszolunk.",
    topic: "A megkeresésed",
    message: "Az üzeneted",
    response: "Csapatunk egyik tagja közvetlenül az általad megadott e-mail-címre válaszol.",
    cta: "Fedezd fel a SpaPlus Globalt",
    footer: "Helyi spaélmény. Globális SpaPlus-vízió.",
  },
  pl: {
    dir: "ltr",
    subject: "Otrzymaliśmy Twoją wiadomość | SpaPlus Global",
    preheader: "Dziękujemy za kontakt ze SpaPlus. Nasz zespół wkrótce odpowie.",
    eyebrow: "Wiadomość otrzymana",
    title: (name) => `Dziękujemy, ${name}.`,
    intro:
      "Twoja wiadomość trafiła do zespołu SpaPlus. Przeczytamy ją uważnie i odpowiemy tak szybko, jak to możliwe.",
    topic: "Twoje zapytanie",
    message: "Twoja wiadomość",
    response: "Członek naszego zespołu odpowie bezpośrednio na podany przez Ciebie adres e-mail.",
    cta: "Poznaj SpaPlus Global",
    footer: "Lokalne doświadczenie spa. Globalna wizja SpaPlus.",
  },
  es: {
    dir: "ltr",
    subject: "Hemos recibido tu mensaje | SpaPlus Global",
    preheader: "Gracias por contactar con SpaPlus. Nuestro equipo te responderá pronto.",
    eyebrow: "Mensaje recibido",
    title: (name) => `Gracias, ${name}.`,
    intro:
      "Tu mensaje ya está en manos del equipo SpaPlus. Lo revisaremos personalmente y te responderemos lo antes posible.",
    topic: "Tu consulta",
    message: "Tu mensaje",
    response: "Una persona de nuestro equipo responderá directamente a la dirección de correo que indicaste.",
    cta: "Descubre SpaPlus Global",
    footer: "Una experiencia de spa local. Una visión SpaPlus global.",
  },
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const nl2br = (value: string) => escapeHtml(value).replaceAll("\n", "<br>");

const frame = ({
  lang,
  dir,
  preheader,
  eyebrow,
  title,
  intro,
  content,
  ctaLabel,
  footer,
}: {
  lang: EmailLocale;
  dir: "ltr" | "rtl";
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  content: string;
  ctaLabel: string;
  footer: string;
}) => `<!doctype html>
<html lang="${lang}" dir="${dir}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <title>${escapeHtml(title)}</title>
    <style>
      table { border-collapse: separate; }
      a { color: inherit; }
      body, table, td, a, p, h1 {
        font-family: ${lang === "he" ? "'Segoe UI', Tahoma, Arial, sans-serif" : "Arial, 'Helvetica Neue', sans-serif"} !important;
      }
      @media only screen and (max-width: 620px) {
        .page-pad { padding: 16px 8px !important; }
        .card { border-radius: 18px !important; }
        .header-pad { padding: 26px 22px 14px !important; }
        .hero-pad { padding: 8px 22px 28px !important; }
        .content-pad { padding: 0 22px 28px !important; }
        .cta-pad { padding: 0 22px 30px !important; }
        .footer-pad { padding: 24px 22px !important; }
        .title { font-size: 30px !important; line-height: 1.2 !important; }
        .intro { font-size: 16px !important; }
        .panel-pad { padding: 20px !important; }
        .button { display: block !important; text-align: center !important; }
      }
    </style>
  </head>
  <body dir="${dir}" style="margin:0;padding:0;background-color:#f4f1f3;color:#172744;direction:${dir};font-family:${lang === "he" ? "'Segoe UI',Tahoma,Arial,sans-serif" : "Arial,'Helvetica Neue',sans-serif"};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
      ${escapeHtml(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
    </div>
    <table dir="${dir}" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f4f1f3;direction:${dir};font-family:${lang === "he" ? "'Segoe UI',Tahoma,Arial,sans-serif" : "Arial,'Helvetica Neue',sans-serif"};">
      <tr>
        <td class="page-pad" dir="${dir}" align="center" style="padding:36px 14px;direction:${dir};">
          <!--[if mso]><table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->
          <table class="card" dir="${dir}" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;background-color:#ffffff;border:1px solid #ebe5e8;border-radius:24px;overflow:hidden;direction:${dir};">
            <tr>
              <td style="height:7px;background-color:#e9176a;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td class="header-pad" dir="${dir}" style="padding:32px 38px 18px;direction:${dir};text-align:${dir === "rtl" ? "right" : "left"};">
                <a href="${siteUrl}" style="text-decoration:none;">
                  <img src="${logoUrl}" width="136" alt="SpaPlus" style="display:block;width:136px;max-width:100%;height:auto;border:0;margin:${dir === "rtl" ? "0 0 0 auto" : "0 auto 0 0"};">
                </a>
              </td>
            </tr>
            <tr>
              <td class="hero-pad" dir="${dir}" style="padding:8px 38px 34px;direction:${dir};text-align:${dir === "rtl" ? "right" : "left"};">
                <p style="margin:0 0 18px;color:#bd0f55;font-size:12px;line-height:1.4;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">${escapeHtml(eyebrow)}</p>
                <h1 class="title" style="margin:0 0 14px;color:#172744;font-size:36px;line-height:1.17;font-weight:800;letter-spacing:-.02em;">${escapeHtml(title)}</h1>
                <p class="intro" style="margin:0;color:#536179;font-size:17px;line-height:1.7;">${escapeHtml(intro)}</p>
              </td>
            </tr>
            <tr>
              <td class="content-pad" dir="${dir}" style="padding:0 38px 34px;direction:${dir};">
                ${content}
              </td>
            </tr>
            <tr>
              <td class="cta-pad" dir="${dir}" align="center" style="padding:0 38px 38px;direction:${dir};">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center" bgcolor="#e9176a" style="border-radius:12px;">
                      <a class="button" href="${siteUrl}" style="display:inline-block;padding:15px 26px;border:1px solid #e9176a;border-radius:12px;background-color:#e9176a;color:#ffffff;text-decoration:none;font-size:15px;line-height:1.2;font-weight:700;">${escapeHtml(ctaLabel)}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="footer-pad" dir="${dir}" style="padding:26px 38px;background-color:#172744;color:#cbd3df;direction:${dir};text-align:center;font-size:12px;line-height:1.7;">
                <p style="margin:0 0 6px;">${escapeHtml(footer)}</p>
                <a href="mailto:${contactEmail}" style="color:#ffffff;text-decoration:none;">${contactEmail}</a>
                <span style="color:#7f8ba0;"> &nbsp;|&nbsp; </span>
                <a href="${siteUrl}" style="color:#ffffff;text-decoration:none;">spaplus.co</a>
              </td>
            </tr>
          </table>
          <!--[if mso]></td></tr></table><![endif]-->
        </td>
      </tr>
    </table>
  </body>
</html>`;

export function buildVisitorEmail(data: ContactEmailData) {
  const copy = visitorCopy[data.locale] || visitorCopy.en;
  const organization = data.organization
    ? `<p style="margin:9px 0 0;color:#6f7a8e;font-size:13px;line-height:1.5;">${escapeHtml(data.organization)}</p>`
    : "";
  const content = `
    <table dir="${copy.dir}" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#faf8f9;border:1px solid #e9e3e6;border-radius:16px;direction:${copy.dir};">
      <tr>
        <td class="panel-pad" style="padding:22px 24px;text-align:${copy.dir === "rtl" ? "right" : "left"};">
          <p style="margin:0;color:#9b456a;font-size:12px;line-height:1.4;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">${escapeHtml(copy.topic)}</p>
          <p style="margin:7px 0 0;color:#172744;font-size:17px;line-height:1.45;font-weight:700;">${escapeHtml(data.topic)}</p>
          ${organization}
        </td>
      </tr>
      <tr>
        <td style="padding:0 24px;"><div style="height:1px;background-color:#e5dfe3;font-size:0;line-height:0;">&nbsp;</div></td>
      </tr>
      <tr>
        <td class="panel-pad" style="padding:22px 24px;text-align:${copy.dir === "rtl" ? "right" : "left"};">
          <p style="margin:0;color:#9b456a;font-size:12px;line-height:1.4;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">${escapeHtml(copy.message)}</p>
          <p dir="auto" style="margin:9px 0 0;color:#35445d;font-size:15px;line-height:1.75;">${nl2br(data.message)}</p>
        </td>
      </tr>
    </table>
    <p style="margin:20px 4px 0;color:#536179;font-size:14px;line-height:1.7;text-align:${copy.dir === "rtl" ? "right" : "left"};">${escapeHtml(copy.response)}</p>`;

  return {
    subject: copy.subject,
    text: [
      copy.title(data.name),
      copy.intro,
      "",
      `${copy.topic}: ${data.topic}`,
      data.organization ? data.organization : "",
      "",
      `${copy.message}:`,
      data.message,
      "",
      copy.response,
      "",
      `${contactEmail} | ${siteUrl}`,
    ]
      .filter(Boolean)
      .join("\n"),
    html: frame({
      lang: data.locale,
      dir: copy.dir,
      preheader: copy.preheader,
      eyebrow: copy.eyebrow,
      title: copy.title(data.name),
      intro: copy.intro,
      content,
      ctaLabel: copy.cta,
      footer: copy.footer,
    }),
  };
}

export function buildOwnerEmail(data: ContactEmailData) {
  const rows = [
    ["שם מלא", data.name],
    ["אימייל", data.email],
    ["חברה או ארגון", data.organization || "לא צוין"],
    ["נושא הפנייה", data.topic],
    ["שפת האתר", data.locale],
    ["מועד השליחה", data.submittedAt],
  ]
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:11px 0;color:#8a4965;font-size:12px;line-height:1.5;font-weight:700;vertical-align:top;width:34%;border-bottom:1px solid #e7e1e4;">${escapeHtml(label)}</td>
          <td dir="auto" style="padding:11px 14px 11px 0;color:#172744;font-size:14px;line-height:1.5;font-weight:700;vertical-align:top;border-bottom:1px solid #e7e1e4;word-break:break-word;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  const replyHref = `mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent(`תשובה לפנייה בנושא ${data.topic}`)}`;
  const content = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#faf8f9;border:1px solid #e9e3e6;border-radius:16px;">
      <tr>
        <td class="panel-pad" style="padding:14px 24px 10px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;">${rows}</table>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin-top:18px;background-color:#172744;border-radius:16px;">
      <tr>
        <td class="panel-pad" style="padding:22px 24px;text-align:right;">
          <p style="margin:0;color:#ff9fc3;font-size:12px;line-height:1.4;font-weight:700;letter-spacing:.04em;">תוכן ההודעה</p>
          <p dir="auto" style="margin:10px 0 0;color:#ffffff;font-size:16px;line-height:1.8;word-break:break-word;">${nl2br(data.message)}</p>
        </td>
      </tr>
    </table>
    <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0" style="margin:20px auto 0;">
      <tr>
        <td align="center" style="border:1px solid #e9176a;border-radius:12px;">
          <a href="${replyHref}" style="display:inline-block;padding:13px 22px;border-radius:12px;color:#d7135f;text-decoration:none;font-size:14px;line-height:1.2;font-weight:700;">מענה ישיר לפונה</a>
        </td>
      </tr>
    </table>`;

  return {
    subject: `פנייה חדשה מ-SpaPlus Global | ${data.topic} | ${data.name}`,
    text: [
      `פנייה חדשה מאת ${data.name}`,
      "",
      `שם מלא: ${data.name}`,
      `אימייל: ${data.email}`,
      `חברה או ארגון: ${data.organization || "לא צוין"}`,
      `נושא הפנייה: ${data.topic}`,
      `שפת האתר: ${data.locale}`,
      `מועד השליחה: ${data.submittedAt}`,
      "",
      "תוכן ההודעה:",
      data.message,
      "",
      `מקור: ${data.source}`,
    ].join("\n"),
    html: frame({
      lang: "he",
      dir: "rtl",
      preheader: `פנייה חדשה מאת ${data.name} בנושא ${data.topic}`,
      eyebrow: "פנייה חדשה מהאתר",
      title: `${data.name} רוצה לדבר איתנו.`,
      intro:
        "כל פרטי הפנייה מרוכזים כאן. אפשר להשיב ישירות לכתובת שהפונה מסר.",
      content,
      ctaLabel: "פתיחת אתר SpaPlus Global",
      footer: "הודעה זו נשלחה ישירות מטופס יצירת הקשר באתר SpaPlus Global.",
    }),
  };
}
