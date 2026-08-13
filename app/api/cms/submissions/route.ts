import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../../db";
import { cmsAuditLog, formSubmissions, leadNotes, leadStatusEvents } from "../../../../db/schema";
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
  const ids = submissions.map((submission) => submission.id);
  if (ids.length === 0) return Response.json({ submissions: [] });
  const db = getDb();
  const idChunks = Array.from(
    { length: Math.ceil(ids.length / 50) },
    (_value, index) => ids.slice(index * 50, index * 50 + 50),
  );
  const [statusEventChunks, noteChunks] = await Promise.all([
    Promise.all(
      idChunks.map((chunk) =>
        db
          .select()
          .from(leadStatusEvents)
          .where(inArray(leadStatusEvents.submissionId, chunk))
          .orderBy(desc(leadStatusEvents.createdAt)),
      ),
    ),
    Promise.all(
      idChunks.map((chunk) =>
        db
          .select()
          .from(leadNotes)
          .where(inArray(leadNotes.submissionId, chunk))
          .orderBy(desc(leadNotes.createdAt)),
      ),
    ),
  ]);
  const statusEvents = statusEventChunks.flat();
  const notes = noteChunks.flat();
  return Response.json({
    submissions: submissions.map((submission) => ({
      ...submission,
      statusEvents: statusEvents.filter((event) => event.submissionId === submission.id),
      notes: notes.filter((note) => note.submissionId === submission.id),
    })),
  });
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
  const previousStatus = submission.status === "closed" ? "won" : submission.status;
  if (previousStatus === status) return Response.json({ success: true });
  const createdAt = new Date().toISOString();
  await db.batch([
    db.update(formSubmissions)
      .set({ status: status as "new" | "in_progress" | "won" | "irrelevant" | "deleted" })
      .where(and(eq(formSubmissions.id, id), eq(formSubmissions.resourceKey, submission.resourceKey))),
    db.insert(leadStatusEvents).values({
      submissionId: id,
      fromStatus: previousStatus,
      toStatus: status,
      actorEmail: admin.email,
      actorName: admin.displayName,
      createdAt,
    }),
  ]);
  await db.insert(cmsAuditLog).values({
    actorEmail: admin.email,
    action: "lead.status.updated",
    entityType: "submission",
    entityId: String(id),
    details: JSON.stringify({ resourceKey: submission.resourceKey, status }),
    createdAt,
  });
  return Response.json({ success: true });
}
