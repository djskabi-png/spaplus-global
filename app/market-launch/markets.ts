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

const quebecAreas = [
  ["Montréal", "Montréal"],
  ["Quebec City", "Québec"],
  ["Laurentians", "Laurentides"],
  ["Eastern Townships", "Cantons-de-l’Est"],
  ["Outaouais", "Outaouais"],
  ["Charlevoix", "Charlevoix"],
] as const;

export const quebecCopyOverrides: Record<string, { en: string; fr: string }> = {
  heroEyebrow: { en: "SPAPLUS IS ALREADY IN QUÉBEC", fr: "SPAPLUS EST DÉJÀ AU QUÉBEC" },
  heroTitle: { en: "Bring your spa to SpaPlus Québec.", fr: "Faites découvrir votre spa avec SpaPlus Québec." },
  heroLeadOutsideOntario: {
    en: "SpaPlus is already helping guests discover spa experiences in Québec. Join the network and put your established spa in front of more people looking for a memorable spa day.",
    fr: "SpaPlus aide déjà les clients à découvrir des expériences spa au Québec. Joignez le réseau et faites connaître votre établissement à davantage de personnes à la recherche d’une journée spa mémorable.",
  },
  navAria: { en: "SpaPlus Québec partner navigation", fr: "Navigation des partenaires SpaPlus Québec" },
  marketDisplayNameOutsideOntario: { en: "More Québec spas", fr: "Encore plus de spas québécois" },
  growthCardOneBody: {
    en: "Introduce your business and let our team assess the right way to bring it into the active SpaPlus Québec network.",
    fr: "Présentez votre établissement afin que notre équipe évalue la meilleure façon de l’intégrer au réseau actif de SpaPlus Québec.",
  },
  platformPreviewTitle: { en: "Spa experiences across Québec", fr: "Des expériences spa partout au Québec" },
  platformDisclosure: {
    en: "Interface previews are illustrative. Partner listings, offers and availability are published only after verification and onboarding.",
    fr: "Les aperçus d’interface sont illustratifs. Les fiches, offres et disponibilités des partenaires sont publiées seulement après vérification et intégration.",
  },
  proofTitle: { en: "Already helping guests discover spas in Québec.", fr: "Nous aidons déjà les clients à découvrir des spas au Québec." },
  proofIntro: {
    en: "These are current experiences presented on the live SpaPlus Canada platform. Your spa could be one of the next Québec partners considered.",
    fr: "Voici des expériences actuellement présentées sur la plateforme SpaPlus Canada. Votre établissement pourrait faire partie des prochains partenaires québécois considérés.",
  },
  proofDisclosure: {
    en: "Images are sourced from current spa listings on the official SpaPlus Canada website and depict existing Québec listings, not applicants or guaranteed future partners.",
    fr: "Les images proviennent de fiches actuellement publiées sur le site officiel de SpaPlus Canada et montrent des établissements québécois existants, pas des candidats ni de futurs partenaires garantis.",
  },
  partnerFitTitle: {
    en: "Established Québec spas that care about the guest experience.",
    fr: "Des spas québécois reconnus qui accordent une vraie importance à l’expérience client.",
  },
  formEyebrow: { en: "SPAPLUS QUÉBEC PARTNER ENQUIRY", fr: "DEMANDE DE PARTENARIAT SPAPLUS QUÉBEC" },
  formCityLabelOutsideOntario: { en: "Québec city or municipality", fr: "Ville ou municipalité au Québec" },
  formSubmitButton: { en: "Introduce my spa", fr: "Présenter mon spa" },
  faqLaunchQuestion: { en: "Is SpaPlus already available in Québec?", fr: "SpaPlus est-il déjà offert au Québec?" },
  finalEyebrow: { en: "QUÉBEC. LET’S GROW TOGETHER.", fr: "QUÉBEC. GRANDISSONS ENSEMBLE." },
  finalTitle: {
    en: "Your spa could become one of the next SpaPlus Québec partners.",
    fr: "Votre spa pourrait faire partie des prochains partenaires SpaPlus au Québec.",
  },
  footerIntroOutsideOntario: {
    en: "SpaPlus is already active in Québec. This page welcomes partnership enquiries from established Québec spas interested in joining the network.",
    fr: "SpaPlus est déjà actif au Québec. Cette page accueille les demandes de partenariat d’établissements québécois reconnus qui souhaitent se joindre au réseau.",
  },
  seoTitleOutsideOntario: { en: "Join SpaPlus Québec | Spa partners", fr: "Joignez SpaPlus Québec | Partenaires spa" },
  seoDescriptionOutsideOntario: {
    en: "SpaPlus is already active in Québec. Established spas can introduce their business and explore joining the SpaPlus Canada network.",
    fr: "SpaPlus est déjà actif au Québec. Les spas reconnus peuvent présenter leur établissement et explorer un partenariat avec le réseau SpaPlus Canada.",
  },
  emailOwnerSubject: { en: "Québec spa lead: {{organization}} | SpaPlus", fr: "Nouveau prospect spa Québec : {{organization}} | SpaPlus" },
  emailOwnerEyebrow: { en: "NEW QUÉBEC SPA LEAD", fr: "NOUVEAU PROSPECT SPA QUÉBEC" },
  emailOwnerIntro: {
    en: "A Québec spa has asked to explore joining the active SpaPlus network. The full enquiry is ready for review.",
    fr: "Un spa québécois souhaite explorer son intégration au réseau actif de SpaPlus. La demande complète est prête à être examinée.",
  },
  emailOwnerReplySubject: { en: "SpaPlus Québec | Your registration", fr: "SpaPlus Québec | Votre inscription" },
  emailOwnerReplyBody: {
    en: "Hello {{name}},\n\nThank you for introducing {{organization}} to SpaPlus Québec. We have received your details and will be in touch shortly.\n\nBest regards,\nSpaPlus Québec",
    fr: "Bonjour {{name}},\n\nMerci d’avoir présenté {{organization}} à SpaPlus Québec. Nous avons reçu vos renseignements et nous communiquerons avec vous sous peu.\n\nCordialement,\nSpaPlus Québec",
  },
  emailVisitorSubject: { en: "We received your SpaPlus Québec enquiry", fr: "Nous avons reçu votre demande SpaPlus Québec" },
  emailVisitorEyebrow: { en: "SPAPLUS QUÉBEC PARTNERS", fr: "PARTENAIRES SPAPLUS QUÉBEC" },
  emailVisitorIntro: {
    en: "We received the information for {{organization}} and will review its fit for the SpaPlus Québec network.",
    fr: "Nous avons reçu les renseignements de {{organization}} et évaluerons son intégration au réseau SpaPlus Québec.",
  },
  emailVisitorButton: { en: "Return to SpaPlus Québec", fr: "Retourner à SpaPlus Québec" },
  "Better spa experiences for guests. New opportunities for Canadian spas outside Ontario.": {
    en: "Better spa experiences for guests. New opportunities for Québec spas.",
    fr: "De meilleures expériences pour les clients. De nouvelles possibilités pour les spas québécois.",
  },
  "Explore Canada": { en: "Explore Québec", fr: "Explorer le Québec" },
  "Established Canadian spas outside Ontario that care about the guest experience.": {
    en: "Established Québec spas that care about the guest experience.",
    fr: "Des spas québécois reconnus qui accordent une vraie importance à l’expérience client.",
  },
  "Where is SpaPlus available in Canada?": {
    en: "Is SpaPlus already available in Québec?",
    fr: "SpaPlus est-il déjà offert au Québec?",
  },
  "This page is for every Canadian province and territory outside Ontario. Ontario has its own dedicated partner page and campaign.": {
    en: "SpaPlus is active across Québec. Select your region and introduce your spa to our partner team.",
    fr: "SpaPlus est actif partout au Québec. Choisissez votre région et présentez votre établissement à notre équipe des partenariats.",
  },
  "SpaPlus Canada already presents spa experiences in Québec. This page receives partner enquiries from the rest of Canada outside Ontario, which has its own dedicated page.": {
    en: "Yes. SpaPlus Canada already presents spa experiences in Québec. This page is for established Québec spas that would like to explore joining the network.",
    fr: "Oui. SpaPlus Canada présente déjà des expériences spa au Québec. Cette page s’adresse aux établissements québécois reconnus qui souhaitent explorer leur intégration au réseau.",
  },
  "Join SpaPlus across Canada outside Ontario": {
    en: "Partner opportunities across Canada",
    fr: "Possibilités de partenariat partout au Canada",
  },
  formRegionLabel: { en: "Québec region", fr: "Région du Québec" },
  formRegionPlaceholder: { en: "Select a Québec region", fr: "Choisir une région du Québec" },
  "Ontario is not included here. Use the dedicated Ontario page.": {
    en: "Choose the Québec region closest to your spa.",
    fr: "Choisissez la région du Québec la plus près de votre spa.",
  },
  "Review before launch": { en: "Review before going live", fr: "Révision avant la mise en ligne" },
  "If there is a strong fit, you can review the written launch offer before choosing whether to move ahead.": {
    en: "If there is a strong fit, you can review the written commercial terms before choosing whether to move ahead.",
    fr: "Si le partenariat est solide, vous pourrez examiner les conditions commerciales écrites avant de décider d’aller de l’avant.",
  },
  "No. The form only tells us you are interested in learning more. You can review the launch offer before making any decision.": {
    en: "No. The form only tells us you are interested in learning more. You can review the proposed partnership terms before making any decision.",
    fr: "Non. Le formulaire indique seulement que vous souhaitez en savoir plus. Vous pourrez examiner les conditions de partenariat proposées avant de prendre une décision.",
  },
  "If the fit is right, we will explain the launch offer and next steps. You decide whether to continue.": {
    en: "If the fit is right, we will explain the partnership terms and next steps. You decide whether to continue.",
    fr: "Si le partenariat semble prometteur, nous vous présenterons les conditions proposées et la suite. La décision vous appartient.",
  },
  "Early registration is free. If there is a strong fit, the full launch offer and commercial terms are reviewed with you in writing before any commitment.": {
    en: "Introducing your spa is free. If there is a strong fit, the complete commercial terms are reviewed with you in writing before any commitment.",
    fr: "La présentation de votre spa est gratuite. Si le partenariat est solide, les conditions commerciales complètes vous sont présentées par écrit avant tout engagement.",
  },
  "We explain the launch plan, answer questions and learn more.": {
    en: "We explain the partnership model, answer questions and learn more about your spa.",
    fr: "Nous expliquons le modèle de partenariat, répondons à vos questions et apprenons à mieux connaître votre spa.",
  },
  "Founding partner terms are not guaranteed. Any commercial offer will be shared separately in writing after a fit review.": {
    en: "Partner acceptance is not guaranteed. Any commercial offer will be shared separately in writing after a fit review.",
    fr: "L’acceptation comme partenaire n’est pas garantie. Toute offre commerciale sera transmise séparément par écrit après l’évaluation du partenariat.",
  },
};

const baseQuebecConfig = {
  marketName: "Québec",
  marketSlug: "quebec",
  countryName: "Canada",
  primaryCity: "Montréal",
  pageMode: "network" as const,
  showVideo: false,
  cmsSection: "market.ca-qc",
  resourceKey: "market:ca:qc",
  heroImage: "/ontario/hero-ontario-campaign-v2.jpg",
  leadEndpoint: "/api/market-spa-leads",
  reviewWindowHours: 72,
  referenceMarketName: "Québec",
  referenceCountryName: "Canada",
  referenceSpas,
  copyOverrides: quebecCopyOverrides,
};

export const quebecMarket: MarketLaunchConfig = {
  ...baseQuebecConfig,
  locale: "en-ca",
  languageTag: "en-CA",
  timeZone: "America/Montreal",
  pageUrl: "https://app.spaplus.co/en-ca/quebec/",
  homeHref: "https://spaplus.co/en/",
  heroDisclosure: "Illustrative SpaPlus campaign concept. It does not depict a specific applicant or partner spa.",
  priorityAreas: quebecAreas.map(([label]) => ({ label, href: "#join" })),
  regionOptions: quebecAreas.map(([english]) => ({
    value: english.toLowerCase().replaceAll(" ", "-"),
    label: english,
  })),
  languageLinks: [
    { label: "EN CA", ariaLabel: "English, Canada", languageTag: "en-CA", href: "/en-ca/quebec/", active: true },
    { label: "FR CA", ariaLabel: "Français canadien", languageTag: "fr-CA", href: "/fr-ca/quebec/", active: false },
  ],
  marketLinks: [
    { label: "Canada", href: "/en-ca/canada/", active: false },
    { label: "Quebec", href: "/en-ca/quebec/", active: true },
    { label: "Ontario", href: "/en-ca/ontario/", active: false },
  ],
};

export const quebecFrenchMarket: MarketLaunchConfig = {
  ...baseQuebecConfig,
  locale: "fr-ca",
  languageTag: "fr-CA",
  timeZone: "America/Montreal",
  pageUrl: "https://app.spaplus.co/fr-ca/quebec/",
  homeHref: "https://spaplus.co/fr-ca/",
  heroDisclosure: "Concept visuel de SpaPlus. Il ne représente pas un établissement candidat ni un partenaire précis.",
  referenceSpas: frenchReferenceSpas,
  priorityAreas: quebecAreas.map(([, label]) => ({ label, href: "#join" })),
  regionOptions: quebecAreas.map(([english, french]) => ({
    value: english.toLowerCase().replaceAll(" ", "-"),
    label: french,
  })),
  languageLinks: [
    { label: "EN CA", ariaLabel: "English, Canada", languageTag: "en-CA", href: "/en-ca/quebec/", active: false },
    { label: "FR CA", ariaLabel: "Français canadien", languageTag: "fr-CA", href: "/fr-ca/quebec/", active: true },
  ],
  marketLinks: [
    { label: "Canada", href: "/fr-ca/canada/", active: false },
    { label: "Québec", href: "/fr-ca/quebec/", active: true },
    { label: "Ontario", href: "/fr-ca/ontario/", active: false },
  ],
};

const baseOntarioConfig = {
  marketName: "Ontario",
  marketSlug: "ontario",
  countryName: "Canada",
  primaryCity: "Toronto",
  heroImage: "/ontario/hero-ontario-campaign-v2.jpg",
  leadEndpoint: "/api/market-spa-leads",
  reviewWindowHours: 72,
  cmsSection: "market.ca-on",
  resourceKey: "market:ca:on",
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
  pageUrl: "https://app.spaplus.co/en-ca/ontario/",
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
  marketLinks: [
    { label: "Rest of Canada", href: "/en-ca/canada/", active: false },
    { label: "Ontario", href: "/en-ca/ontario/", active: true },
  ],
};

export const ontarioFrenchMarket: MarketLaunchConfig = {
  ...baseOntarioConfig,
  locale: "fr-ca",
  languageTag: "fr-CA",
  timeZone: "America/Toronto",
  pageUrl: "https://app.spaplus.co/fr-ca/ontario/",
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
  marketLinks: [
    { label: "Reste du Canada", href: "/fr-ca/canada/", active: false },
    { label: "Ontario", href: "/fr-ca/ontario/", active: true },
  ],
};

const canadaRegions = [
  ["Québec", "Québec"],
  ["British Columbia", "Colombie-Britannique"],
  ["Alberta", "Alberta"],
  ["Manitoba", "Manitoba"],
  ["Saskatchewan", "Saskatchewan"],
  ["New Brunswick", "Nouveau-Brunswick"],
  ["Nova Scotia", "Nouvelle-Écosse"],
  ["Prince Edward Island", "Île-du-Prince-Édouard"],
  ["Newfoundland and Labrador", "Terre-Neuve-et-Labrador"],
  ["Yukon", "Yukon"],
  ["Northwest Territories", "Territoires du Nord-Ouest"],
  ["Nunavut", "Nunavut"],
] as const;

const canadaRegionOptions = canadaRegions.map(([english, french]) => ({
  value: english.toLowerCase().replaceAll(" ", "-"),
  english,
  french,
}));

const baseCanadaConfig = {
  marketName: "Canada",
  marketSlug: "canada",
  countryName: "Canada",
  primaryCity: "Canada",
  pageMode: "network" as const,
  cmsSection: "market.ca",
  resourceKey: "market:ca:national",
  heroImage: "/ontario/hero-ontario-campaign-v2.jpg",
  leadEndpoint: "/api/market-spa-leads",
  reviewWindowHours: 72,
  referenceMarketName: "Québec",
  referenceCountryName: "Canada",
  referenceSpas,
};

export const canadaMarket: MarketLaunchConfig = {
  ...baseCanadaConfig,
  locale: "en-ca",
  languageTag: "en-CA",
  timeZone: "America/Toronto",
  pageUrl: "https://app.spaplus.co/en-ca/canada/",
  homeHref: "https://spaplus.co/en/",
  heroDisclosure: "Illustrative SpaPlus Canada concept. It does not depict a specific partner spa.",
  priorityAreas: canadaRegions.map(([label]) => ({
    label,
    href: `/en-ca/canada/?utm_content=${encodeURIComponent(label.toLowerCase().replaceAll(" ", "-"))}#join`,
  })),
  regionOptions: canadaRegionOptions.map((region) => ({
    value: region.value,
    label: region.english,
  })),
  languageLinks: [
    { label: "EN CA", ariaLabel: "English, Canada", languageTag: "en-CA", href: "/en-ca/canada/", active: true },
    { label: "FR CA", ariaLabel: "Français canadien", languageTag: "fr-CA", href: "/fr-ca/canada/", active: false },
  ],
  marketLinks: [
    { label: "Rest of Canada", href: "/en-ca/canada/", active: true },
    { label: "Ontario", href: "/en-ca/ontario/", active: false },
  ],
};

export const canadaFrenchMarket: MarketLaunchConfig = {
  ...baseCanadaConfig,
  locale: "fr-ca",
  languageTag: "fr-CA",
  timeZone: "America/Toronto",
  pageUrl: "https://app.spaplus.co/fr-ca/canada/",
  homeHref: "https://spaplus.co/fr-ca/",
  heroDisclosure: "Concept visuel de SpaPlus Canada. Il ne représente pas un spa partenaire précis.",
  referenceSpas: frenchReferenceSpas,
  priorityAreas: canadaRegions.map(([english, french]) => ({
    label: french,
    href: `/fr-ca/canada/?utm_content=${encodeURIComponent(english.toLowerCase().replaceAll(" ", "-"))}#join`,
  })),
  regionOptions: canadaRegionOptions.map((region) => ({
    value: region.value,
    label: region.french,
  })),
  languageLinks: [
    { label: "EN CA", ariaLabel: "English, Canada", languageTag: "en-CA", href: "/en-ca/canada/", active: false },
    { label: "FR CA", ariaLabel: "Français canadien", languageTag: "fr-CA", href: "/fr-ca/canada/", active: true },
  ],
  marketLinks: [
    { label: "Reste du Canada", href: "/fr-ca/canada/", active: true },
    { label: "Ontario", href: "/fr-ca/ontario/", active: false },
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
    pageUrl: `https://app.spaplus.co/${isFrench ? "fr-ca" : "en-ca"}/ontario/${area.slug}/`,
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
  canada: {
    ...canadaMarket,
    priorityAreas: canadaMarket.priorityAreas,
  },
  quebec: {
    ...quebecMarket,
    priorityAreas: quebecMarket.priorityAreas,
  },
} satisfies Record<string, MarketLaunchConfig>;
