"use client";

import { CSSProperties, FormEvent, useEffect, useState } from "react";
import styles from "./market-launch.module.css";

type SubmitState = "idle" | "submitting" | "success" | "error";

const spaTypes = [
  "ספא יום",
  "ספא במלון או באתר אירוח",
  "ספא תרמי או נורדי",
  "מרכז וולנס או רפואת גוף",
  "קבוצת ספא עם כמה סניפים",
  "בית ספא מבוסס מסוג אחר",
];

const services = [
  "עיסויים",
  "טיפולי פנים וטיפוח",
  "טיפולי גוף",
  "חוויה תרמית או נורדית",
  "חוויות לזוגות",
  "חוויות לקבוצות",
  "כניסות יומיות",
  "חופשות ספא",
];

export default function IsraelMarketPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.documentElement.lang = "he";
    document.documentElement.dir = "rtl";
    return () => {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitState === "submitting") return;

    const form = event.currentTarget;
    const values = new FormData(form);
    const selectedServices = values.getAll("services").map(String);
    if (!selectedServices.length) {
      setSubmitState("error");
      setErrorMessage("נא לבחור לפחות שירות מרכזי אחד.");
      form.querySelector<HTMLInputElement>('input[name="services"]')?.focus();
      return;
    }

    setSubmitState("submitting");
    setErrorMessage("");
    const payload = {
      submissionId: crypto.randomUUID(),
      market: "israel",
      name: String(values.get("name") || ""),
      role: String(values.get("role") || ""),
      email: String(values.get("email") || ""),
      phone: String(values.get("phone") || ""),
      organization: String(values.get("organization") || ""),
      website: String(values.get("website") || ""),
      city: String(values.get("city") || ""),
      postalCode: String(values.get("postalCode") || ""),
      spaType: String(values.get("spaType") || ""),
      locations: String(values.get("locations") || ""),
      services: selectedServices,
      bookingSystem: String(values.get("bookingSystem") || ""),
      preferredContact: String(values.get("preferredContact") || ""),
      message: String(values.get("message") || ""),
      privacyAccepted: values.get("privacy") === "accepted",
      acknowledgementAccepted: values.get("acknowledgement") === "accepted",
      honey: String(values.get("website_confirm") || ""),
      locale: "he-IL",
      source: window.location.href,
      campaign: Object.fromEntries(
        ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"]
          .map((key) => [key, new URLSearchParams(window.location.search).get(key) || ""])
          .filter(([, value]) => value),
      ),
    };

    try {
      const response = await fetch("/api/market-spa-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !result.success) throw new Error(result.error || "submission failed");
      form.reset();
      setSubmitState("success");
    } catch {
      setSubmitState("error");
      setErrorMessage("לא הצלחנו לשלוח את הפרטים כרגע. אפשר לנסות שוב בעוד רגע.");
    }
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <main
      className={styles.page}
      lang="he"
      dir="rtl"
      style={{ "--market-hero": 'url("/ontario/hero-ontario-campaign-v2.jpg")' } as CSSProperties}
    >
      <a className={styles.skipLink} href="#main-content">דילוג לתוכן הראשי</a>

      <header className={styles.header}>
        <a className={styles.brand} href="#main-content" aria-label="SpaPlus ישראל, תחילת העמוד">
          <img src="/spaplus-mark.png" alt="" width="48" height="48" />
          <img src="/spaplus-wordmark.png" alt="SpaPlus" width="132" height="40" />
        </a>
        <button
          className={styles.menuButton}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="israel-market-navigation"
          aria-label={menuOpen ? "סגירת התפריט" : "פתיחת התפריט"}
          onClick={() => setMenuOpen((open) => !open)}
        ><span /><span /><span /></button>
        <nav id="israel-market-navigation" className={`${styles.headerNav} ${menuOpen ? styles.menuOpen : ""}`} aria-label="ניווט שותפי SpaPlus ישראל">
          <a href="#platform" onClick={closeMenu}>הפלטפורמה</a>
          <a href="#process" onClick={closeMenu}>איך זה עובד</a>
          <a href="#faq" onClick={closeMenu}>שאלות</a>
          <a className={styles.navCta} href="#join" onClick={closeMenu}>להציג את בית הספא</a>
        </nav>
      </header>

      <section className={styles.hero} id="main-content" data-no-reveal>
        <div className={styles.heroPhoto} aria-hidden="true" />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>SpaPlus ישראל</p>
          <h1>בתי ספא מצוינים בישראל, הגיע הזמן שיותר אנשים יגלו אתכם.</h1>
          <p className={styles.heroLead}>SpaPlus בונה בישראל ערוץ ייעודי לגילוי ולהזמנה של חוויות ספא. אנחנו מחפשים בתי ספא מבוססים שרוצים לצמוח בדרך מדויקת, עם שליטה מלאה בעסק.</p>
          <div className={styles.promiseRow} aria-label="תנאי ההצטרפות">
            <span>ללא עלות להצגת העסק</span><span>ללא התחייבות</span><span>ללא פרטי אשראי</span>
          </div>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#join">להציג את בית הספא</a>
            <a className={styles.textButton} href="#platform">לראות איך זה עובד</a>
          </div>
          <p className={styles.heroNote}>הטופס הוא פנייה ראשונית בלבד. הוא אינו חוזה ואינו רכישה.</p>
          <p className={styles.heroMediaNote}>הדימוי בעמוד הוא המחשה של קמפיין SpaPlus ואינו מציג בית ספא ישראלי או שותף קיים.</p>
        </div>
      </section>

      <section className={styles.intro} id="platform">
        <aside className={styles.introAside}><p className={styles.eyebrowDark}>ערוץ צמיחה אחד, ברור</p><ol className={styles.introPath}><li><span>01</span><strong>גילוי</strong></li><li><span>02</span><strong>בחירה</strong></li><li><span>03</span><strong>הזמנה</strong></li></ol></aside>
        <div><h2>הזדמנות חדשה לבתי ספא שמכבדים את חוויית האורח.</h2><p>הפלטפורמה נועדה לעזור לאורחים למצוא את החוויה שמתאימה להם, ולבתי ספא להציג את הערך הייחודי שלהם בצורה ברורה, איכותית ונוחה לניהול.</p></div>
      </section>

      <section className={styles.benefits} aria-label="היתרונות לבתי ספא">
        <article><span>01</span><h3>להגיע לאורחים חדשים</h3><p>נציג את בית הספא לקהל שמחפש חוויה, לא רק טיפול בודד.</p></article>
        <article><span>02</span><h3>להישאר בשליטה</h3><p>העסק שומר על שליטה בהיצע, בזמינות ובאישור כל הזמנה.</p></article>
        <article><span>03</span><h3>לבחון לפני שמחליטים</h3><p>אם תימצא התאמה, תקבלו את תנאי השותפות בכתב לפני כל החלטה.</p></article>
      </section>

      <section className={styles.foundingOffer}>
        <div><p className={styles.eyebrowDark}>הצטרפות מוקדמת</p><h2>מתחילים בשיחה, לא בהתחייבות.</h2><p>נכיר את בית הספא, את הקהל ואת הדרך הנכונה להציג אתכם. כל הצעה מסחרית, אם תהיה, תימסר בנפרד ובכתב.</p></div>
        <ol className={styles.foundingPath}><li><span>01</span><strong>הצגה ללא עלות</strong><small>פרטי העסק והחוויה</small></li><li><span>02</span><strong>בדיקת התאמה</strong><small>מיקום, שירותים ומיצוב</small></li><li><span>03</span><strong>שיחה מקצועית</strong><small>לומדים מה נכון לכם</small></li><li><span>04</span><strong>החלטה משותפת</strong><small>רק אחרי שכל התנאים ברורים</small></li></ol>
      </section>

      <section className={styles.fitSection}>
        <div><p className={styles.eyebrowDark}>את מי נשמח להכיר</p><h2>בתי ספא בישראל שמשקיעים בחוויית אורח מצוינת.</h2></div>
        <div className={styles.fitGrid}><p>ספא יום עם מיקום מסחרי פיזי</p><p>ספא במלון, באתר אירוח, או מתחם תרמי</p><p>מתחמי וולנס עם חוויות שניתן להזמין</p><p>קבוצות עם כמה סניפים שמחפשות ערוץ צמיחה נוסף</p></div>
        <p className={styles.fitNote}>בשלב זה התוכנית אינה מיועדת למטפלים ניידים, לטיפולים בבית הלקוח או לחדר טיפול פרטי של מטפל יחיד.</p>
      </section>

      <section className={styles.process} id="process"><div><p className={styles.eyebrow}>תהליך פשוט ומכבד</p><h2>ארבעה שלבים, בקצב שלכם.</h2><p>הצגת העסק לא מחייבת אתכם לשום דבר.</p></div><ol><li><span>01</span><h3>מספרים לנו על העסק</h3><p>הפרטים הבסיסיים על בית הספא, השירותים והמיקום.</p></li><li><span>02</span><h3>אנחנו בודקים התאמה</h3><p>נבחן אם המודל והקהל מתאימים לשני הצדדים.</p></li><li><span>03</span><h3>מקיימים שיחה אמיתית</h3><p>נסביר את המודל ונענה על השאלות שלכם.</p></li><li><span>04</span><h3>מחליטים ביחד</h3><p>ממשיכים רק אם זה נכון לבית הספא שלכם.</p></li></ol></section>

      <section className={styles.formSection} id="join">
        <div className={styles.formIntro}><p className={styles.eyebrowDark}>פניית שותפות ל־SpaPlus ישראל</p><h2>ספרו לנו על בית הספא.</h2><p>מלאו את הטופס פעם אחת. נבדוק את הפרטים וניצור קשר בתוך 72 שעות.</p><div className={styles.assuranceCard}><strong>מה קורה לאחר השליחה?</strong><ul><li>תקבלו אישור בדוא״ל.</li><li>נבדוק את העסק, המיקום והשירותים.</li><li>ניצור קשר לשיחה קצרה.</li><li>לא נבקש תשלום או פרטי אשראי.</li></ul></div></div>
        <form className={styles.form} onSubmit={handleSubmit} aria-busy={submitState === "submitting"}>
          <div className={styles.field}><label htmlFor="organization">שם בית הספא או העסק</label><input id="organization" name="organization" required maxLength={160} /></div>
          <div className={styles.field}><label htmlFor="website">אתר או פרופיל עסקי</label><input id="website" name="website" type="url" required placeholder="https://" maxLength={300} /></div>
          <div className={styles.field}><label htmlFor="city">עיר או יישוב</label><input id="city" name="city" required maxLength={100} /></div>
          <div className={styles.field}><label htmlFor="postalCode">מיקוד</label><input id="postalCode" name="postalCode" required autoComplete="postal-code" maxLength={12} /></div>
          <div className={styles.field}><label htmlFor="spaType">סוג בית הספא</label><select id="spaType" name="spaType" required defaultValue=""><option value="" disabled>בחירת סוג בית הספא</option>{spaTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
          <div className={styles.field}><label htmlFor="locations">מספר סניפים</label><select id="locations" name="locations" required defaultValue=""><option value="" disabled>בחירת מספר סניפים</option><option value="1">סניף אחד</option><option value="2-3">2 עד 3 סניפים</option><option value="4-10">4 עד 10 סניפים</option><option value="11+">11 סניפים או יותר</option></select></div>
          <fieldset className={styles.services}><legend>שירותים מרכזיים</legend><div>{services.map((service) => <label key={service}><input type="checkbox" name="services" value={service} /><span>{service}</span></label>)}</div></fieldset>
          <div className={styles.field}><label htmlFor="name">שם מלא</label><input id="name" name="name" required autoComplete="name" maxLength={100} /></div>
          <div className={styles.field}><label htmlFor="role">תפקיד בעסק</label><input id="role" name="role" required maxLength={100} /></div>
          <div className={styles.field}><label htmlFor="email">דוא״ל עסקי</label><input id="email" name="email" type="email" required autoComplete="email" maxLength={180} /></div>
          <div className={styles.field}><label htmlFor="phone">טלפון</label><input id="phone" name="phone" type="tel" required autoComplete="tel" maxLength={40} /></div>
          <div className={styles.field}><label htmlFor="preferredContact">דרך התקשרות מועדפת</label><select id="preferredContact" name="preferredContact" required defaultValue=""><option value="" disabled>בחירת דרך התקשרות</option><option value="Email">דוא״ל</option><option value="Phone">טלפון</option><option value="WhatsApp">WhatsApp</option></select></div>
          <div className={styles.field}><label htmlFor="bookingSystem">מערכת הזמנות נוכחית <span>אופציונלי</span></label><input id="bookingSystem" name="bookingSystem" maxLength={120} /></div>
          <div className={`${styles.field} ${styles.fullField}`}><label htmlFor="message">יש משהו נוסף שכדאי שנדע? <span>אופציונלי</span></label><textarea id="message" name="message" rows={5} maxLength={1500} /></div>
          <div className={styles.honeypot} aria-hidden="true"><label htmlFor="website_confirm">יש להשאיר ריק</label><input id="website_confirm" name="website_confirm" tabIndex={-1} autoComplete="off" /></div>
          <label className={styles.consent}><input type="checkbox" name="privacy" value="accepted" required /><span>אני מאשר או מאשרת ל־SpaPlus להשתמש בפרטים כדי לבדוק את הפנייה ולחזור אליי, כמפורט במדיניות הפרטיות.</span></label>
          <label className={styles.consent}><input type="checkbox" name="acknowledgement" value="accepted" required /><span>ברור לי שזו פנייה ראשונית בלבד. היא אינה יוצרת התחייבות ואינה דורשת תשלום או פרטי אשראי.</span></label>
          <button className={styles.submitButton} type="submit" disabled={submitState === "submitting"}>{submitState === "submitting" ? "שולחים את הפרטים..." : "שליחת פרטי בית הספא"}</button>
          {submitState === "error" ? <p className={styles.formError} role="alert">{errorMessage}</p> : null}
          <p className={styles.formFinePrint}>קבלת שותפים אינה מובטחת. כל הצעה מסחרית תימסר בנפרד ובכתב לאחר בדיקת התאמה.</p>
        </form>
      </section>

      <section className={styles.faq} id="faq"><div><p className={styles.eyebrowDark}>השאלות החשובות</p><h2>לפני שמתחילים.</h2></div><div className={styles.faqList}><details><summary>האם יש עלות להצגת בית הספא?</summary><p>לא. שליחת הפנייה אינה כרוכה בעלות, בכרטיס אשראי או בהתחייבות.</p></details><details><summary>האם הפנייה מחייבת אותי להצטרף?</summary><p>לא. היא רק מאפשרת לנו לבדוק התאמה. כל תנאי שותפות יוצגו לכם בכתב לפני החלטה.</p></details><details><summary>איך יתנהלו הזמנות בעתיד?</summary><p>מודל ההזמנות יוצג רק לאחר בדיקת התאמה. בית הספא שומר על שליטה בהיצע, בזמינות ובאישור.</p></details><details><summary>האם אתם כבר פעילים בישראל?</summary><p>לא. העמוד נועד לגייס את קבוצת השותפים הראשונית לקראת הקמת הפעילות בישראל.</p></details></div></section>

      <section className={styles.finalCta}><p className={styles.eyebrow}>ישראל, בואו נבנה את זה נכון.</p><h2>בית הספא שלכם יכול להיות חלק מהקבוצה הראשונה של SpaPlus ישראל.</h2><a className={styles.primaryButton} href="#join">להציג את בית הספא</a></section>
      <footer className={styles.footer}><div className={styles.footerBrand}><img src="/spaplus-wordmark.png" alt="SpaPlus" width="132" height="40" /><p>עמוד זה מיועד לפניות שותפות מבתי ספא מבוססים בישראל.</p></div><div><strong>ניווט</strong><a href="#platform">הפלטפורמה</a><a href="#process">איך זה עובד</a><a href="#join">הצטרפות</a></div><div><strong>אמון ופרטיות</strong><a href="https://spaplus.co/he/#privacy">מדיניות פרטיות</a><a href="https://spaplus.co/he/#accessibility">נגישות</a></div><small>SpaPlus, operated by GLOBAL SPA MANAGEMENT LTD</small></footer>

      {submitState === "success" ? <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSubmitState("idle"); }}><div className={styles.successModal} role="dialog" aria-modal="true" aria-labelledby="israel-success-title"><button type="button" aria-label="סגירת האישור" onClick={() => setSubmitState("idle")}>×</button><span className={styles.successMark} aria-hidden="true">✓</span><p className={styles.eyebrowDark}>הפנייה התקבלה</p><h2 id="israel-success-title">תודה, פרטי בית הספא אצלנו.</h2><p>נשלח אישור לדוא״ל. נבדוק את הפנייה וניצור קשר בתוך 72 שעות.</p><button className={styles.modalButton} type="button" onClick={() => setSubmitState("idle")}>חזרה לעמוד</button></div></div> : null}
    </main>
  );
}
