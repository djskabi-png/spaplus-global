import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import {
  cmsAuditLog,
  cmsPermissions,
  cmsUsers,
} from "../../../../db/schema";
import { getAuthorizedAdmin } from "../../../admin-auth";
import {
  cmsResources,
  getUserPermissions,
  validResourceKey,
} from "../../../cms-access";

const roles = new Set(["owner", "editor", "viewer"]);
const contentLocales = new Set([
  "en", "he", "fr-CA", "ru", "el", "it", "hu", "pl", "es",
]);
const systemLocales = new Set(["en", "he", "fr-CA"]);

type PermissionInput = {
  resourceKey?: string;
  canViewContent?: boolean;
  canEditContent?: boolean;
  canViewLeads?: boolean;
  canManageLeads?: boolean;
};

function cleanPermissions(value: unknown) {
  if (!Array.isArray(value)) return null;
  const cleaned = value.map((item) => {
    const permission = item as PermissionInput;
    const resourceKey = String(permission.resourceKey || "");
    if (!validResourceKey(resourceKey)) return null;
    const canEditContent = permission.canEditContent === true;
    const canManageLeads = permission.canManageLeads === true;
    return {
      resourceKey,
      canViewContent: permission.canViewContent === true || canEditContent,
      canEditContent,
      canViewLeads: permission.canViewLeads === true || canManageLeads,
      canManageLeads,
    };
  });
  return cleaned.some((item) => item === null)
    ? null
    : cleaned.filter(Boolean) as Array<{
        resourceKey: string;
        canViewContent: boolean;
        canEditContent: boolean;
        canViewLeads: boolean;
        canManageLeads: boolean;
      }>;
}

async function replacePermissions(userId: number, permissions: ReturnType<typeof cleanPermissions>) {
  if (!permissions) return;
  const db = getDb();
  await db.delete(cmsPermissions).where(eq(cmsPermissions.userId, userId));
  const effectivePermissions = permissions.filter((permission) =>
    permission.canViewContent || permission.canEditContent || permission.canViewLeads || permission.canManageLeads
  );
  if (effectivePermissions.length === 0) return;
  const now = new Date().toISOString();
  await db.insert(cmsPermissions).values(
    effectivePermissions.map((permission) => ({
      userId,
      ...permission,
      createdAt: now,
      updatedAt: now,
    })),
  );
}

async function serializedUser(id: number) {
  const [user] = await getDb().select().from(cmsUsers).where(eq(cmsUsers.id, id)).limit(1);
  return user ? { ...user, permissions: await getUserPermissions(user.id) } : null;
}

export async function GET() {
  const admin = await getAuthorizedAdmin();
  if (!admin || admin.role !== "owner") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const records = await getDb().select().from(cmsUsers).orderBy(asc(cmsUsers.email));
  const users = await Promise.all(
    records.map(async (user) => ({
      ...user,
      permissions: await getUserPermissions(user.id),
    })),
  );
  return Response.json(
    { users, resources: cmsResources },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export async function POST(request: Request) {
  const admin = await getAuthorizedAdmin();
  if (!admin || admin.role !== "owner") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = (await request.json()) as {
    email?: string;
    displayName?: string;
    role?: string;
    defaultLocale?: string;
    systemLocale?: string;
    canReportBugs?: boolean;
    permissions?: PermissionInput[];
  };
  const email = String(body.email || "").trim().toLowerCase();
  const displayName = String(body.displayName || "").trim().slice(0, 120);
  const role = String(body.role || "viewer");
  const defaultLocale = String(body.defaultLocale || "en");
  const systemLocale = String(body.systemLocale || "en");
  const canReportBugs = body.canReportBugs === true;
  const permissions = body.permissions === undefined ? [] : cleanPermissions(body.permissions);
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ||
    !roles.has(role) ||
    !contentLocales.has(defaultLocale) ||
    !systemLocales.has(systemLocale) ||
    permissions === null
  ) {
    return Response.json({ error: "Invalid user" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const db = getDb();
  await db
    .insert(cmsUsers)
    .values({
      email,
      displayName,
      role: role as "owner" | "editor" | "viewer",
      defaultLocale,
      systemLocale,
      canReportBugs,
      status: "active",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: cmsUsers.email,
      set: {
        displayName,
        role: role as "owner" | "editor" | "viewer",
        defaultLocale,
        systemLocale,
        canReportBugs,
        status: "active",
        updatedAt: now,
      },
    });
  const [saved] = await db.select().from(cmsUsers).where(eq(cmsUsers.email, email)).limit(1);
  await replacePermissions(saved.id, permissions);
  await db.insert(cmsAuditLog).values({
    actorEmail: admin.email,
    action: "user.saved",
    entityType: "user",
    entityId: email,
    details: JSON.stringify({ role, defaultLocale, systemLocale, canReportBugs, permissions }),
    createdAt: now,
  });
  const user = await serializedUser(saved.id);
  if (!user) return Response.json({ error: "Saved user could not be verified" }, { status: 500 });
  return Response.json({ success: true, user }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function PATCH(request: Request) {
  const admin = await getAuthorizedAdmin();
  if (!admin || admin.role !== "owner") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = (await request.json()) as {
    id?: number;
    status?: string;
    role?: string;
    defaultLocale?: string;
    systemLocale?: string;
    canReportBugs?: boolean;
    permissions?: PermissionInput[];
  };
  const id = Number(body.id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "Invalid user" }, { status: 400 });
  }
  const db = getDb();
  const [existing] = await db.select().from(cmsUsers).where(eq(cmsUsers.id, id)).limit(1);
  if (!existing) return Response.json({ error: "User not found" }, { status: 404 });

  const status = body.status === undefined ? existing.status : body.status === "active" ? "active" : "inactive";
  const role = body.role === undefined ? existing.role : String(body.role);
  const defaultLocale = body.defaultLocale === undefined ? existing.defaultLocale : String(body.defaultLocale);
  const systemLocale = body.systemLocale === undefined ? existing.systemLocale : String(body.systemLocale);
  const canReportBugs = body.canReportBugs === undefined ? existing.canReportBugs : body.canReportBugs === true;
  const permissions = body.permissions === undefined ? undefined : cleanPermissions(body.permissions);
  if (
    !roles.has(role) ||
    !contentLocales.has(defaultLocale) ||
    !systemLocales.has(systemLocale) ||
    permissions === null
  ) {
    return Response.json({ error: "Invalid user settings" }, { status: 400 });
  }
  if (existing.email === admin.email && (status !== "active" || role !== "owner")) {
    return Response.json({ error: "You cannot remove your own owner access" }, { status: 400 });
  }

  const now = new Date().toISOString();
  await db
    .update(cmsUsers)
    .set({
      status,
      role: role as "owner" | "editor" | "viewer",
      defaultLocale,
      systemLocale,
      canReportBugs,
      updatedAt: now,
    })
    .where(eq(cmsUsers.id, id));
  if (permissions !== undefined) await replacePermissions(id, permissions);
  await db.insert(cmsAuditLog).values({
    actorEmail: admin.email,
    action: "user.updated",
    entityType: "user",
    entityId: existing.email,
    details: JSON.stringify({ status, role, defaultLocale, systemLocale, canReportBugs, permissions }),
    createdAt: now,
  });
  const user = await serializedUser(id);
  if (!user) return Response.json({ error: "Saved user could not be verified" }, { status: 500 });
  return Response.json({ success: true, user }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
