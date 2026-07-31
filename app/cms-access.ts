import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { cmsPermissions } from "../db/schema";

export const cmsResources = [
  {
    key: "site:global",
    type: "site",
    labels: { en: "SpaPlus Global website", he: "האתר העולמי של ספא פלוס", "fr-CA": "Site mondial SpaPlus" },
  },
  {
    key: "market:ca:on",
    type: "market",
    labels: { en: "Ontario launch", he: "השקת אונטריו", "fr-CA": "Lancement en Ontario" },
  },
] as const;

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
  return section.startsWith("market.ca-on") ? "market:ca:on" : "site:global";
}
