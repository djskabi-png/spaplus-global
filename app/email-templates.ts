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

const visitorCopy: Record<
  EmailLocale,
  {
    dir: "ltr" | "rtl";
    subject: string;
    eyebrow: string;
    title: (name: string) => string;
    intro: string;
    topic: string;
    message: string;
    response: string;
    cta: string;
    footer: string;
  }
> = {
  en: {
    dir: "ltr",
    subject: "We received your message | SpaPlus Global",
    eyebrow: "Your message is with us",
    title: (name) => `Thank you, ${name}.`,
    intro:
      "Your message reached the SpaPlus team. We will review it personally and get back to you as soon as possible.",
    topic: "What you contacted us about",
    message: "Your message",
    response: "A member of our team will reply directly to this email address.",
    cta: "Visit SpaPlus Global",
    footer: "SpaPlus Global. Building better days through spa, wellness and technology.",
  },
  he: {
    dir: "rtl",
    subject: "קיבלנו את ההודעה שלך | SpaPlus Global",
    eyebrow: "ההודעה שלך הגיעה אלינו",
    title: (name) => `תודה ${name}.`,
    intro:
      "הפנייה שלך התקבלה בצוות SpaPlus. נעבור עליה באופן אישי ונחזור אליך בהקדם.",
    topic: "הנושא שבחרת",
    message: "ההודעה שלך",
    response: "אחד מאנשי הצוות שלנו יחזור אליך ישירות לכתובת המייל הזאת.",
    cta: "לאתר SpaPlus Global",
    footer: "SpaPlus Global. מפתחים ימים טובים יותר דרך ספא, וולנס וטכנולוגיה.",
  },
  "fr-CA": {
    dir: "ltr",
    subject: "Nous avons reçu votre message | SpaPlus Global",
    eyebrow: "Votre message est entre bonnes mains",
    title: (name) => `Merci, ${name}.`,
    intro:
      "Votre message a bien été reçu par l’équipe SpaPlus. Nous le lirons personnellement et vous répondrons dès que possible.",
    topic: "Le sujet de votre demande",
    message: "Votre message",
    response: "Un membre de notre équipe vous répondra directement à cette adresse.",
    cta: "Visiter SpaPlus Global",
    footer:
      "SpaPlus Global. Créer de meilleures journées grâce au spa, au mieux-être et à la technologie.",
  },
  ru: {
    dir: "ltr",
    subject: "Мы получили ваше сообщение | SpaPlus Global",
    eyebrow: "Ваше сообщение уже у нас",
    title: (name) => `Спасибо, ${name}.`,
    intro:
      "Команда SpaPlus получила ваше обращение. Мы внимательно его изучим и ответим вам в ближайшее время.",
    topic: "Тема обращения",
    message: "Ваше сообщение",
    response: "Один из наших специалистов ответит прямо на этот адрес.",
    cta: "Перейти на SpaPlus Global",
    footer:
      "SpaPlus Global. Мы делаем дни лучше с помощью спа, велнеса и технологий.",
  },
  el: {
    dir: "ltr",
    subject: "Λάβαμε το μήνυμά σας | SpaPlus Global",
    eyebrow: "Το μήνυμά σας είναι στα χέρια μας",
    title: (name) => `Ευχαριστούμε, ${name}.`,
    intro:
      "Η ομάδα της SpaPlus έλαβε το μήνυμά σας. Θα το εξετάσουμε προσωπικά και θα επικοινωνήσουμε μαζί σας το συντομότερο δυνατό.",
    topic: "Θέμα επικοινωνίας",
    message: "Το μήνυμά σας",
    response: "Ένα μέλος της ομάδας μας θα απαντήσει απευθείας σε αυτή τη διεύθυνση.",
    cta: "Επισκεφθείτε τη SpaPlus Global",
    footer:
      "SpaPlus Global. Δημιουργούμε καλύτερες ημέρες μέσα από το spa, την ευεξία και την τεχνολογία.",
  },
  it: {
    dir: "ltr",
    subject: "Abbiamo ricevuto il tuo messaggio | SpaPlus Global",
    eyebrow: "Il tuo messaggio è arrivato",
    title: (name) => `Grazie, ${name}.`,
    intro:
      "Il team SpaPlus ha ricevuto la tua richiesta. La leggeremo personalmente e ti risponderemo al più presto.",
    topic: "Argomento della richiesta",
    message: "Il tuo messaggio",
    response: "Un membro del nostro team risponderà direttamente a questo indirizzo.",
    cta: "Visita SpaPlus Global",
    footer:
      "SpaPlus Global. Creiamo giornate migliori attraverso spa, benessere e tecnologia.",
  },
  hu: {
    dir: "ltr",
    subject: "Megkaptuk az üzeneted | SpaPlus Global",
    eyebrow: "Az üzeneted megérkezett hozzánk",
    title: (name) => `Köszönjük, ${name}.`,
    intro:
      "A SpaPlus csapata megkapta a megkeresésedet. Személyesen átnézzük, és hamarosan válaszolunk.",
    topic: "A megkeresés témája",
    message: "Az üzeneted",
    response: "Csapatunk egyik tagja közvetlenül erre az e-mail-címre válaszol.",
    cta: "SpaPlus Global megtekintése",
    footer:
      "SpaPlus Global. Jobb napokat teremtünk spa, wellness és technológia segítségével.",
  },
  pl: {
    dir: "ltr",
    subject: "Otrzymaliśmy Twoją wiadomość | SpaPlus Global",
    eyebrow: "Twoja wiadomość jest już u nas",
    title: (name) => `Dziękujemy, ${name}.`,
    intro:
      "Zespół SpaPlus otrzymał Twoją wiadomość. Zapoznamy się z nią osobiście i odpowiemy tak szybko, jak to możliwe.",
    topic: "Temat kontaktu",
    message: "Twoja wiadomość",
    response: "Ktoś z naszego zespołu odpowie bezpośrednio na ten adres.",
    cta: "Odwiedź SpaPlus Global",
    footer:
      "SpaPlus Global. Tworzymy lepsze dni dzięki spa, wellness i technologii.",
  },
  es: {
    dir: "ltr",
    subject: "Hemos recibido tu mensaje | SpaPlus Global",
    eyebrow: "Tu mensaje ya está con nosotros",
    title: (name) => `Gracias, ${name}.`,
    intro:
      "El equipo de SpaPlus ha recibido tu consulta. La revisaremos personalmente y te responderemos lo antes posible.",
    topic: "Tema de la consulta",
    message: "Tu mensaje",
    response: "Una persona de nuestro equipo responderá directamente a esta dirección.",
    cta: "Visitar SpaPlus Global",
    footer:
      "SpaPlus Global. Creamos días mejores a través del spa, el bienestar y la tecnología.",
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
  dir,
  eyebrow,
  title,
  intro,
  content,
  ctaLabel,
  footer,
}: {
  dir: "ltr" | "rtl";
  eyebrow: string;
  title: string;
  intro: string;
  content: string;
  ctaLabel: string;
  footer: string;
}) => `<!doctype html>
<html lang="${dir === "rtl" ? "he" : "en"}" dir="${dir}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f2f3;font-family:Arial,'Helvetica Neue',sans-serif;color:#172744;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f2f3;">
      <tr>
        <td align="center" style="padding:34px 14px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 14px 40px rgba(23,39,68,.12);">
            <tr>
              <td style="height:7px;background:#e9176a;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px 38px 20px;text-align:${dir === "rtl" ? "right" : "left"};">
                <img src="${logoUrl}" width="132" alt="SpaPlus" style="display:block;width:132px;height:auto;border:0;margin:${dir === "rtl" ? "0 0 0 auto" : "0 auto 0 0"};">
              </td>
            </tr>
            <tr>
              <td style="padding:8px 38px 34px;text-align:${dir === "rtl" ? "right" : "left"};">
                <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:#fff0f6;color:#bd0f55;font-size:12px;font-weight:700;letter-spacing:.02em;">${escapeHtml(eyebrow)}</div>
                <h1 style="margin:20px 0 12px;color:#172744;font-size:34px;line-height:1.18;font-weight:800;">${escapeHtml(title)}</h1>
                <p style="margin:0;color:#536179;font-size:17px;line-height:1.75;">${escapeHtml(intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 38px 34px;">
                ${content}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 38px 38px;">
                <a href="${siteUrl}" style="display:inline-block;padding:15px 26px;border-radius:12px;background:#e9176a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:800;">${escapeHtml(ctaLabel)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 38px;background:#172744;color:#cbd3df;text-align:center;font-size:12px;line-height:1.7;">
                ${escapeHtml(footer)}<br>
                <a href="mailto:info@spaplus.ca" style="color:#ffffff;text-decoration:none;">info@spaplus.ca</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

export function buildVisitorEmail(data: ContactEmailData) {
  const copy = visitorCopy[data.locale] || visitorCopy.en;
  const organization = data.organization
    ? `<p style="margin:10px 0 0;color:#7a8497;font-size:13px;">${escapeHtml(data.organization)}</p>`
    : "";
  const content = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8f7f8;border:1px solid #ece7ea;border-radius:16px;">
      <tr>
        <td style="padding:22px 24px;text-align:${copy.dir === "rtl" ? "right" : "left"};">
          <div style="color:#9b647b;font-size:12px;font-weight:700;">${escapeHtml(copy.topic)}</div>
          <div style="margin-top:6px;color:#172744;font-size:17px;font-weight:800;">${escapeHtml(data.topic)}</div>
          ${organization}
        </td>
      </tr>
      <tr>
        <td style="padding:0 24px;"><div style="height:1px;background:#e5dfe3;"></div></td>
      </tr>
      <tr>
        <td style="padding:22px 24px;text-align:${copy.dir === "rtl" ? "right" : "left"};">
          <div style="color:#9b647b;font-size:12px;font-weight:700;">${escapeHtml(copy.message)}</div>
          <div style="margin-top:8px;color:#35445d;font-size:15px;line-height:1.75;">${nl2br(data.message)}</div>
        </td>
      </tr>
    </table>
    <p style="margin:20px 4px 0;color:#536179;font-size:14px;line-height:1.7;text-align:${copy.dir === "rtl" ? "right" : "left"};">${escapeHtml(copy.response)}</p>`;

  return {
    subject: copy.subject,
    html: frame({
      dir: copy.dir,
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
          <td style="padding:11px 0;color:#8a5b70;font-size:12px;font-weight:700;vertical-align:top;width:34%;">${escapeHtml(label)}</td>
          <td dir="auto" style="padding:11px 0;color:#172744;font-size:14px;font-weight:700;vertical-align:top;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  const content = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8f7f8;border:1px solid #ece7ea;border-radius:16px;">
      <tr>
        <td style="padding:18px 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${rows}</table>
        </td>
      </tr>
    </table>
    <div style="margin-top:18px;padding:22px 24px;border-radius:16px;background:#172744;color:#ffffff;text-align:right;">
      <div style="color:#ff9fc3;font-size:12px;font-weight:700;">תוכן ההודעה</div>
      <div dir="auto" style="margin-top:10px;font-size:16px;line-height:1.8;">${nl2br(data.message)}</div>
    </div>
    <div style="margin-top:20px;text-align:center;">
      <a href="mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent(`תשובה לפנייה בנושא ${data.topic}`)}" style="display:inline-block;padding:14px 24px;border:1px solid #e9176a;border-radius:12px;color:#e9176a;text-decoration:none;font-size:14px;font-weight:800;">מענה ישיר לפונה</a>
    </div>`;

  return {
    subject: `פנייה חדשה מ־SpaPlus Global | ${data.topic} | ${data.name}`,
    html: frame({
      dir: "rtl",
      eyebrow: "פנייה חדשה מהאתר",
      title: `${data.name} רוצה לדבר איתנו.`,
      intro:
        "כל פרטי הפנייה מרוכזים כאן. לחיצה על מענה ישיר תפתח תשובה לכתובת שהפונה הזין.",
      content,
      ctaLabel: "פתיחת אתר SpaPlus Global",
      footer: "SpaPlus Global. פנייה שנשלחה ישירות מטופס האתר.",
    }),
  };
}
