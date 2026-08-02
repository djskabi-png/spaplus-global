import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { cmsAuditLog, formSubmissions, leadNotes } from "../../../../../db/schema";
import { getAuthorizedAdmin } from "../../../../admin-auth";
import { hasPermission } from "../../../../cms-access";

const noteStates = ["open", "important", "handled"] as const;
type NoteState = typeof noteStates[number];

export async function POST(request: Request) {
  const admin = await getAuthorizedAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { submissionId?: number; body?: string; state?: string };
  const submissionId = Number(body.submissionId);
  const noteBody = String(body.body || "").trim();
  const state = noteStates.includes(body.state as NoteState) ? body.state as NoteState : "open";
  if (!Number.isInteger(submissionId) || !noteBody || noteBody.length > 4000) {
    return Response.json({ error: "Invalid note" }, { status: 400 });
  }
  const db = getDb();
  const [submission] = await db.select().from(formSubmissions).where(eq(formSubmissions.id, submissionId)).limit(1);
  if (!submission) return Response.json({ error: "Not found" }, { status: 404 });
  if (!hasPermission(admin.role, admin.permissions, submission.resourceKey, "manageLeads")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const createdAt = new Date().toISOString();
  const [note] = await db.insert(leadNotes).values({
    submissionId,
    body: noteBody,
    state,
    actorEmail: admin.email,
    actorName: admin.displayName,
    createdAt,
    updatedAt: createdAt,
  }).returning();
  await db.insert(cmsAuditLog).values({
    actorEmail: admin.email,
    action: "lead.note.created",
    entityType: "submission",
    entityId: String(submissionId),
    details: JSON.stringify({ resourceKey: submission.resourceKey, noteId: note.id, state }),
    createdAt,
  });
  return Response.json({ note });
}

export async function PATCH(request: Request) {
  const admin = await getAuthorizedAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { id?: number; state?: string };
  const id = Number(body.id);
  const state = String(body.state || "") as NoteState;
  if (!Number.isInteger(id) || !noteStates.includes(state)) {
    return Response.json({ error: "Invalid note" }, { status: 400 });
  }
  const db = getDb();
  const [row] = await db.select({ note: leadNotes, resourceKey: formSubmissions.resourceKey })
    .from(leadNotes)
    .innerJoin(formSubmissions, eq(leadNotes.submissionId, formSubmissions.id))
    .where(eq(leadNotes.id, id)).limit(1);
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  if (!hasPermission(admin.role, admin.permissions, row.resourceKey, "manageLeads")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const updatedAt = new Date().toISOString();
  await db.update(leadNotes).set({ state, updatedAt }).where(and(eq(leadNotes.id, id), eq(leadNotes.submissionId, row.note.submissionId)));
  await db.insert(cmsAuditLog).values({
    actorEmail: admin.email,
    action: "lead.note.state.updated",
    entityType: "submission",
    entityId: String(row.note.submissionId),
    details: JSON.stringify({ resourceKey: row.resourceKey, noteId: id, state }),
    createdAt: updatedAt,
  });
  return Response.json({ success: true, updatedAt });
}
