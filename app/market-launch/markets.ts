import type { MarketLaunchConfig } from "./MarketLaunchPage";

export type OntarioArea = {
  slug: string;
  name: string;
  frenchName: string;
  lead: string;
  frenchLead: string;
  focus: string[];
  frenchFocus: string[];
};

export const ontarioAreas: OntarioArea[] = [
  {
    slug: "toronto",
    name: "Toronto",
    frenchName: "Toronto",
    lead:
      "A high-intent urban market for hotel spas, destination day spas and premium wellness experiences.",
    frenchLead:
      "Un marché urbain à forte intention pour les spas d’hôtel, les spas de destination et les expériences mieux-être haut de gamme.",
    focus: ["Downtown", "Yorkville", "Midtown", "West Toronto"],
    frenchFocus: ["Centre-ville", "Yorkville", "Midtown", "Ouest de Toronto"],
  },
  {
    slug: "greater-toronto-area",
    name: "Greater Toronto Area",
    frenchName: "Grand Toronto",
    lead:
      "A broad growth market connecting established spas with guests across the communities surrounding Toronto.",
    frenchLead:
      "Un vaste marché de croissance qui relie les spas établis aux clients des collectivités qui entourent Toronto.",
    focus: ["Mississauga", "Vaughan", "Markham", "Richmond Hill"],
    frenchFocus: ["Mississauga", "Vaughan", "Markham", "Richmond Hill"],
  },
  {
    slug: "niagara",
    name: "Niagara",
    frenchName: "Niagara",
    lead:
      "A natural destination for couples, celebrations, wine-country escapes and memorable full-day spa experiences.",
    frenchLead:
      "Une destination naturelle pour les couples, les célébrations, les escapades au cœur des vignobles et les journées spa mémorables.",
    focus: ["Niagara Falls", "Niagara-on-the-Lake", "St. Catharines", "Welland"],
    frenchFocus: ["Niagara Falls", "Niagara-on-the-Lake", "St. Catharines", "Welland"],
  },
  {
    slug: "ottawa",
    name: "Ottawa",
    frenchName: "Ottawa",
    lead:
      "A bilingual capital market for local spa days, hotel wellness and restorative urban escapes.",
    frenchLead:
      "Un marché bilingue dans la capitale pour les journées spa, le mieux-être hôtelier et les escapades urbaines qui font du bien.",
    focus: ["Downtown Ottawa", "Westboro", "Kanata", "Orléans"],
    frenchFocus: ["Centre-ville d’Ottawa", "Westboro", "Kanata", "Orléans"],
  },
  {
    slug: "muskoka",
    name: "Muskoka",
    frenchName: "Muskoka",
    lead:
      "A resort-led destination where spa stays, nature, day passes and special occasions belong together.",
    frenchLead:
      "Une destination portée par les centres de villégiature, où séjours spa, nature, accès à la journée et occasions spéciales vont de pair.",
    focus: ["Huntsville", "Bracebridge", "Gravenhurst", "Lake of Bays"],
    frenchFocus: ["Huntsville", "Bracebridge", "Gravenhurst", "Lake of Bays"],
  },
  {
    slug: "hamilton",
    name: "Hamilton",
    frenchName: "Hamilton",
    lead:
      "A fast-growing regional market for accessible spa days, couples experiences and wellness close to home.",
    frenchLead:
      "Un marché régional en pleine croissance pour les journées spa accessibles, les expériences en couple et le mieux-être près de chez soi.",
    focus: ["Central Hamilton", "Ancaster", "Dundas", "Stoney Creek"],
    frenchFocus: ["Centre de Hamilton", "Ancaster", "Dundas", "Stoney Creek"],
  },
];

const referenceSpas = [
  {
    name: "BALNEA Spa",
    location: "Bromont, Québec",
    image: "/ontario/quebec-balnea.jpg",
    imageAlt:
      "Balnea Spa in Bromont, currently presented on SpaPlus Canada",
  },
  {
    name: "Infinima Spa",
    location: "Québec City, Québec",
    image: "/ontario/quebec-infinima.jpg",
    imageAlt:
      "Infinima Spa in Québec City, currently presented on SpaPlus Canada",
  },
  {
    name: "Deauville Salon & Spa",
    location: "Montréal, Québec",
    image: "/ontario/quebec-deauville.jpg",
    imageAlt:
      "Deauville Salon and Spa in Montréal, currently presented on SpaPlus Canada",
  },
];

const frenchReferenceSpas = referenceSpas.map((spa) => {
  if (spa.name === "BALNEA Spa") {
    return {
      ...spa,
      imageAlt:
        "Le BALNEA Spa à Bromont, actuellement présenté sur SpaPlus Canada",
    };
  }
  if (spa.name === "Infinima Spa") {
    return {
      ...spa,
      location: "Québec, Québec",
      imageAlt:
        "Infinima Spa à Québec, actuellement présenté sur SpaPlus Canada",
    };
  }
  return {
    ...spa,
    imageAlt:
      "Le Deauville Salon & Spa à Montréal, actuellement présenté sur SpaPlus Canada",
  };
});

const baseOntarioConfig = {
  marketName: "Ontario",
  marketSlug: "ontario",
  countryName: "Canada",
  primaryCity: "Toronto",
  heroImage: "/ontario/hero-ontario-campaign-v2.jpg",
  leadEndpoint: "/api/market-spa-leads",
  reviewWindowHours: 72,
  referenceMarketName: "Québec",
  referenceCountryName: "Canada",
  referenceSpas,
  priorityAreas: ontarioAreas.map((area) => ({
    label: area.name,
    href: `/en-ca/ontario/${area.slug}/`,
  })),
};

export const ontarioMarket: MarketLaunchConfig = {
  ...baseOntarioConfig,
  locale: "en-ca",
  languageTag: "en-CA",
  timeZone: "America/Toronto",
  pageUrl: "https://spaplus.co/en-ca/ontario/",
  homeHref: "https://spaplus.co/en/",
  heroDisclosure:
    "Illustrative launch concept. It does not depict an Ontario spa or partner.",
  languageLinks: [
    {
      label: "EN CA",
      ariaLabel: "English, Canada",
      languageTag: "en-CA",
      href: "/en-ca/ontario/",
      active: true,
    },
    {
      label: "FR CA",
      ariaLabel: "Français canadien",
      languageTag: "fr-CA",
      href: "/fr-ca/ontario/",
      active: false,
    },
  ],
};

export const ontarioFrenchMarket: MarketLaunchConfig = {
  ...baseOntarioConfig,
  locale: "fr-ca",
  languageTag: "fr-CA",
  timeZone: "America/Toronto",
  pageUrl: "https://spaplus.co/fr-ca/ontario/",
  homeHref: "https://spaplus.co/fr-ca/",
  heroDisclosure:
    "Concept visuel de lancement. Il ne représente pas un spa ou un partenaire de l’Ontario.",
  referenceSpas: frenchReferenceSpas,
  priorityAreas: ontarioAreas.map((area) => ({
    label: area.frenchName,
    href: `/fr-ca/ontario/${area.slug}/`,
  })),
  languageLinks: [
    {
      label: "EN CA",
      ariaLabel: "English, Canada",
      languageTag: "en-CA",
      href: "/en-ca/ontario/",
      active: false,
    },
    {
      label: "FR CA",
      ariaLabel: "Français canadien",
      languageTag: "fr-CA",
      href: "/fr-ca/ontario/",
      active: true,
    },
  ],
};

export function getOntarioArea(slug: string) {
  return ontarioAreas.find((area) => area.slug === slug);
}

export function buildOntarioAreaConfig(
  area: OntarioArea,
  language: "en" | "fr",
): MarketLaunchConfig {
  const isFrench = language === "fr";
  const base = isFrench ? ontarioFrenchMarket : ontarioMarket;
  return {
    ...base,
    primaryCity: isFrench ? area.frenchName : area.name,
    selectedArea: {
      slug: area.slug,
      name: isFrench ? area.frenchName : area.name,
      lead: isFrench ? area.frenchLead : area.lead,
      focus: isFrench ? area.frenchFocus : area.focus,
    },
    pageUrl: `https://spaplus.co/${isFrench ? "fr-ca" : "en-ca"}/ontario/${area.slug}/`,
    languageLinks: [
      {
        label: "EN CA",
        ariaLabel: "English, Canada",
        languageTag: "en-CA",
        href: `/en-ca/ontario/${area.slug}/`,
        active: !isFrench,
      },
      {
        label: "FR CA",
        ariaLabel: "Français canadien",
        languageTag: "fr-CA",
        href: `/fr-ca/ontario/${area.slug}/`,
        active: isFrench,
      },
    ],
  };
}

export const markets = {
  ontario: {
    ...ontarioMarket,
    priorityAreas: ontarioMarket.priorityAreas,
  },
} satisfies Record<string, MarketLaunchConfig>;
