import { env } from "cloudflare:workers";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { cmsAuditLog, projectItems, projectNotes, projectTasks } from "../../../../db/schema";
import { getAuthorizedAdmin } from "../../../admin-auth";

type JsonRecord = Record<string, unknown>;

const projectFields = new Set([
  "name", "description", "area", "status", "progress", "progressSource", "priority", "owner",
  "collaborators", "currentPhase", "nextAction", "blockers", "targetDate", "sourceThreads", "tags",
]);
const taskFields = new Set(["title", "status", "progress", "owner", "sortOrder"]);
const noteFields = new Set(["body", "state"]);

const initialProjects = [
  {
    name: "BizOnline, האתר והמרקטפלייס",
    description: "האתר החדש, מערכת הניהול, BizPop והכנת המסירה להטמעה בדומיין הראשי.",
    area: "website", status: "nearly_done", progress: 90, progressSource: "confirmed", priority: "critical",
    owner: "אדיר", collaborators: ["מאור", "שלומי"], currentPhase: "השלמת סרטוני המחלקות ופוליש אחרון לאתר",
    nextAction: "לסיים את סרטון האירועים, להכין את סרטון הקליניקות ולהשלים עוד כשעה עד שעתיים באתר.",
    blockers: "העברת מסך הכניסה ו-BizPop לדומיין הראשי דורשת הטמעה של מאור ושלומי.",
    tags: ["אתר", "מרקטפלייס", "וידאו", "מסירה"],
    sourceThreads: ["019fc764-cd8a-7063-a14f-02167207831d", "019fd38a-dfdc-71e1-9e27-d453f2c47e03"],
    tasks: [
      ["סרטון למחלקת הספא", "done", 100, "אדיר"],
      ["סרטון למחלקת הלינה", "done", 100, "אדיר"],
      ["סרטון למחלקת האירועים", "in_progress", null, "אדיר"],
      ["סרטון למחלקת הקליניקות", "planned", null, "אדיר"],
      ["פוליש אחרון לאתר", "planned", null, "אדיר"],
      ["הטמעה בדומיין bsonline.co.il", "waiting", null, "מאור ושלומי"],
    ],
  },
  {
    name: "Biz Spa, מערכת הניהול הבינלאומית", description: "בניית תשתית הממשק המלאה והעברתה להטמעה במערכת הקיימת.",
    area: "product", status: "in_progress", progress: null, progressSource: "unknown", priority: "high", owner: "אדיר",
    collaborators: ["מקסים", "שרגאי"], currentPhase: "HTML, CSS ו-JavaScript", nextAction: "לאמת היקף, אבני דרך ואחוז התקדמות מול משימת המקור.",
    blockers: "ההטמעה הסופית תלויה במקסים ובשרגאי.", tags: ["מערכת ניהול", "ממשק", "מסירה"],
    sourceThreads: ["019fce52-d599-7200-8cd0-cab203670242", "019fd3dc-7b8b-7b01-bf59-74f9bda942a0"],
    tasks: [
      ["השלמת דפי הדשבורד והיומן", "in_progress", null, "אדיר"],
      ["ייצוב הסרטונים ובדיקת תנועה", "in_progress", null, "אדיר"],
      ["השלמת פוטר, תוכן, מגזין ו-SEO", "planned", null, "אדיר"],
      ["בדיקת הרשאות למשתמש עם כמה עסקים", "planned", null, "אדיר"],
      ["מסירת התשתית להטמעה", "waiting", null, "מקסים ושרגאי"],
    ],
  },
  {
    name: "האתר החדש של Masu", description: "חוויית האתר וההזמנה החדשה של מאסו.", area: "website", status: "in_progress",
    progress: null, progressSource: "unknown", priority: "high", owner: "אדיר", collaborators: [], currentPhase: "פיתוח ושדרוג",
    nextAction: "לסקור את המשימה האחרונה ולהגדיר רשימת השלמה.", blockers: "אחוז ההתקדמות טרם אומת.", tags: ["אתר", "הזמנות"],
    sourceThreads: ["019fab63-9b92-78f0-aa6d-36a8ac38e474", "019fb82a-15dd-7682-88f5-6cf16c47fdd9"],
    tasks: [
      ["מיפוי הגרסה האחרונה", "planned", null, "אדיר"],
      ["השלמת מסלול ההזמנה", "planned", null, "אדיר"],
      ["בדיקת מובייל ותוכן", "planned", null, "אדיר"],
    ],
  },
  {
    name: "האתר החדש של VII", description: "אתר חופשות, אירועים וחוויות, כולל עורך תוכן וחיבור לידים.", area: "website",
    status: "in_progress", progress: null, progressSource: "unknown", priority: "high", owner: "אדיר", collaborators: [],
    currentPhase: "פיתוח וחיבורי מערכת", nextAction: "לאמת מה הושלם בגרסה האחרונה ומה נשאר למסירה.", blockers: "אחוז ההתקדמות טרם אומת.",
    tags: ["אתר", "עורך תוכן", "לידים"], sourceThreads: ["019fab38-299b-7943-9e01-c9c4e3c97c4a"],
    tasks: [
      ["אימות חיבור עורך התוכן", "planned", null, "אדיר"],
      ["אימות קליטת הלידים", "planned", null, "אדיר"],
      ["בדיקת מסירה במחשב ובנייד", "planned", null, "אדיר"],
    ],
  },
  {
    name: "פלמנגו ספא, אתר", description: "השלמת האתר הרב לשוני ומערכת הניהול של פלמנגו ספא.", area: "website",
    status: "in_progress", progress: null, progressSource: "unknown", priority: "high", owner: "אדיר", collaborators: [],
    currentPhase: "השלמות ופוליש", nextAction: "לרכז את כל הדברים הפתוחים ולסיים לפי סדר עדיפות.", blockers: "נדרש מיפוי השלמות.",
    tags: ["אתר", "ספא", "מערכת ניהול"], sourceThreads: ["019fb193-5b46-79b1-858e-ea458d4c98a1", "019f9a34-acd0-7742-b91f-edb59e1afb8d"],
    tasks: [
      ["ריכוז כל ההשלמות הפתוחות", "planned", null, "אדיר"],
      ["בדיקת כל השפות", "planned", null, "אדיר"],
      ["בדיקת סרטון ונכסי מדיה", "planned", null, "אדיר"],
      ["בדיקת מערכת הניהול", "planned", null, "אדיר"],
    ],
  },
  {
    name: "מערך הצ׳אטים העסקיים", description: "הצ׳אטים של וילה פור יו, פלמנגו ספא, ספא פלוס, קנדה ופרויקטים נוספים.", area: "automation",
    status: "in_progress", progress: null, progressSource: "unknown", priority: "medium", owner: "אדיר", collaborators: [],
    currentPhase: "פיתוח ושיפור צ׳אטים", nextAction: "לפצל כל צ׳אט לזרם עבודה עם סטטוס, סביבת יעד ובדיקת קבלה.", blockers: "נדרש לזהות את משימת צימרקארד המדויקת.",
    tags: ["צ׳אט", "אוטומציה"], sourceThreads: ["019fb177-0c74-73c2-a9fd-8411cb04a789", "019f4e84-1212-75b3-b48e-226f4e9914cb", "019fc167-1a70-77e2-8e3f-6f25bfbd432e", "019fbffb-94ba-79d2-8e36-8b600bae57b7"],
    tasks: [
      ["צ׳אט וילה פור יו", "in_progress", null, "אדיר"],
      ["צ׳אט פלמנגו ספא", "in_progress", null, "אדיר"],
      ["צ׳אט ספא פלוס וקנדה", "in_progress", null, "אדיר"],
      ["איתור ומיפוי צ׳אט צימרקארד", "waiting", null, "אדיר"],
      ["בדיקת קבלה נפרדת לכל צ׳אט", "planned", null, "אדיר"],
    ],
  },
  {
    name: "SpaPlus Global וקנדה", description: "האתר העולמי, דפי קנדה ואונטריו, קמפיינים, לידים ותשתיות ההשקה.", area: "website",
    status: "in_progress", progress: null, progressSource: "unknown", priority: "medium", owner: "אדיר", collaborators: [],
    currentPhase: "השקה ושיפור שוטף", nextAction: "למפות את הפעילות האחרונה לפרויקטי משנה נפרדים.", blockers: "יש כמה זרמי עבודה פעילים שדורשים איחוד.",
    tags: ["אתר", "קנדה", "קמפיינים", "לידים"], sourceThreads: ["019f91b4-79c8-7151-a9d8-c7cec8146ccf", "019fdac7-0ebb-7b61-92c5-01a668029636"],
    tasks: [
      ["תחזוקת האתר העולמי", "in_progress", null, "אדיר"],
      ["דפי קנדה ואונטריו", "in_progress", null, "אדיר"],
      ["חיבור לידים של אונטריו", "done", 100, "אדיר"],
      ["בדיקת קמפיינים באנגלית ובצרפתית", "in_progress", null, "אדיר"],
      ["מעקב איכות לידים וייחוס", "planned", null, "אדיר"],
    ],
  },
  {
    name: "iEvent", description: "פיתוח האתר, מנועי הכנסה וקמפיינים.", area: "growth", status: "in_progress", progress: null,
    progressSource: "unknown", priority: "medium", owner: "אדיר", collaborators: [], currentPhase: "פיתוח ושיווק",
    nextAction: "לאמת סטטוס מול משימות האתר והקמפיין.", blockers: "אחוז ההתקדמות טרם אומת.", tags: ["אתר", "קמפיינים"],
    sourceThreads: ["019fc72b-5fe8-7bd0-8500-5295f68f3c3d", "019fac19-a29c-7630-83e4-993ce0e65035"],
    tasks: [
      ["בדיקת משתמשים והרשאות", "in_progress", null, "אדיר"],
      ["מיפוי מצב האתר", "planned", null, "אדיר"],
      ["מיפוי מנועי ההכנסה", "planned", null, "אדיר"],
      ["מיפוי הקמפיינים", "planned", null, "אדיר"],
    ],
  },
];

function json(value: unknown) { return JSON.stringify(value ?? []); }
function clampProgress(value: unknown) {
  if (value === null || value === "" || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, Math.round(number))) : null;
}
function parseList(value: string) { try { return JSON.parse(value) as string[]; } catch { return []; } }

async function ensureTables() {
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS project_items (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', area TEXT NOT NULL DEFAULT 'development', status TEXT NOT NULL DEFAULT 'planned', progress INTEGER, progress_source TEXT NOT NULL DEFAULT 'unknown', priority TEXT NOT NULL DEFAULT 'medium', owner TEXT NOT NULL DEFAULT 'אדיר', collaborators TEXT NOT NULL DEFAULT '[]', current_phase TEXT NOT NULL DEFAULT '', next_action TEXT NOT NULL DEFAULT '', blockers TEXT NOT NULL DEFAULT '', target_date TEXT, source_threads TEXT NOT NULL DEFAULT '[]', tags TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS project_tasks (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, project_id INTEGER NOT NULL REFERENCES project_items(id) ON DELETE CASCADE, title TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'planned', progress INTEGER, owner TEXT NOT NULL DEFAULT 'אדיר', sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS project_tasks_project_idx ON project_tasks(project_id);
    CREATE TABLE IF NOT EXISTS project_notes (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, project_id INTEGER NOT NULL REFERENCES project_items(id) ON DELETE CASCADE, body TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'open', actor_email TEXT NOT NULL, actor_name TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS project_notes_project_idx ON project_notes(project_id);
    CREATE TABLE IF NOT EXISTS project_workspace_meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL, updated_at TEXT NOT NULL);
  `);
}

async function seedIfEmpty() {
  const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM project_items").first<{ total: number }>();
  if (Number(count?.total || 0) > 0) return;
  const now = new Date().toISOString();
  for (const project of initialProjects) {
    const result = await env.DB.prepare("INSERT INTO project_items (name, description, area, status, progress, progress_source, priority, owner, collaborators, current_phase, next_action, blockers, source_threads, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(project.name, project.description, project.area, project.status, project.progress, project.progressSource, project.priority, project.owner, json(project.collaborators), project.currentPhase, project.nextAction, project.blockers, json(project.sourceThreads), json(project.tags), now, now).run();
    const projectId = Number(result.meta.last_row_id);
    for (let index = 0; index < project.tasks.length; index += 1) {
      const [title, status, progress, owner] = project.tasks[index];
      await env.DB.prepare("INSERT INTO project_tasks (project_id, title, status, progress, owner, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(projectId, title, status, progress, owner, index, now, now).run();
    }
  }
}

async function syncProjectKnowledge() {
  const version = "2026-08-08-v2";
  const current = await env.DB.prepare("SELECT value FROM project_workspace_meta WHERE key = 'knowledge_version'").first<{ value: string }>();
  if (current?.value === version) return;
  const now = new Date().toISOString();
  for (const project of initialProjects) {
    const existing = await env.DB.prepare("SELECT id FROM project_items WHERE name = ? LIMIT 1").bind(project.name).first<{ id: number }>();
    if (!existing) continue;
    const taskCount = await env.DB.prepare("SELECT COUNT(*) AS total FROM project_tasks WHERE project_id = ?").bind(existing.id).first<{ total: number }>();
    if (Number(taskCount?.total || 0) === 0) {
      for (let index = 0; index < project.tasks.length; index += 1) {
        const [title, status, progress, owner] = project.tasks[index];
        await env.DB.prepare("INSERT INTO project_tasks (project_id, title, status, progress, owner, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
          .bind(existing.id, title, status, progress, owner, index, now, now).run();
      }
    }
    await env.DB.prepare("UPDATE project_items SET current_phase = ?, next_action = ?, blockers = ?, tags = ?, updated_at = ? WHERE id = ?")
      .bind(project.currentPhase, project.nextAction, project.blockers, json(project.tags), now, existing.id).run();
  }
  await env.DB.prepare("INSERT INTO project_workspace_meta (key, value, updated_at) VALUES ('knowledge_version', ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at")
    .bind(version, now).run();
}

async function authorize() {
  const admin = await getAuthorizedAdmin();
  if (!admin) return { response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  if (admin.role !== "owner") return { response: Response.json({ error: "Forbidden" }, { status: 403 }) };
  return { admin };
}

export async function GET() {
  const access = await authorize(); if (access.response) return access.response;
  await ensureTables(); await seedIfEmpty(); await syncProjectKnowledge();
  const [projects, tasks, notes] = await Promise.all([
    getDb().select().from(projectItems).orderBy(asc(projectItems.id)),
    getDb().select().from(projectTasks).orderBy(asc(projectTasks.sortOrder), asc(projectTasks.id)),
    getDb().select().from(projectNotes).orderBy(desc(projectNotes.createdAt), desc(projectNotes.id)),
  ]);
  return Response.json({ projects: projects.map((project) => ({ ...project, collaborators: parseList(project.collaborators), sourceThreads: parseList(project.sourceThreads), tags: parseList(project.tags), tasks: tasks.filter((task) => task.projectId === project.id), notes: notes.filter((note) => note.projectId === project.id) })) });
}

export async function POST(request: Request) {
  const access = await authorize(); if (access.response) return access.response;
  await ensureTables();
  const body = await request.json() as JsonRecord; const now = new Date().toISOString();
  if (body.kind === "task") {
    const projectId = Number(body.projectId); const title = String(body.title || "").trim();
    if (!Number.isInteger(projectId) || !title) return Response.json({ error: "Invalid task" }, { status: 400 });
    const [created] = await getDb().insert(projectTasks).values({ projectId, title, owner: String(body.owner || "אדיר"), status: "planned", createdAt: now, updatedAt: now }).returning();
    return Response.json({ task: created }, { status: 201 });
  }
  if (body.kind === "note") {
    const projectId = Number(body.projectId); const noteBody = String(body.body || "").trim();
    if (!Number.isInteger(projectId) || !noteBody) return Response.json({ error: "Invalid note" }, { status: 400 });
    const [created] = await getDb().insert(projectNotes).values({ projectId, body: noteBody.slice(0, 3000), state: body.state === "important" ? "important" : "open", actorEmail: access.admin!.email, actorName: access.admin!.displayName || "", createdAt: now, updatedAt: now }).returning();
    return Response.json({ note: created }, { status: 201 });
  }
  const name = String(body.name || "").trim();
  if (!name) return Response.json({ error: "Project name is required" }, { status: 400 });
  const [created] = await getDb().insert(projectItems).values({ name, description: String(body.description || ""), area: String(body.area || "development"), status: "planned", progress: null, progressSource: "unknown", priority: String(body.priority || "medium") as "critical" | "high" | "medium" | "low", owner: String(body.owner || "אדיר"), collaborators: "[]", currentPhase: "תכנון", nextAction: String(body.nextAction || "להגדיר את הצעד הראשון"), blockers: "", sourceThreads: "[]", tags: "[]", createdAt: now, updatedAt: now }).returning();
  return Response.json({ project: created }, { status: 201 });
}

export async function PATCH(request: Request) {
  const access = await authorize(); if (access.response) return access.response;
  await ensureTables(); const body = await request.json() as JsonRecord; const id = Number(body.id); const kind = body.kind === "task" ? "task" : body.kind === "note" ? "note" : "project";
  if (!Number.isInteger(id)) return Response.json({ error: "Invalid id" }, { status: 400 });
  const allowed = kind === "task" ? taskFields : kind === "note" ? noteFields : projectFields; const update: JsonRecord = { updatedAt: new Date().toISOString() };
  for (const [key, value] of Object.entries(body.changes as JsonRecord || {})) {
    if (!allowed.has(key)) continue;
    update[key] = key === "progress" ? clampProgress(value) : ["collaborators", "sourceThreads", "tags"].includes(key) ? json(value) : value;
  }
  if (kind === "task") await getDb().update(projectTasks).set(update).where(eq(projectTasks.id, id));
  else if (kind === "note") await getDb().update(projectNotes).set(update).where(eq(projectNotes.id, id));
  else await getDb().update(projectItems).set(update).where(eq(projectItems.id, id));
  await getDb().insert(cmsAuditLog).values({ actorEmail: access.admin!.email, action: `project.${kind}.updated`, entityType: kind, entityId: String(id), details: JSON.stringify(update), createdAt: new Date().toISOString() });
  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  const access = await authorize(); if (access.response) return access.response;
  await ensureTables();
  const body = await request.json() as JsonRecord;
  const id = Number(body.id);
  const kind = body.kind === "note" ? "note" : "task";
  if (!Number.isInteger(id)) return Response.json({ error: "Invalid id" }, { status: 400 });
  if (kind === "note") await getDb().delete(projectNotes).where(eq(projectNotes.id, id));
  else await getDb().delete(projectTasks).where(eq(projectTasks.id, id));
  await getDb().insert(cmsAuditLog).values({ actorEmail: access.admin!.email, action: `project.${kind}.deleted`, entityType: kind, entityId: String(id), details: "{}", createdAt: new Date().toISOString() });
  return Response.json({ success: true });
}
