import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { cmsAuditLog, cmsUsers } from "../../../../db/schema";
import { getAuthorizedAdmin } from "../../../admin-auth";

const roles = new Set(["owner", "editor", "viewer"]);
const locales = new Set(["en", "he", "fr-CA", "ru", "el", "it", "hu", "pl", "es"]);

export async function GET() {
  const admin = await getAuthorizedAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const users = await getDb().select().from(cmsUsers).orderBy(asc(cmsUsers.email));
  return Response.json({ users });
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
  };
  const email = String(body.email || "").trim().toLowerCase();
  const displayName = String(body.displayName || "").trim().slice(0, 120);
  const role = String(body.role || "viewer");
  const defaultLocale = String(body.defaultLocale || "en");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !roles.has(role) || !locales.has(defaultLocale)) {
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
        status: "active",
        updatedAt: now,
      },
    });
  await db.insert(cmsAuditLog).values({
    actorEmail: admin.email,
    action: "user.saved",
    entityType: "user",
    entityId: email,
    details: JSON.stringify({ role, defaultLocale }),
    createdAt: now,
  });
  return Response.json({ success: true });
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
  if (!roles.has(role) || !locales.has(defaultLocale)) {
    return Response.json({ error: "Invalid user settings" }, { status: 400 });
  }
  if (existing.email === admin.email && (status !== "active" || role !== "owner")) {
    return Response.json({ error: "You cannot remove your own owner access" }, { status: 400 });
  }

  const now = new Date().toISOString();
  await db
    .update(cmsUsers)
    .set({ status, role: role as "owner" | "editor" | "viewer", defaultLocale, updatedAt: now })
    .where(eq(cmsUsers.id, id));
  await db.insert(cmsAuditLog).values({
    actorEmail: admin.email,
    action: "user.updated",
    entityType: "user",
    entityId: existing.email,
    details: JSON.stringify({ status, role, defaultLocale }),
    createdAt: now,
  });
  return Response.json({ success: true });
}
