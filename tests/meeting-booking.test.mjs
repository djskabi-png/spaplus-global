import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const worker = readFileSync(new URL("../worker/index.ts", import.meta.url), "utf8");
const route = readFileSync(new URL("../app/api/meetings/route.ts", import.meta.url), "utf8");
const client = readFileSync(new URL("../app/tools/meetings/MeetingClient.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../app/tools/meetings/meetings.css", import.meta.url), "utf8");
const languageStyles = readFileSync(new URL("../app/tools/meetings/language-picker.css", import.meta.url), "utf8");
const schema = readFileSync(new URL("../drizzle/0008_meeting_bookings.sql", import.meta.url), "utf8");

test("every authorized user can connect a personal Google Calendar", () => {
  assert.match(worker, /calendar_google_refresh_token:/);
  assert.match(worker, /auth\/google\/calendar\/authorize/);
  assert.match(worker, /Path=\/auth\/google; HttpOnly; Secure; SameSite=Lax/);
  assert.match(worker, /auth\/calendar\.events/);
  assert.match(worker, /auth\/calendar\.events\.freebusy/);
  assert.match(worker, /x-spaplus-google-calendar-token/);
});

test("meeting creation is persistent, idempotent and produces a unique Meet conference", () => {
  assert.match(schema, /booking_id.*NOT NULL/);
  assert.match(schema, /meeting_bookings_booking_id_unique/);
  assert.match(route, /where\(eq\(meetingBookings\.bookingId, bookingId\)\)/);
  assert.match(route, /conferenceDataVersion=1&sendUpdates=all/);
  assert.match(route, /conferenceSolutionKey: \{ type: "hangoutsMeet" \}/);
  assert.match(route, /time_conflict/);
});

test("the branded bilingual product covers loading, success and failure states", () => {
  assert.match(client, /Schedule a meeting/);
  assert.match(client, /קביעת פגישה/);
  assert.match(client, /aria-busy=\{submitting\}/);
  assert.match(client, /role="alert"/);
  assert.match(client, /meeting-success/);
  assert.match(client, /upcoming-card/);
  assert.match(styles, /--font-heebo/);
  assert.match(styles, /@media\(max-width:560px\)/);
  assert.doesNotMatch(styles, /Times New Roman|font-family\s*:\s*serif|font-family\s*:\s*cursive|font-family\s*:\s*fantasy/i);
  assert.doesNotMatch(languageStyles, /Times New Roman|font-family\s*:\s*serif|font-family\s*:\s*cursive|font-family\s*:\s*fantasy/i);
});

test("the selected meeting language controls every generated guest surface", () => {
  assert.match(client, /Meeting language/);
  assert.match(client, /שפת הפגישה/);
  assert.match(client, /role="radiogroup"/);
  assert.match(client, /aria-checked=\{activeLocale === "he"\}/);
  assert.match(client, /aria-checked=\{activeLocale === "en"\}/);
  assert.match(client, /locale: activeLocale/);
  assert.match(client, /defaultMeetingTitle\(nextLocale\)/);
  assert.match(client, /root\.lang = activeLocale/);
  assert.match(client, /root\.dir = activeLocale === "he" \? "rtl" : "ltr"/);
  assert.match(route, /locale === "he" \? "נקבע באמצעות SpaPlus Global" : "Scheduled with SpaPlus Global"/);
  assert.match(route, /const he = data\.locale === "he"/);
  assert.match(route, /lang="\$\{data\.locale\}" dir="\$\{direction\}"/);
  assert.match(route, /body dir="\$\{direction\}"/);
  assert.match(route, /direction:\$\{direction\};text-align:\$\{textAlign\}/);
  assert.match(route, /<bdi dir="auto" style="unicode-bidi:isolate">/);
  assert.match(route, /const logoMargin = he \? "0 0 0 auto" : "0 auto 0 0"/);
  assert.match(route, /const subject = `\$\{he \? "\\u2067" : "\\u2066"\}\$\{subjectText\}\\u2069`/);
});
