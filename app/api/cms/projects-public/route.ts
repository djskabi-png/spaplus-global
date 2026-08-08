import { env } from "cloudflare:workers";
import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { projectItems, projectTasks } from "../../../../db/schema";
const SHOWCASE_ORDER_KEY = "project_showcase_order";

function parseList(value: string) {
  try { return JSON.parse(value) as string[]; } catch { return []; }
}

function privateResponse(payload: unknown, init?: ResponseInit) {
  const response = Response.json(payload, init);
  response.headers.set("cache-control", "public, max-age=30, stale-while-revalidate=60");
  return response;
}

async function isInternalRequest(request: Request) {
  const expected = env.PROJECT_PORTAL_BACKEND_SECRET || "";
  const provided = request.headers.get("x-spaplus-portal-backend-token") || "";
  if (expected.length < 32 || provided.length < 32) return false;
  const [expectedHash, providedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(expected)),
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(provided)),
  ]);
  const subtle = crypto.subtle as SubtleCrypto & { timingSafeEqual(a: ArrayBufferView, b: ArrayBufferView): boolean };
  return subtle.timingSafeEqual(new Uint8Array(expectedHash), new Uint8Array(providedHash));
}

export async function GET(request: Request) {
  if (!(await isInternalRequest(request))) return privateResponse({ error: "Forbidden" }, { status: 403 });
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS project_workspace_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`).run();
  const [projects, tasks, orderRow] = await Promise.all([
    getDb().select().from(projectItems).where(eq(projectItems.publicVisible, true)).orderBy(asc(projectItems.id)),
    getDb().select().from(projectTasks).orderBy(asc(projectTasks.sortOrder), asc(projectTasks.id)),
    env.DB.prepare("SELECT value FROM project_workspace_meta WHERE key = ?").bind(SHOWCASE_ORDER_KEY).first<{ value: string }>(),
  ]);
  let order: number[] = [];
  try { order = (JSON.parse(orderRow?.value || "[]") as unknown[]).map(Number).filter(Number.isInteger); } catch { order = []; }
  const position = new Map(order.map((id, index) => [id, index]));
  projects.sort((left, right) => (position.get(left.id) ?? order.length + left.id) - (position.get(right.id) ?? order.length + right.id));
  const tasksByProject = new Map<number, typeof tasks>();
  for (const task of tasks) tasksByProject.set(task.projectId, [...(tasksByProject.get(task.projectId) || []), task]);
  return privateResponse({
    updatedAt: projects.reduce((latest, project) => project.updatedAt > latest ? project.updatedAt : latest, ""),
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      area: project.area,
      status: project.status,
      progress: project.progress,
      progressSource: project.progressSource,
      currentPhase: project.currentPhase,
      nextAction: project.nextAction,
      targetDate: project.targetDate,
      tags: parseList(project.tags),
      siteUrl: project.siteUrl,
      totalTasks: (tasksByProject.get(project.id) || []).length,
      completedTasks: (tasksByProject.get(project.id) || []).filter((task) => task.status === "done").length,
    })),
  });
}
