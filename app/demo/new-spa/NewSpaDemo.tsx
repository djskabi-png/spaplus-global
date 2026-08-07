"use client";

import { useMemo, useState } from "react";

type Locale = "en" | "he";

const copy = {
  en: {
    demo: "DEMO WORKSPACE",
    spaName: "New Spa Demo",
    welcome: "Welcome to SpaPlus.",
    intro: "Let’s prepare your spa for its first booking.",
    preview: "This is exactly how a new spa sees the workspace before adding any content.",
    progress: "Setup progress",
    progressValue: "0 of 6 completed",
    start: "Start setup",
    reset: "Reset demo",
    nav: ["Home", "Bookings", "Calendar", "Services", "Customers", "Spa profile", "Help centre"],
    stats: ["Bookings", "Revenue", "Customers", "Live offers"],
    zeroRevenue: "$0",
    checklistTitle: "Your launch checklist",
    checklistText: "Complete these steps so guests can discover and book your spa.",
    tasks: [
      ["Complete your spa profile", "Add your address, contact details and a short introduction."],
      ["Add photos", "Upload approved photos of the spa, facilities and treatment rooms."],
      ["Create your first service", "Add a treatment, package or day-pass experience."],
      ["Set opening hours", "Tell guests when your spa is available."],
      ["Choose booking settings", "Decide how bookings are confirmed and managed."],
      ["Review and publish", "Send the profile to the SpaPlus team for a final review."],
    ],
    continue: "Open step",
    emptyTitle: "No bookings yet",
    emptyText: "New bookings will appear here with the guest details, selected service, date and confirmation status.",
    bookingPreview: "See a booking example",
    previewTitle: "What your first booking will look like",
    previewBody: "This is only a preview. It does not change the dashboard totals.",
    previewRows: ["Guest and contact details", "Selected treatment or package", "Date, time and participants", "Payment and confirmation status"],
    close: "Close preview",
    helpTitle: "Need help getting started?",
    helpText: "Book a short onboarding call or watch the setup guide.",
    call: "Book an onboarding call",
    guide: "Watch the setup guide",
    panelTitle: "First step: complete your spa profile",
    panelText: "In the real workspace, this opens a guided form for the spa name, address, contact details, description and approved media.",
    panelNote: "The demo remains at zero until a real spa saves its first item.",
    back: "Back to dashboard",
    language: "עברית",
    signed: "Demo account",
  },
  he: {
    demo: "סביבת הדגמה",
    spaName: "ספא חדש לדוגמה",
    welcome: "ברוכים הבאים לספא פלוס.",
    intro: "בואו נכין את הספא שלכם להזמנה הראשונה.",
    preview: "כך בדיוק ספא חדש רואה את סביבת העבודה לפני שהוסיף תוכן.",
    progress: "התקדמות בהקמה",
    progressValue: "0 מתוך 6 הושלמו",
    start: "התחלת ההקמה",
    reset: "איפוס ההדגמה",
    nav: ["בית", "הזמנות", "יומן", "שירותים", "לקוחות", "פרופיל הספא", "מרכז עזרה"],
    stats: ["הזמנות", "הכנסות", "לקוחות", "הצעות פעילות"],
    zeroRevenue: "0 דולר",
    checklistTitle: "רשימת ההכנה שלכם",
    checklistText: "השלימו את השלבים כדי שאורחים יוכלו למצוא ולהזמין את הספא.",
    tasks: [
      ["השלמת פרופיל הספא", "הוסיפו כתובת, פרטי קשר ותיאור קצר."],
      ["הוספת תמונות", "העלו תמונות מאושרות של הספא, המתקנים וחדרי הטיפול."],
      ["יצירת השירות הראשון", "הוסיפו טיפול, חבילה או חוויית יום ספא."],
      ["הגדרת שעות פעילות", "ספרו לאורחים מתי הספא זמין."],
      ["בחירת הגדרות הזמנה", "קבעו כיצד הזמנות יאושרו וינוהלו."],
      ["בדיקה ופרסום", "שלחו את הפרופיל לצוות ספא פלוס לבדיקה סופית."],
    ],
    continue: "פתיחת השלב",
    emptyTitle: "עדיין אין הזמנות",
    emptyText: "הזמנות חדשות יופיעו כאן עם פרטי האורח, השירות שנבחר, התאריך ומצב האישור.",
    bookingPreview: "הצגת הזמנה לדוגמה",
    previewTitle: "כך תיראה ההזמנה הראשונה",
    previewBody: "זוהי המחשה בלבד. היא אינה משנה את נתוני הדשבורד.",
    previewRows: ["פרטי האורח ופרטי הקשר", "הטיפול או החבילה שנבחרו", "תאריך, שעה ומספר משתתפים", "מצב התשלום והאישור"],
    close: "סגירת ההמחשה",
    helpTitle: "צריכים עזרה בהתחלה?",
    helpText: "אפשר לקבוע שיחת הכנה קצרה או לצפות במדריך ההקמה.",
    call: "קביעת שיחת הכנה",
    guide: "צפייה במדריך ההקמה",
    panelTitle: "השלב הראשון: השלמת פרופיל הספא",
    panelText: "במערכת האמיתית ייפתח כאן טופס מודרך עם שם הספא, הכתובת, פרטי הקשר, התיאור והמדיה המאושרת.",
    panelNote: "ההדגמה נשארת על אפס עד שספא אמיתי שומר את הפריט הראשון.",
    back: "חזרה לדשבורד",
    language: "English",
    signed: "חשבון הדגמה",
  },
} as const;

export default function NewSpaDemo() {
  const [locale, setLocale] = useState<Locale>("en");
  const [activeNav, setActiveNav] = useState(0);
  const [showBooking, setShowBooking] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const t = copy[locale];
  const direction = locale === "he" ? "rtl" : "ltr";
  const statValues = useMemo(() => ["0", t.zeroRevenue, "0", "0"], [t.zeroRevenue]);

  const resetDemo = () => {
    setActiveNav(0);
    setShowBooking(false);
    setShowSetup(false);
  };

  return (
    <main className="new-spa-demo" dir={direction} lang={locale}>
      <aside className="demo-sidebar" aria-label={locale === "he" ? "ניווט בסביבת ההדגמה" : "Demo workspace navigation"}>
        <a className="demo-brand" href="/demo/new-spa/" aria-label="SpaPlus demo home">
          <img src="/spaplus-mark.png" alt="" />
          <span>SpaPlus</span>
        </a>
        <div className="demo-spa-identity">
          <span>{t.demo}</span>
          <strong>{t.spaName}</strong>
        </div>
        <nav>
          {t.nav.map((label, index) => (
            <button className={activeNav === index ? "is-active" : ""} key={label} type="button" onClick={() => setActiveNav(index)}>
              <span className="demo-nav-dot" aria-hidden="true" />
              {label}
              {index > 0 && index < 5 ? <b>0</b> : null}
            </button>
          ))}
        </nav>
        <div className="demo-account">
          <span className="demo-avatar">NS</span>
          <div><strong>{t.spaName}</strong><span>{t.signed}</span></div>
        </div>
      </aside>

      <section className="demo-workspace">
        <header className="demo-topbar">
          <div>
            <span className="demo-mobile-brand">SpaPlus</span>
            <span className="demo-status"><i /> {t.demo}</span>
          </div>
          <div className="demo-top-actions">
            <button type="button" onClick={() => setLocale(locale === "en" ? "he" : "en")}>{t.language}</button>
            <button className="demo-reset" type="button" onClick={resetDemo}>{t.reset}</button>
          </div>
        </header>

        <nav className="demo-mobile-nav" aria-label={locale === "he" ? "ניווט בסביבת ההדגמה" : "Demo workspace navigation"}>
          {t.nav.slice(0, 5).map((label, index) => (
            <button className={activeNav === index ? "is-active" : ""} key={label} type="button" onClick={() => setActiveNav(index)}>
              <span className="demo-nav-dot" aria-hidden="true" />
              <b>{label}</b>
              {index > 0 ? <small>0</small> : null}
            </button>
          ))}
        </nav>

        <div className="demo-content">
          <section className="demo-hero">
            <div>
              <span className="demo-eyebrow">{t.spaName}</span>
              <h1>{t.welcome}<br />{t.intro}</h1>
              <p>{t.preview}</p>
            </div>
            <div className="demo-progress-card">
              <div className="demo-progress-copy"><span>{t.progress}</span><strong>{t.progressValue}</strong></div>
              <div className="demo-progress-track"><span /></div>
              <button type="button" onClick={() => setShowSetup(true)}>{t.start}</button>
            </div>
          </section>

          <section className="demo-stats" aria-label={locale === "he" ? "נתוני דשבורד" : "Dashboard totals"}>
            {t.stats.map((label, index) => <article key={label}><span>{label}</span><strong>{statValues[index]}</strong><small>0%</small></article>)}
          </section>

          <div className="demo-main-grid">
            <section className="demo-card demo-checklist">
              <header><div><span className="demo-section-label">0%</span><h2>{t.checklistTitle}</h2><p>{t.checklistText}</p></div><strong>0/6</strong></header>
              <div className="demo-task-list">
                {t.tasks.map(([title, description], index) => (
                  <article key={title}>
                    <span className="demo-task-number">{index + 1}</span>
                    <div><h3>{title}</h3><p>{description}</p></div>
                    <button type="button" onClick={() => setShowSetup(true)}>{t.continue}</button>
                  </article>
                ))}
              </div>
            </section>

            <div className="demo-side-column">
              <section className="demo-card demo-empty-bookings">
                <div className="demo-calendar-icon" aria-hidden="true"><span>0</span></div>
                <h2>{t.emptyTitle}</h2>
                <p>{t.emptyText}</p>
                <button type="button" onClick={() => setShowBooking(true)}>{t.bookingPreview}</button>
              </section>
              <section className="demo-help-card">
                <span>?</span><div><h2>{t.helpTitle}</h2><p>{t.helpText}</p><div><button type="button">{t.call}</button><button type="button">{t.guide}</button></div></div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {showBooking ? (
        <div className="demo-modal-backdrop" role="presentation" onClick={() => setShowBooking(false)}>
          <section className="demo-modal" role="dialog" aria-modal="true" aria-labelledby="booking-preview-title" onClick={(event) => event.stopPropagation()}>
            <button className="demo-modal-close" type="button" aria-label={t.close} onClick={() => setShowBooking(false)}>×</button>
            <span className="demo-section-label">{t.demo}</span><h2 id="booking-preview-title">{t.previewTitle}</h2><p>{t.previewBody}</p>
            <div className="demo-preview-rows">{t.previewRows.map((row) => <div key={row}><span>✓</span>{row}</div>)}</div>
            <button className="demo-primary" type="button" onClick={() => setShowBooking(false)}>{t.close}</button>
          </section>
        </div>
      ) : null}

      {showSetup ? (
        <div className="demo-drawer-backdrop" role="presentation" onClick={() => setShowSetup(false)}>
          <aside className="demo-drawer" role="dialog" aria-modal="true" aria-labelledby="setup-title" onClick={(event) => event.stopPropagation()}>
            <button className="demo-modal-close" type="button" aria-label={t.back} onClick={() => setShowSetup(false)}>×</button>
            <span className="demo-section-label">1 / 6</span><h2 id="setup-title">{t.panelTitle}</h2><p>{t.panelText}</p>
            <div className="demo-form-skeleton" aria-hidden="true"><span /><span /><span /><span /></div>
            <div className="demo-info-note">{t.panelNote}</div>
            <button className="demo-primary" type="button" onClick={() => setShowSetup(false)}>{t.back}</button>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
