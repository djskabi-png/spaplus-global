export type ViiVacationJoinEmailData = {
  reference: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  location: string;
  website: string;
  message: string;
  packageLabel: string;
  billingCycle: string;
  sourcePage: string;
  submittedAt: string;
};

const siteUrl = "https://vii.spaplus.co/join/vacation#join-pricing";
const logoUrl = "https://vii.spaplus.co/vii-logo.png";

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const multiline = (value: string) => escapeHtml(value).replaceAll("\n", "<br>");

function detailRow(label: string, value: string) {
  if (!value) return "";
  return `<tr>
    <td style="width:34%;padding:12px 14px;border-bottom:1px solid #dcebed;color:#54727a;font-size:12px;line-height:1.5;vertical-align:top;">${escapeHtml(label)}</td>
    <td dir="auto" style="padding:12px 14px;border-bottom:1px solid #dcebed;color:#12343c;font-size:14px;line-height:1.55;font-weight:700;vertical-align:top;word-break:break-word;">${multiline(value)}</td>
  </tr>`;
}

function frame({ preheader, eyebrow, title, intro, content, buttonLabel, buttonHref = siteUrl }: { preheader: string; eyebrow: string; title: string; intro: string; content: string; buttonLabel: string; buttonHref?: string }) {
  return `<!doctype html>
<html lang="he" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body dir="rtl" style="margin:0;padding:0;background:#eef6f5;color:#12343c;font-family:Rubik,Heebo,Arial,sans-serif;direction:rtl;text-align:right;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef6f5;">
    <tr><td align="center" style="padding:28px 12px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:680px;background:#ffffff;border:1px solid #d6e7e8;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(12,72,82,.12);">
        <tr><td style="padding:20px 30px;border-bottom:1px solid #dcebed;background:#ffffff;">
          <a href="${siteUrl}" style="text-decoration:none;"><img src="${logoUrl}" width="104" alt="וי פור ויקיישן" style="display:block;width:104px;max-width:100%;height:auto;border:0;"></a>
        </td></tr>
        <tr><td style="padding:38px 30px 20px;background:linear-gradient(135deg,#e9f8f5 0%,#ffffff 68%);">
          <p style="margin:0 0 10px;color:#0b8c94;font-size:12px;line-height:1.4;font-weight:800;letter-spacing:.04em;">${escapeHtml(eyebrow)}</p>
          <h1 style="margin:0;color:#12343c;font-size:34px;line-height:1.15;letter-spacing:-.7px;">${escapeHtml(title)}</h1>
          <p style="margin:16px 0 0;color:#58727a;font-size:16px;line-height:1.75;">${escapeHtml(intro)}</p>
        </td></tr>
        <tr><td style="padding:12px 30px 34px;">${content}
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;"><tr><td style="border-radius:12px;background:#0d8f99;"><a href="${escapeHtml(buttonHref)}" style="display:inline-block;padding:14px 24px;color:#ffffff;text-decoration:none;font-size:14px;line-height:1.2;font-weight:800;">${escapeHtml(buttonLabel)}</a></td></tr></table>
        </td></tr>
        <tr><td style="padding:22px 30px;background:#12343c;color:#c8dcdf;font-size:12px;line-height:1.7;">וי פור ויקיישן, מקבוצת וילה פור יו<br><a href="https://vii.spaplus.co" style="color:#ffffff;text-decoration:none;">vii.spaplus.co</a></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function buildViiVacationOwnerEmail(data: ViiVacationJoinEmailData) {
  const rows = [
    ["מספר פנייה", data.reference],
    ["שם העסק", data.organization],
    ["איש קשר", data.name],
    ["טלפון", data.phone],
    ["דואר אלקטרוני", data.email],
    ["יישוב או אזור", data.location || "לא צוין"],
    ["אתר או עמוד עסקי", data.website || "לא צוין"],
    ["מסלול", data.packageLabel || "שיתוף פעולה לעסקי נופש"],
    ["מועד השליחה", data.submittedAt],
    ["מקור", `אתר VII, ${data.sourcePage}`],
  ].map(([label, value]) => detailRow(label, value)).join("");
  const replyHref = `mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent(`המשך לבקשת ההצטרפות של ${data.organization} ל-VII`)}`;
  const content = `<div style="margin:0 0 18px;padding:15px 17px;border:1px solid #a9dcda;border-radius:14px;background:#eaf9f6;color:#12343c;font-size:13px;line-height:1.65;"><strong>הליד נשמר במרכז הלידים של וילה פור יו תחת המותג VII.</strong><br>אפשר להשיב ישירות ללקוח באמצעות הכפתור.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #dcebed;border-radius:16px;border-collapse:separate;overflow:hidden;">${rows}</table>
    <div style="margin-top:18px;padding:20px;border-radius:16px;background:#12343c;color:#ffffff;"><strong style="display:block;margin-bottom:8px;color:#76d8d2;font-size:12px;">על העסק והבקשה</strong><p dir="auto" style="margin:0;font-size:15px;line-height:1.75;">${multiline(data.message)}</p></div>`;
  return {
    subject: `ליד נופש חדש מאתר VII | ${data.organization} | ${data.name}`,
    text: [`ליד נופש חדש מאתר VII`, "", `מספר פנייה: ${data.reference}`, `שם העסק: ${data.organization}`, `איש קשר: ${data.name}`, `טלפון: ${data.phone}`, `דואר אלקטרוני: ${data.email}`, `יישוב או אזור: ${data.location || "לא צוין"}`, `אתר או עמוד עסקי: ${data.website || "לא צוין"}`, `מסלול: ${data.packageLabel || "שיתוף פעולה לעסקי נופש"}`, "", "על העסק והבקשה:", data.message, "", `מקור: ${data.sourcePage}`].join("\n"),
    html: frame({ preheader: `${data.organization} השאירו בקשת הצטרפות לעולם הנופש באתר VII.`, eyebrow: "ליד חדש, עולם הנופש", title: data.organization, intro: `${data.name} ביקש או ביקשה להצטרף ל-VII. כל הפרטים נשמרו במרכז הלידים ומוכנים להמשך טיפול.`, content, buttonLabel: "מענה ישיר ללקוח", buttonHref: replyHref }),
  };
}

export function buildViiVacationVisitorEmail(data: ViiVacationJoinEmailData) {
  const content = `<div style="margin:0 0 20px;padding:18px;border:1px solid #a9dcda;border-radius:16px;background:#eaf9f6;"><strong style="display:block;margin-bottom:7px;color:#12343c;font-size:15px;">מה קורה עכשיו?</strong><p style="margin:0;color:#58727a;font-size:14px;line-height:1.75;">נציג המתמחה בעסקי נופש יעבור על פרטי העסק והבקשה ויחזור אליכם להמשך מסודר. אין חיוב ואין התחייבות בשלב הזה.</p></div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #dcebed;border-radius:16px;border-collapse:separate;overflow:hidden;">
      ${detailRow("מספר פנייה", data.reference)}${detailRow("שם העסק", data.organization)}${detailRow("איש קשר", data.name)}${detailRow("טלפון", data.phone)}${detailRow("יישוב או אזור", data.location || "לא צוין")}${detailRow("מסלול", data.packageLabel || "שיתוף פעולה לעסקי נופש")}
    </table>
    <p style="margin:20px 2px 0;color:#58727a;font-size:13px;line-height:1.7;">שמרו את מספר הפנייה. אם תצטרכו להוסיף מידע, אפשר להשיב ישירות למייל הזה.</p>`;
  return {
    subject: `קיבלנו את בקשת ההצטרפות שלך ל-VII | ${data.organization}`,
    text: [`תודה ${data.name},`, "", `קיבלנו את בקשת ההצטרפות של ${data.organization} לעולם הנופש באתר VII.`, "נציג המתמחה בעסקי נופש יעבור על הפרטים ויחזור אליכם להמשך מסודר.", "אין חיוב ואין התחייבות בשלב הזה.", "", `מספר פנייה: ${data.reference}`, `טלפון: ${data.phone}`, `יישוב או אזור: ${data.location || "לא צוין"}`, "", siteUrl].join("\n"),
    html: frame({ preheader: `בקשת ההצטרפות של ${data.organization} התקבלה.`, eyebrow: "הבקשה התקבלה", title: `תודה ${data.name}.`, intro: `קיבלנו את בקשת ההצטרפות של ${data.organization} לעולם הנופש באתר VII.`, content, buttonLabel: "חזרה ל-VII" }),
  };
}
