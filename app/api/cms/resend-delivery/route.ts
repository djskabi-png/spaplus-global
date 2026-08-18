import { env } from "cloudflare:workers";
import { getAuthorizedAdmin } from "../../../admin-auth";
import { cmsResources, hasPermission } from "../../../cms-access";

const runtimeEnv = env as unknown as Record<string, string | undefined>;
const setting = (name: string) => runtimeEnv[name] || process.env[name] || "";
const MAX_IDS = 25;
const RESEND_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function maskRecipient(value: unknown) {
  const email = String(value || "").trim().toLowerCase();
  const at = email.indexOf("@");
  if (at < 1 || at === email.length - 1) return null;
  return `${email[0]}***${email.slice(at)}`;
}

function hasLeadManagement(admin: NonNullable<Awaited<ReturnType<typeof getAuthorizedAdmin>>>) {
  return admin.role === "owner" || cmsResources.some((resource) =>
    hasPermission(admin.role, admin.permissions, resource.key, "manageLeads"),
  );
}

export async function GET(request: Request) {
  const admin = await getAuthorizedAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasLeadManagement(admin)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const rawIds = new URL(request.url).searchParams.getAll("id")
    .flatMap((value) => value.split(",").map((item) => item.trim()).filter(Boolean));
  const ids = [...new Set(rawIds)];
  if (ids.length === 0 || ids.length > MAX_IDS || ids.some((id) => !RESEND_ID.test(id))) {
    return Response.json({ error: `Provide 1-${MAX_IDS} valid Resend IDs` }, { status: 400 });
  }
  const apiKey = setting("RESEND_API_KEY").trim();
  if (!apiKey) return Response.json({ error: "Delivery provider is not configured" }, { status: 503 });

  const results = await Promise.all(ids.map(async (id) => {
    const response = await fetch(`https://api.resend.com/emails/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${apiKey}`, accept: "application/json" },
    });
    if (!response.ok) return { id, last_event: "lookup_failed", created_at: null, recipient: null };
    const body = await response.json().catch(() => ({})) as {
      id?: string; last_event?: string; created_at?: string; to?: unknown[];
    };
    return {
      id: body.id === id ? id : id,
      last_event: typeof body.last_event === "string" ? body.last_event : "unknown",
      created_at: typeof body.created_at === "string" ? body.created_at : null,
      recipient: Array.isArray(body.to) ? body.to.map(maskRecipient).filter(Boolean) : [],
    };
  }));

  return Response.json({ results }, { headers: { "cache-control": "private, no-store" } });
}
