import { env } from "cloudflare:workers";
import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { projectItems, projectTasks } from "../../../../db/schema";
import { verifyProjectPassword } from "../../../project-access";

function parseList(value: string) {
  try { return JSON.parse(value) as string[]; } catch { return []; }
}

function privateResponse(payload: unknown, init?: ResponseInit) {
  const response = Response.json(payload, init);
  response.headers.set("cache-control", "private, no-store");
  response.headers.set("x-robots-tag", "noindex, nofollow");
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

export async function POST(request: Request) {
  if (!(await isInternalRequest(request))) return privateResponse({ error: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { password?: string };
  const valid = await verifyProjectPassword(String(body.password || ""));
  return valid ? privateResponse({ valid: true }) : privateResponse({ valid: false }, { status: 401 });
}

export async function GET(request: Request) {
  if (!(await isInternalRequest(request))) return privateResponse({ error: "Forbidden" }, { status: 403 });
  const projects = await getDb().select().from(projectItems).where(eq(projectItems.publicVisible, true)).orderBy(asc(projectItems.id));
  const tasks = await getDb().select().from(projectTasks).orderBy(asc(projectTasks.sortOrder), asc(projectTasks.id));
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
      priority: project.priority,
      owner: project.owner,
      collaborators: parseList(project.collaborators),
      currentPhase: project.currentPhase,
      nextAction: project.nextAction,
      blockers: project.blockers,
      targetDate: project.targetDate,
      tags: parseList(project.tags),
      siteUrl: project.siteUrl,
      tasks: tasksByProject.get(project.id) || [],
    })),
  });
}
