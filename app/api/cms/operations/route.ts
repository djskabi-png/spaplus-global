import { desc, inArray } from "drizzle-orm";
import { getDb } from "../../../../db";
import { formSubmissions } from "../../../../db/schema";
import { getAuthorizedAdmin } from "../../../admin-auth";
import { hasPermission } from "../../../cms-access";

type Scope = "global" | "ca" | "ca-on" | "il";
const permissionKeys: Record<Scope, string[]> = { global: ["ops:global"], ca: ["ops:global", "ops:ca"], "ca-on": ["ops:global", "ops:ca", "ops:ca:on"], il: ["ops:global", "ops:il"] };
const leadResources: Record<Scope, string[]> = { global: ["market:ca:on", "market:ca:national"], ca: ["market:ca:on", "market:ca:national"], "ca-on": ["market:ca:on"], il: [] };

export async function GET(request: Request) {
  const admin = await getAuthorizedAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const scope = new URL(request.url).searchParams.get("scope") as Scope;
  if (!permissionKeys[scope]) return Response.json({ error: "Invalid scope" }, { status: 400 });
  const allowed = admin.role === "owner" || permissionKeys[scope].some(key => hasPermission(admin.role, admin.permissions, key, "viewContent"));
  if (!allowed) return Response.json({ error: "Forbidden" }, { status: 403 });
  const resources = leadResources[scope];
  const rows = resources.length ? await getDb().select().from(formSubmissions).where(inArray(formSubmissions.resourceKey, resources)).orderBy(desc(formSubmissions.createdAt)).limit(500) : [];
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: scope === "il" ? "Asia/Jerusalem" : "America/Toronto" }).format(new Date());
  const isToday = (value: string) => new Intl.DateTimeFormat("en-CA", { timeZone: scope === "il" ? "Asia/Jerusalem" : "America/Toronto" }).format(new Date(value)) === today;
  return Response.json({
    scope,
    lastUpdated: new Date().toISOString(),
    intake: {
      total: rows.length,
      today: rows.filter(row => isToday(row.createdAt)).length,
      new: rows.filter(row => row.status === "new").length,
      inProgress: rows.filter(row => row.status === "in_progress").length,
      won: rows.filter(row => row.status === "won" || row.status === "closed").length,
      irrelevant: rows.filter(row => row.status === "irrelevant" || row.status === "deleted").length,
    },
    recent: rows.slice(0, 12).map(row => ({ id: row.id, name: row.name, organization: row.organization, source: row.source, status: row.status, createdAt: row.createdAt })),
  }, { headers: { "cache-control": "private, no-store" } });
}
