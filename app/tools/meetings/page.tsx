import { requireAuthorizedAdmin } from "../../admin-auth";
import { normalizeSystemLocale } from "../../system-locale";
import MeetingClient from "./MeetingClient";
import "./meetings.css";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const user = await requireAuthorizedAdmin("/tools/meetings");
  const locale = normalizeSystemLocale(user.systemLocale);

  return <MeetingClient displayName={user.displayName} locale={locale} />;
}
