import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "../db";
import { cmsUsers } from "../db/schema";
import { getUserPermissions, type CmsPermissionRecord } from "./cms-access";
import {
  getAuthenticatedUser,
  type AuthenticatedUser,
} from "./platform-auth";

export type AdminRole = "owner" | "editor" | "viewer";

export type AuthorizedAdmin = AuthenticatedUser & {
  id: number;
  role: AdminRole;
  defaultLocale: string;
  systemLocale: string;
  canReportBugs: boolean;
  permissions: CmsPermissionRecord[];
};

export function configuredOwners() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAuthorizedAdmin(): Promise<AuthorizedAdmin | null> {
  const identity = await getAuthenticatedUser();
  if (!identity) return null;

  const email = identity.email.trim().toLowerCase();
  if (configuredOwners().includes(email)) {
    const owner = await ensureOwner(identity);
    return {
      ...identity,
      email,
      id: owner.id,
      role: "owner",
      defaultLocale: owner.defaultLocale,
      systemLocale: owner.systemLocale,
      canReportBugs: true,
      permissions: [],
    };
  }

  const db = getDb();
  const [record] = await db
    .select()
    .from(cmsUsers)
    .where(and(eq(cmsUsers.email, email), eq(cmsUsers.status, "active")))
    .limit(1);

  if (!record) return null;

  await db
    .update(cmsUsers)
    .set({ lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(eq(cmsUsers.id, record.id));

  const permissions = await getUserPermissions(record.id);
  return {
    ...identity,
    email,
    id: record.id,
    role: record.role,
    defaultLocale: record.defaultLocale,
    systemLocale: record.systemLocale,
    canReportBugs: record.canReportBugs,
    permissions,
  };
}

export async function requireAuthorizedAdmin(returnTo: string) {
  const identity = await getAuthenticatedUser();
  if (!identity) {
    redirect(`/auth/google/start?return_to=${encodeURIComponent(returnTo)}`);
  }

  const admin = await getAuthorizedAdmin();
  if (!admin) redirect("/access-denied");
  return admin;
}

async function ensureOwner(identity: AuthenticatedUser) {
  const db = getDb();
  const email = identity.email.trim().toLowerCase();
  const now = new Date().toISOString();
  await db
    .insert(cmsUsers)
    .values({
      email,
      displayName: identity.fullName || identity.displayName || "",
      role: "owner",
      status: "active",
      defaultLocale: "he",
      systemLocale: "he",
      canReportBugs: true,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: cmsUsers.email,
      set: {
        displayName: identity.fullName || identity.displayName || "",
        role: "owner",
        status: "active",
        canReportBugs: true,
        lastLoginAt: now,
        updatedAt: now,
      },
    });
  const [owner] = await db
    .select()
    .from(cmsUsers)
    .where(eq(cmsUsers.email, email))
    .limit(1);
  return owner;
}
