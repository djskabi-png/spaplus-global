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

const spreadsheetId = "1T1QdjANrGtNj6UVszpIpQiVaidH6AHBlm349vUU4AKI";
const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
const driveTargets: Record<string, { sheetId: number; sheet: string; owner: string }> = {
  gal_website: { sheetId: 766005021, sheet: "גל אתר", owner: "גל" },
  gal_system: { sheetId: 1651016373, sheet: "גל מערכת", owner: "גל" },
  sergey_maxim: { sheetId: 1879753622, sheet: "סרגיי+מקסים", owner: "סרגיי ומקסים" },
  maxim_roy: { sheetId: 1078804983, sheet: "מקסים+רועי", owner: "מקסים ורועי" },
  maor_shlomi: { sheetId: 872281591, sheet: "מאור+שלומי", owner: "מאור ושלומי" },
  roy: { sheetId: 1183475353, sheet: "רועי", owner: "רועי" },
  adir: { sheetId: 1701284227, sheet: "אדיר", owner: "אדיר" },
  galia: { sheetId: 1846718249, sheet: "גליה", owner: "גליה" },
  review: { sheetId: 498174555, sheet: "לבדיקה", owner: "אדיר" },
  future: { sheetId: 318326031, sheet: "עתידי", owner: "לא הוקצה" },
  future_roy: { sheetId: 2026080801, sheet: "עתידי רועי", owner: "רועי" },
  future_adir: { sheetId: 2026080802, sheet: "עתידי אדיר", owner: "אדיר" },
  future_gal: { sheetId: 2026080803, sheet: "עתידי גל", owner: "גל" },
  future_maxim: { sheetId: 2026080804, sheet: "עתידי מקסים", owner: "מקסים" },
  future_sergey: { sheetId: 2026080805, sheet: "עתידי סרגיי", owner: "סרגיי" },
  future_maor: { sheetId: 2026080806, sheet: "עתידי מאור", owner: "מאור" },
  future_shlomi: { sheetId: 2026080807, sheet: "עתידי שלומי", owner: "שלומי" },
};
const validTargets = Object.keys(driveTargets);

type AttachmentPayload = { name: string; mimeType: string; base64: string } | null;

function sheetsHeaders(accessToken: string) {
  return { authorization: `Bearer ${accessToken}`, "content-type": "application/json" };
}

async function findTaskRow(accessToken: string, targetKey: string, taskId: string) {
  const target = driveTargets[targetKey];
  if (!target) return null;
  const range = encodeURIComponent(`'${target.sheet}'!A2:A1000`);
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, { headers: sheetsHeaders(accessToken) });
  if (!response.ok) return null;
  const payload = await response.json() as { values?: string[][] };
  const index = (payload.values || []).findIndex((row) => row[0] === taskId);
  if (index >= 0) return index + 2;

  // Recover task IDs written by the old append flow into a later column when
  // a legacy sheet contained notes below its main table.
  const legacyRange = encodeURIComponent(`'${target.sheet}'!A2:I1000`);
  const legacyResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${legacyRange}`, { headers: sheetsHeaders(accessToken) });
  if (!legacyResponse.ok) return null;
  const legacyPayload = await legacyResponse.json() as { values?: string[][] };
  const legacyIndex = (legacyPayload.values || []).findIndex((row) => row.some((cell) => cell === taskId));
  return legacyIndex < 0 ? null : legacyIndex + 2;
}

async function findNextTaskRow(accessToken: string, targetKey: string) {
  const target = driveTargets[targetKey];
  if (!target) return null;
  const range = encodeURIComponent(`'${target.sheet}'!A2:A1000`);
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, { headers: sheetsHeaders(accessToken) });
  if (!response.ok) return null;
  const payload = await response.json() as { values?: string[][] };
  const values = payload.values || [];
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (String(values[index]?.[0] || "").trim()) return index + 3;
  }
  return 2;
}

function sheetStatus(status: string) {
  return ({ new: "חדש", in_progress: "בטיפול", fixed: "תוקן", closed: "נסגר" } as Record<string, string>)[status] || "חדש";
}

function sheetSeverity(severity: string) {
  return ({ low: "נמוכה", medium: "בינונית", high: "גבוהה", critical: "קריטית" } as Record<string, string>)[severity] || "בינונית";
}

async function callDrive(payload: JsonRecord, accessToken: string) {
  if (!accessToken) return { ok: false, notConfigured: true, error: "" };
  const targetKey = String(payload.targetKey || "");
  const target = driveTargets[targetKey];
  if (!target) return { ok: false, error: "Unknown target" };
  try {
    const action = String(payload.action || "");
    const taskId = String(payload.taskId || "");
    if (action === "create") {
      const notes = [String(payload.pageUrl || ""), String(payload.steps || "") && `שלבי שחזור:\n${payload.steps}`, String(payload.actual || "") && `מה קרה בפועל:\n${payload.actual}`, payload.attachment ? "צורף צילום מסך לדיווח במערכת" : ""].filter(Boolean).join("\n\n");
      const values = [[taskId, sheetSeverity(String(payload.severity)), sheetStatus(String(payload.status)), String(payload.title || ""), `${String(payload.project || "")}\n\n${String(payload.description || "")}`.trim(), String(payload.expected || ""), target.owner, notes, ""]];
      const row = await findNextTaskRow(accessToken, targetKey);
      if (!row || row > 1000) return { ok: false, error: "No available task row" };
      const range = encodeURIComponent(`'${target.sheet}'!A${row}:I${row}`);
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, { method: "PUT", headers: sheetsHeaders(accessToken), body: JSON.stringify({ values }) });
      if (!response.ok) return { ok: false, error: `Google Sheets HTTP ${response.status}` };
      if (row > 0) {
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: "POST", headers: sheetsHeaders(accessToken), body: JSON.stringify({ requests: [{ repeatCell: { range: { sheetId: target.sheetId, startRowIndex: row - 1, endRowIndex: row, startColumnIndex: 0, endColumnIndex: 9 }, cell: { userEnteredFormat: { verticalAlignment: "MIDDLE", wrapStrategy: "WRAP", textFormat: { fontFamily: "Heebo", fontSize: 14 } } }, fields: "userEnteredFormat(verticalAlignment,wrapStrategy,textFormat)" } }] }),
        });
      }
      return { ok: true, result: { ok: true, taskId, sheet: target.sheet, row, spreadsheetUrl: `${spreadsheetUrl}?gid=${target.sheetId}#gid=${target.sheetId}` } };
    }
    const row = await findTaskRow(accessToken, targetKey, taskId);
    if (!row) return { ok: false, error: "Task row not found" };
    if (action === "status") {
      const range = encodeURIComponent(`'${target.sheet}'!C${row}`);
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, { method: "PUT", headers: sheetsHeaders(accessToken), body: JSON.stringify({ values: [[sheetStatus(String(payload.status || ""))]] }) });
      return response.ok ? { ok: true, result: { ok: true } } : { ok: false, error: `Google Sheets HTTP ${response.status}` };
    }
    if (action === "delete") {
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, { method: "POST", headers: sheetsHeaders(accessToken), body: JSON.stringify({ requests: [{ deleteDimension: { range: { sheetId: target.sheetId, dimension: "ROWS", startIndex: row - 1, endIndex: row } } }] }) });
      return response.ok ? { ok: true, result: { ok: true } } : { ok: false, error: `Google Sheets HTTP ${response.status}` };
    }
    return { ok: false, error: "Unknown action" };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message.slice(0, 300) : "Unknown sync error" };
  }
}

async function syncToDrive(bug: typeof bugReports.$inferSelect, projectName: string, attachment: AttachmentPayload, accessToken: string) {
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
  }, accessToken);
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

async function driveMetrics(accessToken: string) {
  if (!accessToken) return null;
  const closed = new Set(["טופל", "בוצע", "תוקן", "נסגר", "הושלם", "resolved", "closed", "done", "released"]);
  const ranges = Object.values(driveTargets).map(async (target) => {
    const range = encodeURIComponent(`'${target.sheet}'!A2:C1000`);
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, { headers: sheetsHeaders(accessToken) });
    if (!response.ok) return [] as string[][];
    const payload = await response.json() as { values?: string[][] };
    return payload.values || [];
  });
  const rows = (await Promise.all(ranges)).flat().filter((row) => String(row[0] || "").trim());
  const open = rows.filter((row) => !closed.has(String(row[2] || "").trim().toLowerCase()));
  return { open: open.length, critical: open.filter((row) => String(row[1] || "").includes("קריטי")).length, total: rows.length };
}

export async function GET(request: Request) {
  const access = await authorize(); if (access.response) return access.response;
  await ensureTable();
  const sheetsToken = request.headers.get("x-spaplus-google-sheets-token") || "";
  const allBugs = await getDb().select().from(bugReports).orderBy(desc(bugReports.createdAt), desc(bugReports.id));
  const projects = await getDb().select({ id: projectItems.id, name: projectItems.name }).from(projectItems).orderBy(projectItems.name);
  const bugs = access.admin!.role === "owner" ? allBugs : allBugs.filter((bug) => bug.reporterEmail === access.admin!.email);
  return Response.json({ bugs, projects, syncConfigured: Boolean(sheetsToken), sheetUrl: spreadsheetUrl, driveMetrics: await driveMetrics(sheetsToken) });
}

export async function POST(request: Request) {
  const access = await authorize(); if (access.response) return access.response;
  await ensureTable();
  const body = await request.json() as JsonRecord;
  const sheetsToken = request.headers.get("x-spaplus-google-sheets-token") || "";
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
    driveSyncStatus: sheetsToken ? "pending" : "not_configured",
    attachmentName: attachment?.name || "",
    createdAt: now,
    updatedAt: now,
  }).returning();
  const project = projectId ? await env.DB.prepare("SELECT name FROM project_items WHERE id = ?").bind(projectId).first<{ name: string }>() : null;
  const sync = await syncToDrive(created, project?.name || customProject, attachment, sheetsToken);
  await getDb().update(bugReports).set({ driveSyncStatus: sync.status, driveRowId: sync.rowId, driveError: sync.error, attachmentUrl: sync.attachmentUrl, updatedAt: new Date().toISOString() }).where(eq(bugReports.id, created.id));
  await getDb().insert(cmsAuditLog).values({ actorEmail: access.admin!.email, action: "bug.created", entityType: "bug", entityId: String(created.id), details: JSON.stringify({ projectId, customProject, targetKey, severity, driveSyncStatus: sync.status }), createdAt: now });
  return Response.json({ id: created.id, driveSyncStatus: sync.status }, { status: 201 });
}

export async function PATCH(request: Request) {
  const access = await authorize(); if (access.response) return access.response;
  if (access.admin!.role !== "owner") return Response.json({ error: "Forbidden" }, { status: 403 });
  await ensureTable();
  const body = await request.json() as JsonRecord;
  const sheetsToken = request.headers.get("x-spaplus-google-sheets-token") || "";
  const id = Number(body.id);
  const status = String(body.status || "");
  if (!Number.isInteger(id) || !["new", "in_progress", "fixed", "closed"].includes(status)) return Response.json({ error: "Invalid update" }, { status: 400 });
  const [bug] = await getDb().select().from(bugReports).where(eq(bugReports.id, id)).limit(1);
  if (!bug) return Response.json({ error: "Not found" }, { status: 404 });
  if (bug.driveSyncStatus === "synced") {
    const metadata = JSON.parse(bug.driveRowId || "{}") as { taskId?: string; targetKey?: string };
    const drive = await callDrive({ action: "status", taskId: metadata.taskId, targetKey: metadata.targetKey, status }, sheetsToken);
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
  const sheetsToken = request.headers.get("x-spaplus-google-sheets-token") || "";
  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Invalid id" }, { status: 400 });

  const [bug] = await getDb().select().from(bugReports).where(eq(bugReports.id, id)).limit(1);
  if (!bug) return Response.json({ error: "Not found" }, { status: 404 });

  if (sheetsToken && bug.driveSyncStatus === "synced") {
    const metadata = JSON.parse(bug.driveRowId || "{}") as { taskId?: string; targetKey?: string };
    const drive = await callDrive({ action: "delete", taskId: metadata.taskId, targetKey: metadata.targetKey }, sheetsToken);
    if (!drive.ok) return Response.json({ error: "Drive deletion failed" }, { status: 502 });
  }

  await getDb().delete(bugReports).where(eq(bugReports.id, id));
  await getDb().insert(cmsAuditLog).values({ actorEmail: access.admin!.email, action: "bug.deleted", entityType: "bug", entityId: String(id), details: JSON.stringify({ driveSyncStatus: bug.driveSyncStatus }), createdAt: new Date().toISOString() });
  return Response.json({ success: true });
}
