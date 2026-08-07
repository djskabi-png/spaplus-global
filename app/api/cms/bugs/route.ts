import { env } from "cloudflare:workers";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { bugReports, cmsAuditLog, projectItems } from "../../../../db/schema";
import { getAuthorizedAdmin } from "../../../admin-auth";

type JsonRecord = Record<string, unknown>;

async function authorize() {
  const admin = await getAuthorizedAdmin();
  if (!admin) return { response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  if (admin.role !== "owner" && !admin.canReportBugs) return { response: Response.json({ error: "Forbidden" }, { status: 403 }) };
  return { admin };
}

async function ensureTable() {
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS bug_reports (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, project_id INTEGER REFERENCES project_items(id) ON DELETE SET NULL, custom_project TEXT NOT NULL DEFAULT '', target_key TEXT NOT NULL DEFAULT 'adir', title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', severity TEXT NOT NULL DEFAULT 'medium', status TEXT NOT NULL DEFAULT 'new', page_url TEXT NOT NULL DEFAULT '', steps TEXT NOT NULL DEFAULT '', expected TEXT NOT NULL DEFAULT '', actual TEXT NOT NULL DEFAULT '', reporter_email TEXT NOT NULL, reporter_name TEXT NOT NULL DEFAULT '', drive_sync_status TEXT NOT NULL DEFAULT 'not_configured', drive_row_id TEXT NOT NULL DEFAULT '', drive_error TEXT NOT NULL DEFAULT '', attachment_name TEXT NOT NULL DEFAULT '', attachment_url TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS bug_reports_project_idx ON bug_reports(project_id)").run();
}

const validTargets = ["gal_website", "gal_system", "sergey_maxim", "maxim_roy", "maor_shlomi", "roy", "adir", "galia", "review"];

type AttachmentPayload = { name: string; mimeType: string; base64: string } | null;

async function callDrive(payload: JsonRecord) {
  const webhook = process.env.BUGS_WEBHOOK_URL || "";
  if (!webhook) return { ok: false, notConfigured: true, error: "" };
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret: process.env.BUGS_WEBHOOK_SECRET || "", ...payload }),
    });
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    const result = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (result.ok !== true) return { ok: false, error: String(result.error || "Drive sync failed") };
    return { ok: true, result };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message.slice(0, 300) : "Unknown sync error" };
  }
}

async function syncToDrive(bug: typeof bugReports.$inferSelect, projectName: string, attachment: AttachmentPayload) {
  const drive = await callDrive({
    action: "create",
    localId: bug.id,
    taskId: `BUG-${String(bug.id).padStart(4, "0")}`,
    targetKey: bug.targetKey,
    createdAt: bug.createdAt,
    project: projectName,
    title: bug.title,
    description: bug.description,
    severity: bug.severity,
    status: bug.status,
    pageUrl: bug.pageUrl,
    steps: bug.steps,
    expected: bug.expected,
    actual: bug.actual,
    reporter: bug.reporterName || bug.reporterEmail,
    attachment,
  });
  if (drive.notConfigured) return { status: "not_configured" as const, rowId: "", attachmentUrl: "", error: "" };
  if (!drive.ok) return { status: "failed" as const, rowId: "", attachmentUrl: "", error: drive.error || "Drive sync failed" };
  const result = drive.result!;
  return {
    status: "synced" as const,
    rowId: JSON.stringify({ taskId: result.taskId, targetKey: bug.targetKey, sheet: result.sheet, row: result.row, spreadsheetUrl: result.spreadsheetUrl }),
    attachmentUrl: String(result.attachmentUrl || ""),
    error: "",
  };
}

export async function GET() {
  const access = await authorize(); if (access.response) return access.response;
  await ensureTable();
  const allBugs = await getDb().select().from(bugReports).orderBy(desc(bugReports.createdAt), desc(bugReports.id));
  const projects = await getDb().select({ id: projectItems.id, name: projectItems.name }).from(projectItems).orderBy(projectItems.name);
  const bugs = access.admin!.role === "owner" ? allBugs : allBugs.filter((bug) => bug.reporterEmail === access.admin!.email);
  return Response.json({ bugs, projects });
}

export async function POST(request: Request) {
  const access = await authorize(); if (access.response) return access.response;
  await ensureTable();
  const body = await request.json() as JsonRecord;
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const severity = ["low", "medium", "high", "critical"].includes(String(body.severity)) ? String(body.severity) : "medium";
  const targetKey = validTargets.includes(String(body.targetKey)) ? String(body.targetKey) : "";
  const projectIdValue = Number(body.projectId);
  const projectId = Number.isInteger(projectIdValue) && projectIdValue > 0 ? projectIdValue : null;
  const customProject = String(body.customProject || "").trim().slice(0, 180);
  if (!title || !description || !targetKey || (!projectId && !customProject)) return Response.json({ error: "Required fields are missing" }, { status: 400 });
  let attachment: AttachmentPayload = null;
  if (body.attachment && typeof body.attachment === "object") {
    const raw = body.attachment as JsonRecord;
    const mimeType = String(raw.mimeType || "");
    const base64 = String(raw.base64 || "");
    if (!/^image\/(png|jpeg|webp|gif)$/i.test(mimeType) || !base64 || base64.length > 5_600_000) return Response.json({ error: "Invalid attachment" }, { status: 400 });
    attachment = { name: String(raw.name || "screenshot.png").slice(0, 180), mimeType, base64 };
  }
  const now = new Date().toISOString();
  const [created] = await getDb().insert(bugReports).values({
    projectId,
    customProject,
    targetKey,
    title: title.slice(0, 180),
    description: description.slice(0, 5000),
    severity: severity as "low" | "medium" | "high" | "critical",
    status: "new",
    pageUrl: String(body.pageUrl || "").trim().slice(0, 1000),
    steps: String(body.steps || "").trim().slice(0, 5000),
    expected: String(body.expected || "").trim().slice(0, 3000),
    actual: String(body.actual || "").trim().slice(0, 3000),
    reporterEmail: access.admin!.email,
    reporterName: access.admin!.displayName || "",
    driveSyncStatus: process.env.BUGS_WEBHOOK_URL ? "pending" : "not_configured",
    attachmentName: attachment?.name || "",
    createdAt: now,
    updatedAt: now,
  }).returning();
  const project = projectId ? await env.DB.prepare("SELECT name FROM project_items WHERE id = ?").bind(projectId).first<{ name: string }>() : null;
  const sync = await syncToDrive(created, project?.name || customProject, attachment);
  await getDb().update(bugReports).set({ driveSyncStatus: sync.status, driveRowId: sync.rowId, driveError: sync.error, attachmentUrl: sync.attachmentUrl, updatedAt: new Date().toISOString() }).where(eq(bugReports.id, created.id));
  await getDb().insert(cmsAuditLog).values({ actorEmail: access.admin!.email, action: "bug.created", entityType: "bug", entityId: String(created.id), details: JSON.stringify({ projectId, customProject, targetKey, severity, driveSyncStatus: sync.status }), createdAt: now });
  return Response.json({ id: created.id, driveSyncStatus: sync.status }, { status: 201 });
}

export async function PATCH(request: Request) {
  const access = await authorize(); if (access.response) return access.response;
  if (access.admin!.role !== "owner") return Response.json({ error: "Forbidden" }, { status: 403 });
  await ensureTable();
  const body = await request.json() as JsonRecord;
  const id = Number(body.id);
  const status = String(body.status || "");
  if (!Number.isInteger(id) || !["new", "in_progress", "fixed", "closed"].includes(status)) return Response.json({ error: "Invalid update" }, { status: 400 });
  const [bug] = await getDb().select().from(bugReports).where(eq(bugReports.id, id)).limit(1);
  if (!bug) return Response.json({ error: "Not found" }, { status: 404 });
  if (bug.driveSyncStatus === "synced") {
    const metadata = JSON.parse(bug.driveRowId || "{}") as { taskId?: string; targetKey?: string };
    const drive = await callDrive({ action: "status", taskId: metadata.taskId, targetKey: metadata.targetKey, status });
    if (!drive.ok) return Response.json({ error: "Drive update failed" }, { status: 502 });
  }
  await getDb().update(bugReports).set({ status: status as "new" | "in_progress" | "fixed" | "closed", updatedAt: new Date().toISOString() }).where(eq(bugReports.id, id));
  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  const access = await authorize(); if (access.response) return access.response;
  if (access.admin!.role !== "owner") return Response.json({ error: "Forbidden" }, { status: 403 });
  await ensureTable();
  const body = await request.json() as JsonRecord;
  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Invalid id" }, { status: 400 });

  const [bug] = await getDb().select().from(bugReports).where(eq(bugReports.id, id)).limit(1);
  if (!bug) return Response.json({ error: "Not found" }, { status: 404 });

  const webhook = process.env.BUGS_WEBHOOK_URL || "";
  if (webhook && bug.driveSyncStatus === "synced") {
    const metadata = JSON.parse(bug.driveRowId || "{}") as { taskId?: string; targetKey?: string };
    const drive = await callDrive({ action: "delete", taskId: metadata.taskId, targetKey: metadata.targetKey });
    if (!drive.ok) return Response.json({ error: "Drive deletion failed" }, { status: 502 });
  }

  await getDb().delete(bugReports).where(eq(bugReports.id, id));
  await getDb().insert(cmsAuditLog).values({ actorEmail: access.admin!.email, action: "bug.deleted", entityType: "bug", entityId: String(id), details: JSON.stringify({ driveSyncStatus: bug.driveSyncStatus }), createdAt: new Date().toISOString() });
  return Response.json({ success: true });
}
