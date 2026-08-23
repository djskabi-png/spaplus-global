"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Locale = "en" | "he";
type Meeting = { bookingId: string; guestName: string; guestEmail: string; title: string; startsAt: string; endsAt: string; timeZone: string; status: string; meetUrl: string; calendarUrl: string };

const copy = {
  en: {
    pageTitle: "Schedule a meeting", intro: "Create a real calendar event, a unique Google Meet link and a branded invitation in one clear flow.", back: "Back to management", switchLanguage: "עברית", organizer: "Organizer",
    connectionTitle: "Your Google Calendar", connected: "Connected and ready", disconnected: "Connect once to create meetings from your own calendar.", connect: "Connect Google Calendar", reconnect: "Reconnect calendar",
    guestSection: "Guest details", meetingSection: "Meeting details", guestName: "Guest name", guestEmail: "Guest email", title: "Meeting title", date: "Date", time: "Time", duration: "Duration", notes: "Message for your guest", notesHint: "Optional. This will appear in the invitation.", minutes: "minutes",
    create: "Create meeting", creating: "Creating the event and Google Meet link…", privacy: "The guest receives a Google Calendar invitation. A branded SpaPlus email is also sent when the email service is available.",
    successTitle: "The meeting is ready", successBody: "The event was added to your calendar and the guest invitation was requested.", join: "Open Google Meet", openCalendar: "Open in Google Calendar", copyLink: "Copy Meet link", copied: "Link copied", newMeeting: "Schedule another meeting",
    upcoming: "Upcoming meetings", noUpcoming: "No upcoming meetings yet.", loading: "Loading your calendar…", retry: "Dismiss",
    calendarNotConnected: "Connect your Google Calendar before creating the meeting.", conflict: "That time is already busy in your calendar. Choose another time.", reconnectRequired: "Your calendar connection expired. Reconnect it and try again.", genericError: "The meeting could not be created. Your form is still here, so you can try again.", pendingMeet: "The event exists, but Google is still preparing the Meet link. Open it in Calendar and try again in a moment.", emailWarning: "The calendar invitation was created. The additional branded email could not be confirmed.",
  },
  he: {
    pageTitle: "קביעת פגישה", intro: "יוצרים אירוע אמיתי ביומן, קישור Google Meet ייחודי והזמנה ממותגת, בתהליך אחד וברור.", back: "חזרה לניהול", switchLanguage: "English", organizer: "מארגן הפגישה",
    connectionTitle: "יומן Google האישי שלך", connected: "מחובר ומוכן", disconnected: "חיבור חד־פעמי מאפשר ליצור פגישות ישירות מהיומן האישי שלך.", connect: "חיבור יומן Google", reconnect: "חיבור היומן מחדש",
    guestSection: "פרטי האורח", meetingSection: "פרטי הפגישה", guestName: "שם האורח", guestEmail: "כתובת המייל של האורח", title: "נושא הפגישה", date: "תאריך", time: "שעה", duration: "משך הפגישה", notes: "הודעה לאורח", notesHint: "לא חובה. ההודעה תופיע בהזמנה.", minutes: "דקות",
    create: "יצירת פגישה", creating: "יוצר את האירוע ואת קישור ה־Google Meet…", privacy: "האורח יקבל הזמנה של Google Calendar. כאשר שירות המייל זמין, תישלח גם הודעת SpaPlus ממותגת.",
    successTitle: "הפגישה מוכנה", successBody: "האירוע נוסף ליומן שלך ובקשת ההזמנה לאורח נשלחה.", join: "פתיחת Google Meet", openCalendar: "פתיחה ב־Google Calendar", copyLink: "העתקת קישור Meet", copied: "הקישור הועתק", newMeeting: "קביעת פגישה נוספת",
    upcoming: "פגישות קרובות", noUpcoming: "עדיין אין פגישות קרובות.", loading: "טוען את היומן שלך…", retry: "סגירה",
    calendarNotConnected: "צריך לחבר את יומן Google לפני יצירת הפגישה.", conflict: "הזמן הזה כבר תפוס ביומן שלך. יש לבחור שעה אחרת.", reconnectRequired: "החיבור ליומן פג. יש לחבר אותו מחדש ולנסות שוב.", genericError: "לא ניתן היה ליצור את הפגישה. הפרטים נשמרו במסך ואפשר לנסות שוב.", pendingMeet: "האירוע קיים, אבל Google עדיין מכינה את קישור ה־Meet. אפשר לפתוח אותו ביומן ולנסות שוב בעוד רגע.", emailWarning: "ההזמנה ביומן נוצרה. לא ניתן היה לאמת את שליחת המייל הממותג הנוסף.",
  },
} as const;

function localDefaults() {
  const value = new Date();
  value.setSeconds(0, 0);
  value.setMinutes(value.getMinutes() <= 30 ? 30 : 60);
  if (value.getHours() < 9) value.setHours(9, 0, 0, 0);
  return {
    date: `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`,
    time: `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`,
  };
}

export default function MeetingClient({ displayName, locale }: { displayName: string; locale: string }) {
  const [activeLocale, setActiveLocale] = useState<Locale>(locale === "he" ? "he" : "en");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ meetUrl: string; calendarUrl: string; emailSent: boolean } | null>(null);
  const [upcoming, setUpcoming] = useState<Meeting[]>([]);
  const [copied, setCopied] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const defaults = useMemo(localDefaults, []);
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const t = copy[activeLocale];
  const rtl = activeLocale === "he";

  async function loadMeetings() {
    setLoading(true);
    try {
      const response = await fetch("/api/meetings", { cache: "no-store" });
      if (!response.ok) throw new Error("load_failed");
      const result = await response.json() as { connected?: boolean; upcoming?: Meeting[] };
      setConnected(result.connected === true);
      setUpcoming(result.upcoming || []);
    } catch { setError(copy[activeLocale].genericError); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadMeetings(); }, []);

  function errorMessage(code: string) {
    if (code === "calendar_not_connected") return t.calendarNotConnected;
    if (code === "time_conflict") return t.conflict;
    if (code === "calendar_reconnect_required") return t.reconnectRequired;
    if (code === "meet_link_pending") return t.pendingMeet;
    return t.genericError;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!connected) { setError(t.calendarNotConnected); return; }
    const form = new FormData(event.currentTarget);
    const start = new Date(`${form.get("date")}T${form.get("time")}:00`);
    const end = new Date(start.getTime() + Number(form.get("duration") || 30) * 60_000);
    const activeBookingId = bookingId || crypto.randomUUID();
    if (!bookingId) setBookingId(activeBookingId);
    setSubmitting(true); setError(""); setSuccess(null);
    try {
      const response = await fetch("/api/meetings", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ bookingId: activeBookingId, guestName: form.get("guestName"), guestEmail: form.get("guestEmail"), title: form.get("title"), notes: form.get("notes"), locale: activeLocale, startsAt: start.toISOString(), endsAt: end.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" }),
      });
      const result = await response.json() as { error?: string; meetUrl?: string; calendarUrl?: string; emailSent?: boolean };
      if (!response.ok || !result.meetUrl || !result.calendarUrl) {
        setError(errorMessage(result.error || ""));
        if (result.error !== "meet_link_pending") setBookingId("");
        if (result.error === "calendar_not_connected" || result.error === "calendar_reconnect_required") setConnected(false);
        return;
      }
      setSuccess({ meetUrl: result.meetUrl, calendarUrl: result.calendarUrl, emailSent: result.emailSent === true });
      setBookingId("");
      await loadMeetings();
    } catch { setError(t.genericError); }
    finally { setSubmitting(false); }
  }

  async function copyMeetLink() {
    if (!success?.meetUrl) return;
    await navigator.clipboard.writeText(success.meetUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="meeting-shell" lang={activeLocale} dir={rtl ? "rtl" : "ltr"}>
      <a className="meeting-skip" href="#meeting-form">{t.create}</a>
      <header className="meeting-header">
        <a href="/admin" className="meeting-brand" aria-label="SpaPlus Global"><img src="/spaplus-mark.png" alt="" /><img className="meeting-wordmark" src="/spaplus-wordmark.png" alt="SpaPlus Global" /></a>
        <div className="meeting-header-actions"><button className="meeting-language" type="button" onClick={() => setActiveLocale(rtl ? "en" : "he")}>{t.switchLanguage}</button><a href="/admin">{t.back}</a></div>
      </header>
      <section className="meeting-layout" aria-labelledby="meeting-title">
        <aside className="meeting-intro">
          <p className="meeting-eyebrow">SpaPlus Global</p><h1 id="meeting-title">{t.pageTitle}</h1><p>{t.intro}</p>
          <div className="meeting-host"><span aria-hidden="true">{displayName.slice(0, 1).toUpperCase()}</span><div><strong>{displayName}</strong><small>{t.organizer}</small></div></div>
          <section className={`calendar-status ${connected ? "is-connected" : ""}`} aria-live="polite"><span className="calendar-dot" aria-hidden="true" /><div><strong>{t.connectionTitle}</strong><p>{loading ? t.loading : connected ? t.connected : t.disconnected}</p></div>{!loading && !connected ? <a className="meeting-connect" href="/auth/google/calendar/authorize">{t.connect}</a> : null}</section>
          <section className="upcoming-card"><h2>{t.upcoming}</h2>{loading ? <p>{t.loading}</p> : upcoming.length ? <ul>{upcoming.slice(0, 4).map((meeting) => <li key={meeting.bookingId}><span>{new Intl.DateTimeFormat(activeLocale === "he" ? "he-IL" : "en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: meeting.timeZone }).format(new Date(meeting.startsAt))}</span><strong>{meeting.title}</strong><small>{meeting.guestName}</small></li>)}</ul> : <p>{t.noUpcoming}</p>}</section>
        </aside>
        <div className="meeting-main">
          {success ? <section className="meeting-success" aria-live="polite"><div className="success-mark" aria-hidden="true">✓</div><h2>{t.successTitle}</h2><p>{t.successBody}</p>{!success.emailSent ? <p className="meeting-warning">{t.emailWarning}</p> : null}<div className="success-actions"><a className="meeting-submit" href={success.meetUrl} target="_blank" rel="noreferrer">{t.join}</a><a className="meeting-secondary" href={success.calendarUrl} target="_blank" rel="noreferrer">{t.openCalendar}</a><button className="meeting-secondary" type="button" onClick={() => void copyMeetLink()}>{copied ? t.copied : t.copyLink}</button></div><button className="meeting-new" type="button" onClick={() => { setSuccess(null); setCopied(false); }}>{t.newMeeting}</button></section> :
          <form id="meeting-form" className="meeting-card" onSubmit={submit} aria-busy={submitting}>
            <fieldset><legend>{t.guestSection}</legend><div className="meeting-fields"><label>{t.guestName}<input name="guestName" required minLength={2} maxLength={100} autoComplete="name" /></label><label>{t.guestEmail}<input name="guestEmail" required type="email" maxLength={180} autoComplete="email" dir="ltr" /></label></div></fieldset>
            <fieldset><legend>{t.meetingSection}</legend><div className="meeting-fields"><label className="meeting-wide">{t.title}<input name="title" required minLength={3} maxLength={180} defaultValue={activeLocale === "he" ? "פגישה עם SpaPlus Global" : "Meeting with SpaPlus Global"} /></label><label>{t.date}<input name="date" required type="date" min={minDate} defaultValue={defaults.date} /></label><label>{t.time}<input name="time" required type="time" defaultValue={defaults.time} /></label><label>{t.duration}<select name="duration" defaultValue="30"><option value="30">30 {t.minutes}</option><option value="45">45 {t.minutes}</option><option value="60">60 {t.minutes}</option><option value="90">90 {t.minutes}</option></select></label><label className="meeting-wide">{t.notes}<textarea name="notes" rows={4} maxLength={3000} aria-describedby="notes-hint" /><small id="notes-hint">{t.notesHint}</small></label></div></fieldset>
            <p className="meeting-privacy">{t.privacy}</p>{error ? <div className="meeting-message" role="alert"><span>{error}</span>{!connected ? <a href="/auth/google/calendar/authorize">{t.reconnect}</a> : <button type="button" onClick={() => setError("")}>{t.retry}</button>}</div> : null}<button className="meeting-submit" type="submit" disabled={submitting || loading || !connected}>{submitting ? <><i className="meeting-spinner" aria-hidden="true" />{t.creating}</> : t.create}</button>
          </form>}
        </div>
      </section>
    </main>
  );
}
