"use client";

export type AnalyticsSite = "global" | "ontario";

type AnalyticsValue = string | number | boolean;
type AnalyticsParams = Record<string, AnalyticsValue | undefined>;

const analyticsConfig: Record<
  AnalyticsSite,
  {
    containerId: string;
    storageKey: string;
    grantedValue: string;
  }
> = {
  global: {
    containerId: "GTM-TRNPLFMK",
    storageKey: "spaplus-cookie-consent-v1",
    grantedValue: "all",
  },
  ontario: {
    containerId: "GTM-KKN2S8SP",
    storageKey: "spaplus-consent",
    grantedValue: "analytics",
  },
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function isPublicSite(site: AnalyticsSite) {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();

  if (site === "global") {
    return hostname === "spaplus.co" || hostname === "www.spaplus.co";
  }

  return (
    hostname === "app.spaplus.co" &&
    /^\/(en-ca|fr-ca)\/ontario(?:\/|$)/.test(pathname)
  );
}

function dataLayer() {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

function gtag(...args: unknown[]) {
  dataLayer().push(args);
}

function consentState(granted: boolean) {
  return {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: granted ? "granted" : "denied",
    functionality_storage: "granted",
    security_storage: "granted",
  };
}

function hasConsent(site: AnalyticsSite) {
  const config = analyticsConfig[site];
  return window.localStorage.getItem(config.storageKey) === config.grantedValue;
}

function loadContainer(site: AnalyticsSite) {
  if (!isPublicSite(site) || !hasConsent(site)) return;
  const { containerId } = analyticsConfig[site];
  const scriptId = `spaplus-gtm-${site}`;
  if (document.getElementById(scriptId)) return;

  gtag("consent", "update", consentState(true));
  dataLayer().push({
    event: "spaplus_analytics_ready",
    analytics_site: site,
  });

  const script = document.createElement("script");
  script.id = scriptId;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
  document.head.appendChild(script);
}

export function initializeSpaPlusAnalytics(site: AnalyticsSite) {
  if (typeof window === "undefined" || !isPublicSite(site)) return () => undefined;

  window.gtag = window.gtag || gtag;
  gtag("consent", "default", consentState(false));
  loadContainer(site);

  const eventName = site === "global" ? "spaplus:consent-changed" : "spaplus:consent";
  const onConsent = () => loadContainer(site);
  window.addEventListener(eventName, onConsent);
  return () => window.removeEventListener(eventName, onConsent);
}

export function setSpaPlusAnalyticsConsent(site: AnalyticsSite, granted: boolean) {
  if (typeof window === "undefined" || !isPublicSite(site)) return;
  window.gtag = window.gtag || gtag;
  gtag("consent", "update", consentState(granted));
  if (granted) loadContainer(site);
}

export function trackAnalyticsEvent(
  site: AnalyticsSite,
  eventName: string,
  params: AnalyticsParams = {},
) {
  if (
    typeof window === "undefined" ||
    !isPublicSite(site) ||
    !hasConsent(site) ||
    !/^[a-z][a-z0-9_]{1,39}$/.test(eventName)
  ) {
    return;
  }

  const safeParams = Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .slice(0, 20)
      .map(([key, value]) => [key.slice(0, 40), value]),
  );

  window.gtag = window.gtag || gtag;
  window.gtag("event", eventName, {
    analytics_site: site,
    page_language: document.documentElement.lang || "",
    page_path: window.location.pathname,
    ...safeParams,
  });
}
