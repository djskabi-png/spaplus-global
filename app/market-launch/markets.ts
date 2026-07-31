import type { MarketLaunchConfig } from "./MarketLaunchPage";

export const markets = {
  ontario: {
  marketName: "Ontario",
  marketSlug: "ontario",
  countryName: "Canada",
  primaryCity: "Toronto",
  locale: "en-ca",
  languageTag: "en-CA",
  timeZone: "America/Toronto",
  pageUrl: "https://spaplus.co/en-ca/ontario/",
  homeHref: "/en/",
  heroImage: "/ontario/hero-ontario-concept.jpg",
  heroDisclosure:
    "Illustrative launch concept. It does not depict an Ontario spa or partner.",
  leadEndpoint: "/api/market-spa-leads",
  reviewWindowHours: 72,
  referenceMarketName: "Québec",
  referenceCountryName: "Canada",
  referenceSpas: [
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
  ],
  priorityAreas: [
    "Toronto",
    "Greater Toronto Area",
    "Niagara",
    "Ottawa",
    "Muskoka",
    "Hamilton",
  ],
  },
} satisfies Record<
  string,
  MarketLaunchConfig & {
    timeZone: string;
    pageUrl: string;
  }
>;

export const ontarioMarket = markets.ontario;
