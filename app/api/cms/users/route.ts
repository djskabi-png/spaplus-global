import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { cmsAuditLog, cmsUsers } from "../../../../db/schema";
import { getAuthorizedAdmin } from "../../../admin-auth";

const roles = new Set(["owner", "editor", "viewer"]);

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
  };
  const email = String(body.email || "").trim().toLowerCase();
  const displayName = String(body.displayName || "").trim().slice(0, 120);
  const role = String(body.role || "viewer");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !roles.has(role)) {
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
      status: "active",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: cmsUsers.email,
      set: {
        displayName,
        role: role as "owner" | "editor" | "viewer",
        status: "active",
        updatedAt: now,
      },
    });
  await db.insert(cmsAuditLog).values({
    actorEmail: admin.email,
    action: "user.saved",
    entityType: "user",
    entityId: email,
    details: JSON.stringify({ role }),
    createdAt: now,
  });
  return Response.json({ success: true });
}

export async function PATCH(request: Request) {
  const admin = await getAuthorizedAdmin();
  if (!admin || admin.role !== "owner") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = (await request.json()) as { id?: number; status?: string };
  const id = Number(body.id);
  const status = body.status === "active" ? "active" : "inactive";
  if (!Number.isInteger(id)) {
    return Response.json({ error: "Invalid user" }, { status: 400 });
  }
  await getDb()
    .update(cmsUsers)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(cmsUsers.id, id));
  return Response.json({ success: true });
}
