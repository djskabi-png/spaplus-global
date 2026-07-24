import { el } from "./el";
import { en } from "./en";
import { es } from "./es";
import { frCA } from "./fr-CA";
import { he } from "./he";
import { hu } from "./hu";
import { it } from "./it";
import { pl } from "./pl";
import { ru } from "./ru";
import type { Locale, Translation } from "./types";

export const translations: Record<Locale, Translation> = {
  en,
  he,
  "fr-CA": frCA,
  ru,
  el,
  it,
  hu,
  pl,
  es,
};

export const localeOptions: Array<{ code: Locale; label: string }> = [
  { code: "en", label: "English" },
  { code: "he", label: "עברית" },
  { code: "fr-CA", label: "Français" },
  { code: "ru", label: "Русский" },
  { code: "el", label: "Ελληνικά" },
  { code: "it", label: "Italiano" },
  { code: "hu", label: "Magyar" },
  { code: "pl", label: "Polski" },
  { code: "es", label: "Español" },
];

export const isLocale = (value: string | null): value is Locale =>
  localeOptions.some(({ code }) => code === value);

export const localeFromBrowser = (languages: readonly string[]): Locale => {
  for (const language of languages) {
    const normalized = language.toLowerCase();
    if (normalized.startsWith("he")) return "he";
    if (normalized.startsWith("fr")) return "fr-CA";
    if (normalized.startsWith("ru")) return "ru";
    if (normalized.startsWith("el")) return "el";
    if (normalized.startsWith("it")) return "it";
    if (normalized.startsWith("hu")) return "hu";
    if (normalized.startsWith("pl")) return "pl";
    if (normalized.startsWith("es")) return "es";
    if (normalized.startsWith("en")) return "en";
  }
  return "en";
};

export type { Locale, Translation };
