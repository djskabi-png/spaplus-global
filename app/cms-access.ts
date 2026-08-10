import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { cmsPermissions } from "../db/schema";

export const cmsResources = [
  {
    key: "site:global",
    type: "site",
    business: "spaplus-global",
    topic: "website",
    labels: { en: "SpaPlus Global website", he: "האתר העולמי של ספא פלוס", "fr-CA": "Site mondial SpaPlus" },
  },
  {
    key: "market:ca:on",
    type: "market",
    business: "spaplus-global",
    topic: "ontario",
    labels: { en: "Ontario launch", he: "השקת אונטריו", "fr-CA": "Lancement en Ontario" },
  },
  {
    key: "market:ca:qc",
    type: "market",
    business: "spaplus-global",
    topic: "quebec",
    labels: { en: "Québec partners", he: "שותפי קוויבק", "fr-CA": "Partenaires Québec" },
  },
  {
    key: "market:ca:national",
    type: "market",
    business: "spaplus-global",
    topic: "canada",
    labels: { en: "Canada partner page", he: "עמוד השותפים של קנדה", "fr-CA": "Page partenaires Canada" },
  },
  {
    key: "ops:global",
    type: "operations",
    business: "spaplus-global",
    topic: "global",
    labels: { en: "Global spa operations", he: "ניהול בתי ספא עולמי", "fr-CA": "Opérations mondiales des spas" },
  },
  {
    key: "ops:ca",
    type: "operations",
    business: "spaplus-global",
    topic: "canada",
    labels: { en: "Canada spa operations", he: "ניהול בתי ספא בקנדה", "fr-CA": "Opérations des spas au Canada" },
  },
  {
    key: "ops:ca:on",
    type: "operations",
    business: "spaplus-global",
    topic: "ontario",
    labels: { en: "Ontario spa operations", he: "ניהול בתי ספא באונטריו", "fr-CA": "Opérations des spas en Ontario" },
  },
  {
    key: "ops:il",
    type: "operations",
    business: "spaplus-global",
    topic: "israel",
    labels: { en: "Israel spa operations", he: "ניהול בתי ספא בישראל", "fr-CA": "Opérations des spas en Israël" },
  },
  {
    key: "business:vila4u:leads",
    type: "business",
    business: "vila4u",
    topic: "leads",
    labels: { en: "Leads dashboard", he: "דשבורד לידים", "fr-CA": "Tableau de bord des prospects" },
  },
  {
    key: "business:vila4u:campaigns",
    type: "business",
    business: "vila4u",
    topic: "campaigns",
    labels: { en: "Campaigns and email", he: "קמפיינים ומיילים", "fr-CA": "Campagnes et courriels" },
  },
  {
    key: "business:vila4u:users",
    type: "business",
    business: "vila4u",
    topic: "users",
    labels: { en: "Users and permissions", he: "משתמשים והרשאות", "fr-CA": "Utilisateurs et autorisations" },
  },
] as const;

export const cmsContentResources = cmsResources.filter(
  (resource) => resource.type === "site" || resource.type === "market",
);

export const cmsOperationsResources = cmsResources.filter(
  (resource) => resource.type === "operations",
);

export type CmsResourceKey = (typeof cmsResources)[number]["key"];
export type CmsCapability =
  | "viewContent"
  | "editContent"
  | "viewLeads"
  | "manageLeads";

export type CmsPermissionRecord = {
  resourceKey: string;
  canViewContent: boolean;
  canEditContent: boolean;
  canViewLeads: boolean;
  canManageLeads: boolean;
};

export async function getUserPermissions(userId: number) {
  return getDb()
    .select()
    .from(cmsPermissions)
    .where(eq(cmsPermissions.userId, userId));
}

export function hasPermission(
  role: "owner" | "editor" | "viewer",
  permissions: CmsPermissionRecord[],
  resourceKey: string,
  capability: CmsCapability,
) {
  if (role === "owner") return true;

  const explicit = permissions.find(
    (permission) => permission.resourceKey === resourceKey,
  );
  if (explicit) {
    if (capability === "viewContent") {
      return explicit.canViewContent || explicit.canEditContent;
    }
    if (capability === "editContent") return explicit.canEditContent;
    if (capability === "viewLeads") {
      return explicit.canViewLeads || explicit.canManageLeads;
    }
    return explicit.canManageLeads;
  }

  return false;
}

export function validResourceKey(value: string) {
  return cmsResources.some((resource) => resource.key === value);
}

export function sectionResource(section: string) {
  if (section.startsWith("market.ca-on")) return "market:ca:on";
  if (section.startsWith("market.ca-qc")) return "market:ca:qc";
  if (section.startsWith("market.ca")) return "market:ca:national";
  return "site:global";
}
