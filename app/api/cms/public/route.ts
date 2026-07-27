import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { cmsContent } from "../../../../db/schema";

const supportedLocales = new Set([
  "en",
  "he",
  "fr-CA",
  "fr",
  "de",
  "nl",
  "sv",
  "nb",
  "ru",
  "el",
  "it",
  "hu",
  "pl",
  "es",
]);

export async function GET(request: Request) {
  const localeValue = new URL(request.url).searchParams.get("locale") || "en";
  const locale = supportedLocales.has(localeValue) ? localeValue : "en";
  const rows = await getDb()
    .select()
    .from(cmsContent)
    .where(and(eq(cmsContent.locale, locale)));

  const content: Record<string, Record<string, string>> = {};
  for (const row of rows) {
    content[row.section] ||= {};
    content[row.section][row.field] = row.value;
  }

  return Response.json(
    { locale, content },
    { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" } },
  );
}
