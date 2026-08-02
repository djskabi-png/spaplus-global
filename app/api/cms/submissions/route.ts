import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../../db";
import { cmsAuditLog, formSubmissions } from "../../../../db/schema";
import { getAuthorizedAdmin } from "../../../admin-auth";
import { cmsResources, hasPermission } from "../../../cms-access";

function allowedLeadResources(
  admin: NonNullable<Awaited<ReturnType<typeof getAuthorizedAdmin>>>,
  capability: "viewLeads" | "manageLeads",
) {
  return cmsResources
    .map((resource) => resource.key)
    .filter((resourceKey) =>
      hasPermission(admin.role, admin.permissions, resourceKey, capability),
    );
}

export async function GET() {
  const admin = await getAuthorizedAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const resources = allowedLeadResources(admin, "viewLeads");
  if (resources.length === 0) return Response.json({ submissions: [] });
  const submissions = await getDb()
    .select()
    .from(formSubmissions)
    .where(inArray(formSubmissions.resourceKey, resources))
    .orderBy(desc(formSubmissions.createdAt))
    .limit(200);
  return Response.json({ submissions });
}

export async function PATCH(request: Request) {
  const admin = await getAuthorizedAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { id?: number; status?: string };
  const id = Number(body.id);
  const status = String(body.status || "");
  if (!Number.isInteger(id) || !["new", "in_progress", "won", "irrelevant", "deleted"].includes(status)) {
    return Response.json({ error: "Invalid submission" }, { status: 400 });
  }
  const db = getDb();
  const [submission] = await db
    .select()
    .from(formSubmissions)
    .where(eq(formSubmissions.id, id))
    .limit(1);
  if (!submission) return Response.json({ error: "Not found" }, { status: 404 });
  if (!hasPermission(admin.role, admin.permissions, submission.resourceKey, "manageLeads")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  await db
    .update(formSubmissions)
    .set({ status: status as "new" | "in_progress" | "won" | "irrelevant" | "deleted" })
    .where(and(eq(formSubmissions.id, id), eq(formSubmissions.resourceKey, submission.resourceKey)));
  await db.insert(cmsAuditLog).values({
    actorEmail: admin.email,
    action: "lead.status.updated",
    entityType: "submission",
    entityId: String(id),
    details: JSON.stringify({ resourceKey: submission.resourceKey, status }),
    createdAt: new Date().toISOString(),
  });
  return Response.json({ success: true });
}
