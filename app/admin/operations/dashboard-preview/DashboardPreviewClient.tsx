"use client";

import { useMemo, useState } from "react";

type Period = 7 | 30 | 90;
type Market = "all" | "il" | "ca" | "on";

const periods: Array<{ value: Period; label: string }> = [
  { value: 7, label: "7 ימים" },
  { value: 30, label: "30 ימים" },
  { value: 90, label: "90 ימים" },
];

const markets: Array<{ value: Market; label: string }> = [
  { value: "all", label: "כל השווקים" },
  { value: "il", label: "ישראל" },
  { value: "ca", label: "קנדה" },
  { value: "on", label: "אונטריו" },
];

const marketFactors: Record<Market, number> = { all: 1, il: 0.58, ca: 0.42, on: 0.31 };

const reports = [
  { title: "מכירות יומיות", description: "הזמנות, הכנסות, הנחות ואמצעי תשלום לפי יום.", file: "daily-sales" },
  { title: "הכנסות חודשיות", description: "סיכום ברוטו, נטו, מסים ועמלות לפי חודש.", file: "monthly-revenue" },
  { title: "הזמנות וביטולים", description: "סטטוס ההזמנות, סיבות ביטול ושיעור מימוש.", file: "bookings-cancellations" },
  { title: "עמלות והתחשבנויות", description: "עמלות צפויות, תשלומים שבוצעו ויתרות פתוחות.", file: "commissions-settlements" },
  { title: "ביצועי בתי ספא", description: "השוואת הכנסות, הזמנות וממוצע הזמנה בין בתי הספא.", file: "spa-performance" },
  { title: "ייצוא להנהלת חשבונות", description: "קובץ מסודר להמשך טיפול חשבונאי ובקרה.", file: "accounting-export" },
];

const currency = new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("he-IL");

export default function DashboardPreviewClient() {
  const [period, setPeriod] = useState<Period>(30);
  const [market, setMarket] = useState<Market>("all");
  const [notice, setNotice] = useState("");
  const factor = marketFactors[market] * (period / 30);

  const data = useMemo(() => {
    const gross = Math.round(684320 * factor);
    const bookings = Math.round(1248 * factor);
    return {
      gross,
      bookings,
      net: Math.round(gross * 0.86),
      average: bookings ? Math.round(gross / bookings) : 0,
      commission: Math.round(gross * 0.12),
      cancellations: 4.8,
      conversion: 7.4,
      spas: Math.max(4, Math.round(86 * marketFactors[market])),
    };
  }, [factor, market]);

  const trend = [38, 51, 44, 63, 58, 72, 67, 83, 76, 91, 87, 96].map(value => Math.max(18, Math.round(value * marketFactors[market])));
  const selectedMarket = markets.find(item => item.value === market)?.label || "כל השווקים";

  function downloadReport(report: typeof reports[number]) {
    const rows = [
      ["דוח המחשה בלבד", report.title],
      ["שוק", selectedMarket],
      ["תקופה", `${period} ימים`],
      ["הכנסה ברוטו", data.gross],
      ["הזמנות", data.bookings],
      ["הכנסה נטו", data.net],
      ["ממוצע להזמנה", data.average],
      ["עמלה צפויה", data.commission],
    ];
    const csv = `\ufeff${rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.file}-demo.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice(`דוח ההמחשה "${report.title}" הורד בהצלחה`);
    window.setTimeout(() => setNotice(""), 3500);
  }

  return <section className="sales-preview">
    <header className="sales-preview-hero">
      <div>
        <p>מערכת התפעול העולמית</p>
        <h1>תוצאות מכירות והכנסות</h1>
        <span>תמונת מצב ניהולית להזמנות, הכנסות, עמלות, ביטולים וביצועי בתי הספא.</span>
      </div>
      <div className="sales-preview-controls" aria-label="סינון נתוני ההמחשה">
        <label>תקופה<select value={period} onChange={event => setPeriod(Number(event.target.value) as Period)}>{periods.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label>שוק<select value={market} onChange={event => setMarket(event.target.value as Market)}>{markets.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      </div>
    </header>

    <div className="sales-demo-notice" role="status"><b>נתוני המחשה בלבד</b><span>העמוד מוכן לחיבור. הנתונים האמיתיים יופיעו לאחר חיבור מקור הנתונים המאומת של גל.</span></div>

    <section className="sales-kpis" aria-label="מדדי ביצוע מרכזיים">
      {[
        ["הכנסה ברוטו", currency.format(data.gross), "סך העסקאות לפני הפחתות"],
        ["הזמנות", number.format(data.bookings), "הזמנות שנקלטו בתקופה"],
        ["הכנסה נטו", currency.format(data.net), "לאחר ביטולים והחזרים"],
        ["ממוצע להזמנה", currency.format(data.average), "שווי ממוצע לעסקה"],
        ["עמלה צפויה", currency.format(data.commission), "לפי מודל ההמחשה"],
        ["שיעור ביטולים", `${data.cancellations}%`, "מתוך כלל ההזמנות"],
        ["שיעור המרה", `${data.conversion}%`, "מביקור להזמנה"],
        ["בתי ספא פעילים", number.format(data.spas), "עם פעילות בתקופה"],
      ].map(([label, value, hint], index) => <article key={label}><div><span>{label}</span><b>{index < 5 ? "המחשה" : "מדד"}</b></div><strong>{value}</strong><small>{hint}</small></article>)}
    </section>

    <section className="sales-analysis-grid">
      <article className="sales-panel sales-trend">
        <header><div><span>מגמת מכירות</span><h2>הכנסות לאורך התקופה</h2></div><strong>{currency.format(data.gross)}</strong></header>
        <div className="sales-chart" aria-label="תרשים המחשה של מגמת המכירות">{trend.map((height, index) => <div key={index}><i style={{ height: `${height}%` }} /><span>{index + 1}</span></div>)}</div>
      </article>
      <article className="sales-panel sales-statuses">
        <header><div><span>מצב הזמנות</span><h2>מימוש מול ביטול</h2></div></header>
        <div className="sales-status-body"><div className="sales-ring"><strong>89%</strong><span>מומשו</span></div><ul><li><i className="confirmed" /><span>אושרו</span><b>89%</b></li><li><i className="pending" /><span>ממתינות</span><b>6%</b></li><li><i className="cancelled" /><span>בוטלו</span><b>5%</b></li></ul></div>
      </article>
    </section>

    <section className="sales-analysis-grid sales-secondary-grid">
      <article className="sales-panel sales-channels">
        <header><div><span>ערוצי מכירה</span><h2>מאיפה מגיעות ההזמנות</h2></div></header>
        <div>{[["אתרי SpaPlus", 58], ["הזמנה ישירה", 24], ["מוקד מכירות", 12], ["שותפים", 6]].map(([label, value]) => <div className="sales-channel" key={label}><span>{label}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}%</strong></div>)}</div>
      </article>
      <article className="sales-panel sales-spas">
        <header><div><span>בתי ספא מובילים</span><h2>ביצועים בתקופה</h2></div></header>
        <div className="sales-spa-list">{["ספא לדוגמה 1", "ספא לדוגמה 2", "ספא לדוגמה 3", "ספא לדוגמה 4"].map((name, index) => <div key={name}><b>{index + 1}</b><span><strong>{name}</strong><small>נתון המחשה</small></span><em>{currency.format(Math.round(data.gross * [0.18, 0.14, 0.11, 0.08][index]))}</em></div>)}</div>
      </article>
    </section>

    <section className="sales-reports">
      <header><div><p>דוחות וייצוא</p><h2>מרכז הדוחות</h2><span>כל דוח זמין כאן כהמחשה להורדה. לאחר החיבור לגל, אותם דוחות יתבססו על הנתונים האמיתיים.</span></div><b>{reports.length} דוחות</b></header>
      <div>{reports.map(report => <article key={report.file}><div><span>CSV</span><h3>{report.title}</h3><p>{report.description}</p></div><button type="button" onClick={() => downloadReport(report)}>הורדת דוח המחשה</button></article>)}</div>
    </section>
    {notice && <div className="sales-toast" role="status">{notice}</div>}
  </section>;
}
