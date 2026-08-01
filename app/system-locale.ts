export type SystemLocale = "en" | "he" | "fr-CA";

export function normalizeSystemLocale(value: string): SystemLocale {
  const locale = value.trim().toLowerCase().replaceAll("_", "-");
  if (locale === "he" || locale.startsWith("he-")) return "he";
  if (locale === "fr" || locale.startsWith("fr-")) return "fr-CA";
  return "en";
}
