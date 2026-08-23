import { and, asc, eq, gte } from "drizzle-orm";
import { getDb } from "../../../db";
import { meetingBookings } from "../../../db/schema";
import { getAuthorizedAdmin } from "../../admin-auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const bookingIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const timeZonePattern = /^(?:UTC|[A-Za-z_+-]+\/[A-Za-z0-9_+./-]+)$/;

const clean = (value: unknown, max: number) => String(value || "").trim().slice(0, max);
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character] || character);

type CalendarEvent = {
  id?: string;
  htmlLink?: string;
  hangoutLink?: string;
  conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> };
};

function meetingUrl(event: CalendarEvent) {
  return event.hangoutLink || event.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri || "";
}

function localizedDate(value: string, locale: "en" | "he", timeZone: string) {
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-GB", {
    dateStyle: "full", timeStyle: "short", timeZone,
  }).format(new Date(value));
}

function brandedGuestEmail(data: {
  guestName: string; organizerName: string; title: string; notes: string; locale: "en" | "he";
  startsAt: string; timeZone: string; meetUrl: string; calendarUrl: string;
}) {
  const he = data.locale === "he";
  const direction = he ? "rtl" : "ltr";
  const greeting = he ? `שלום ${data.guestName},` : `Hello ${data.guestName},`;
  const intro = he ? `${data.organizerName} הזמין אותך לפגישה.` : `${data.organizerName} invited you to a meeting.`;
  const guestNameHtml = `<bdi dir="auto" style="unicode-bidi:isolate">${escapeHtml(data.guestName)}</bdi>`;
  const organizerNameHtml = `<bdi dir="auto" style="unicode-bidi:isolate">${escapeHtml(data.organizerName)}</bdi>`;
  const greetingHtml = he ? `שלום ${guestNameHtml},` : `Hello ${guestNameHtml},`;
  const introHtml = he ? `${organizerNameHtml} הזמין אותך לפגישה.` : `${organizerNameHtml} invited you to a meeting.`;
  const join = he ? "כניסה לפגישת Google Meet" : "Join the Google Meet";
  const calendar = he ? "פתיחת האירוע ביומן" : "Open the calendar event";
  const when = localizedDate(data.startsAt, data.locale, data.timeZone);
  const isolatedTitle = `\u2068${data.title}\u2069`;
  const subjectText = he ? `הזמנה לפגישה: ${isolatedTitle}` : `Meeting invitation: ${isolatedTitle}`;
  const subject = `${he ? "\u2067" : "\u2066"}${subjectText}\u2069`;
  const note = data.notes ? `<div style="margin-top:22px;padding:16px 18px;border-radius:14px;background:#f5f7fb;color:#3f5873;line-height:1.7">${escapeHtml(data.notes).replaceAll("\n", "<br>")}</div>` : "";
  const textAlign = he ? "right" : "left";
  const logoMargin = he ? "0 0 0 auto" : "0 auto 0 0";
  const html = `<!doctype html><html lang="${data.locale}" dir="${direction}" style="direction:${direction}"><body dir="${direction}" style="margin:0;background:#f5f7fb;color:#142d4f;direction:${direction};text-align:${textAlign};font-family:${he ? "Heebo" : "Arial"},Arial,sans-serif"><table role="presentation" dir="${direction}" width="100%" cellspacing="0" cellpadding="0" style="width:100%;padding:32px 16px;direction:${direction}"><tr><td align="center" style="text-align:center"><table role="presentation" dir="${direction}" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:620px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;direction:${direction};text-align:${textAlign}"><tr><td dir="${direction}" style="padding:24px 30px;background:#142d4f;direction:${direction};text-align:${textAlign}"><img src="https://app.spaplus.co/spaplus-wordmark.png" width="116" alt="SpaPlus Global" style="display:block;margin:${logoMargin};background:#fff;border-radius:8px;padding:5px 10px"></td></tr><tr><td dir="${direction}" style="padding:34px 30px;direction:${direction};text-align:${textAlign}"><p style="margin:0 0 10px;color:#e91562;font-size:13px;font-weight:700;text-align:${textAlign}">SpaPlus Global</p><h1 dir="auto" style="margin:0 0 18px;font-size:28px;line-height:1.25;text-align:${textAlign};unicode-bidi:isolate">${escapeHtml(data.title)}</h1><p style="margin:0 0 8px;font-size:17px;line-height:1.7;text-align:${textAlign}">${greetingHtml}</p><p style="margin:0 0 24px;color:#526b84;line-height:1.7;text-align:${textAlign}">${introHtml}</p><div dir="${direction}" style="margin-bottom:24px;padding:18px;border-radius:16px;background:#fff4f8;direction:${direction};text-align:${textAlign}"><strong style="display:block;margin-bottom:5px">${escapeHtml(when)}</strong><span dir="ltr" style="display:block;color:#60778f;font-size:13px;text-align:${textAlign};unicode-bidi:isolate">${escapeHtml(data.timeZone)}</span></div><a href="${escapeHtml(data.meetUrl)}" style="display:block;padding:15px 22px;border-radius:12px;background:#e91562;color:#fff;text-align:center;text-decoration:none;font-weight:700">${join}</a><p style="margin:16px 0 0;text-align:center"><a href="${escapeHtml(data.calendarUrl)}" style="color:#294b6b;font-size:13px;font-weight:700">${calendar}</a></p>${note}</td></tr></table></td></tr></table></body></html>`;
  const text = `${greeting}\n\n${intro}\n${data.title}\n${when}\n${data.meetUrl}\n${data.calendarUrl}${data.notes ? `\n\n${data.notes}` : ""}`;
  return { subject, html, text };
}

async function sendBrandedEmail(data: Parameters<typeof brandedGuestEmail>[0], bookingId: string, guestEmail: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ids: [] as string[], sent: false };
  const email = brandedGuestEmail(data);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `spaplus-meeting-${bookingId}`,
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL?.trim() || "SpaPlus Global <hello@mail.spaplus.co>",
      to: [guestEmail],
      subject: email.subject,
      html: email.html,
      text: email.text,
      tags: [{ name: "email_type", value: "meeting_invitation" }],
    }),
  });
  const result = await response.json() as { id?: string };
  return { ids: response.ok && result.id ? [result.id] : [], sent: response.ok && Boolean(result.id) };
}

export async function GET(request: Request) {
  const admin = await getAuthorizedAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const connected = request.headers.get("x-spaplus-google-calendar-connected") === "1";
  const upcoming = await getDb().select().from(meetingBookings)
    .where(and(eq(meetingBookings.organizerEmail, admin.email), gte(meetingBookings.endsAt, new Date().toISOString())))
    .orderBy(asc(meetingBookings.startsAt)).limit(20);
  return Response.json({
    connected,
    upcoming: upcoming.map((item) => ({
      bookingId: item.bookingId, guestName: item.guestName, guestEmail: item.guestEmail,
      title: item.title, startsAt: item.startsAt, endsAt: item.endsAt, timeZone: item.timeZone,
      status: item.status, meetUrl: item.meetUrl, calendarUrl: item.calendarUrl,
    })),
  }, { headers: { "cache-control": "private, no-store" } });
}

export async function POST(request: Request) {
  const admin = await getAuthorizedAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const accessToken = request.headers.get("x-spaplus-google-calendar-token") || "";
  if (!accessToken) return Response.json({ error: "calendar_not_connected" }, { status: 428 });

  const body = await request.json() as Record<string, unknown>;
  const bookingId = clean(body.bookingId, 80);
  const guestName = clean(body.guestName, 100);
  const guestEmail = clean(body.guestEmail, 180).toLowerCase();
  const title = clean(body.title, 180);
  const notes = clean(body.notes, 3000);
  const locale = body.locale === "he" ? "he" : "en";
  const calendarSignature = locale === "he" ? "נקבע באמצעות SpaPlus Global" : "Scheduled with SpaPlus Global";
  const startsAt = clean(body.startsAt, 40);
  const endsAt = clean(body.endsAt, 40);
  const timeZone = clean(body.timeZone, 80);
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const duration = end.getTime() - start.getTime();
  if (!bookingIdPattern.test(bookingId) || guestName.length < 2 || !emailPattern.test(guestEmail) || title.length < 3 ||
      !timeZonePattern.test(timeZone) || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) ||
      start.getTime() < Date.now() - 60_000 || duration < 15 * 60_000 || duration > 180 * 60_000) {
    return Response.json({ error: "invalid_meeting" }, { status: 400 });
  }

  const db = getDb();
  const [existing] = await db.select().from(meetingBookings).where(eq(meetingBookings.bookingId, bookingId)).limit(1);
  if (existing) {
    if (existing.organizerEmail !== admin.email) return Response.json({ error: "Forbidden" }, { status: 403 });
    if (existing.status === "pending" && existing.googleEventId) {
      const refresh = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(existing.googleEventId)}?conferenceDataVersion=1`, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (refresh.ok) {
        const event = await refresh.json() as CalendarEvent;
        const meetUrl = meetingUrl(event);
        const calendarUrl = event.htmlLink || existing.calendarUrl;
        if (meetUrl && calendarUrl) {
          const email = await sendBrandedEmail({ guestName: existing.guestName, organizerName: existing.organizerName, title: existing.title, notes: existing.notes, locale: existing.locale === "he" ? "he" : "en", startsAt: existing.startsAt, timeZone: existing.timeZone, meetUrl, calendarUrl }, bookingId, existing.guestEmail).catch(() => ({ ids: [] as string[], sent: false }));
          await db.update(meetingBookings).set({ status: "confirmed", meetUrl, calendarUrl, emailDeliveryIds: JSON.stringify(email.ids), failureReason: "", updatedAt: new Date().toISOString() }).where(eq(meetingBookings.bookingId, bookingId));
          return Response.json({ success: true, status: "confirmed", meetUrl, calendarUrl, emailSent: email.sent });
        }
      }
      return Response.json({ error: "meet_link_pending", calendarUrl: existing.calendarUrl }, { status: 409 });
    }
    return Response.json({
      success: existing.status === "confirmed", status: existing.status, meetUrl: existing.meetUrl,
      calendarUrl: existing.calendarUrl, emailSent: JSON.parse(existing.emailDeliveryIds || "[]").length > 0,
      error: existing.failureReason || "meeting_create_failed",
    }, { status: existing.status === "confirmed" ? 200 : 409 });
  }

  const now = new Date().toISOString();
  await db.insert(meetingBookings).values({
    bookingId, organizerEmail: admin.email, organizerName: admin.displayName, guestName, guestEmail,
    title, notes, locale, startsAt: start.toISOString(), endsAt: end.toISOString(), timeZone,
    status: "pending", createdAt: now, updatedAt: now,
  });

  try {
    const busyResponse = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ timeMin: start.toISOString(), timeMax: end.toISOString(), timeZone, items: [{ id: "primary" }] }),
    });
    if (busyResponse.ok) {
      const busy = await busyResponse.json() as { calendars?: { primary?: { busy?: unknown[] } } };
      if ((busy.calendars?.primary?.busy?.length || 0) > 0) {
        await db.update(meetingBookings).set({ status: "failed", failureReason: "time_conflict", updatedAt: new Date().toISOString() }).where(eq(meetingBookings.bookingId, bookingId));
        return Response.json({ error: "time_conflict" }, { status: 409 });
      }
    }

    const calendarResponse = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: title,
        description: `${notes}${notes ? "\n\n" : ""}${calendarSignature}`,
        start: { dateTime: start.toISOString(), timeZone },
        end: { dateTime: end.toISOString(), timeZone },
        attendees: [{ email: guestEmail, displayName: guestName }],
        conferenceData: { createRequest: { requestId: bookingId.replaceAll("-", ""), conferenceSolutionKey: { type: "hangoutsMeet" } } },
        guestsCanInviteOthers: false,
        guestsCanModify: false,
        reminders: { useDefault: true },
      }),
    });
    if (!calendarResponse.ok) {
      const reason = `google_calendar_${calendarResponse.status}`;
      await db.update(meetingBookings).set({ status: "failed", failureReason: reason, updatedAt: new Date().toISOString() }).where(eq(meetingBookings.bookingId, bookingId));
      return Response.json({ error: calendarResponse.status === 401 || calendarResponse.status === 403 ? "calendar_reconnect_required" : "calendar_create_failed" }, { status: 502 });
    }
    let event = await calendarResponse.json() as CalendarEvent;
    for (let attempt = 0; attempt < 8 && event.id && !meetingUrl(event); attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const refresh = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(event.id)}?conferenceDataVersion=1`, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (refresh.ok) event = await refresh.json() as CalendarEvent;
    }
    const meetUrl = meetingUrl(event);
    const calendarUrl = event.htmlLink || "";
    if (!event.id || !meetUrl || !calendarUrl) {
      await db.update(meetingBookings).set({ status: event.id ? "pending" : "failed", googleEventId: event.id || "", calendarUrl, failureReason: "meet_link_pending", updatedAt: new Date().toISOString() }).where(eq(meetingBookings.bookingId, bookingId));
      return Response.json({ error: "meet_link_pending", calendarUrl }, { status: event.id ? 409 : 502 });
    }

    const email = await sendBrandedEmail({ guestName, organizerName: admin.displayName, title, notes, locale, startsAt: start.toISOString(), timeZone, meetUrl, calendarUrl }, bookingId, guestEmail).catch(() => ({ ids: [] as string[], sent: false }));
    await db.update(meetingBookings).set({
      status: "confirmed", googleEventId: event.id, meetUrl, calendarUrl,
      emailDeliveryIds: JSON.stringify(email.ids), updatedAt: new Date().toISOString(),
    }).where(eq(meetingBookings.bookingId, bookingId));
    return Response.json({ success: true, status: "confirmed", meetUrl, calendarUrl, emailSent: email.sent });
  } catch (error) {
    console.error("Meeting creation failed", error);
    await db.update(meetingBookings).set({ status: "failed", failureReason: "unexpected_failure", updatedAt: new Date().toISOString() }).where(eq(meetingBookings.bookingId, bookingId));
    return Response.json({ error: "meeting_create_failed" }, { status: 500 });
  }
}
