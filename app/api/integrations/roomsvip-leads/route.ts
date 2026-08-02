import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { formSubmissions } from "../../../../db/schema";

type RoomsVipLead = {
  leadId?: string;
  createdAt?: string;
  name?: string;
  phone?: string;
  email?: string;
  propertyType?: string;
  propertyLocation?: string;
  platform?: string;
  campaignName?: string;
  adName?: string;
  isTest?: boolean;
};

function authorized(request: Request) {
  const expected = process.env.ROOMSVIP_LEADS_WEBHOOK_SECRET || "";
  const received = request.headers.get("x-roomsvip-webhook-secret") || "";
  return expected.length >= 24 && received === expected;
}

function normalizeCreatedAt(value: string | undefined) {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function clean(value: unknown) {
  return String(value || "").trim();
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { leads?: RoomsVipLead[] } | RoomsVipLead;
  const leads = Array.isArray((body as { leads?: RoomsVipLead[] }).leads)
    ? (body as { leads: RoomsVipLead[] }).leads
    : [body as RoomsVipLead];

  if (leads.length === 0 || leads.length > 100) {
    return Response.json({ error: "Invalid batch" }, { status: 400 });
  }

  const db = getDb();
  let inserted = 0;
  let duplicates = 0;
  let skipped = 0;

  for (const lead of leads) {
    const leadId = clean(lead.leadId).replace(/^l:/, "");
    const name = clean(lead.name);
    const email = clean(lead.email).toLowerCase();
    const phone = clean(lead.phone).replace(/^p:/, "");

    if (!leadId || !name || (!email && !phone)) {
      skipped += 1;
      continue;
    }

    const submissionId = `roomsvip:${leadId}`;
    const [existing] = await db
      .select({ id: formSubmissions.id })
      .from(formSubmissions)
      .where(eq(formSubmissions.submissionId, submissionId))
      .limit(1);

    if (existing) {
      duplicates += 1;
      continue;
    }

    const propertyType = clean(lead.propertyType).replaceAll("_", " ");
    const propertyLocation = clean(lead.propertyLocation);
    const platform = clean(lead.platform);
    const campaignName = clean(lead.campaignName);
    const adName = clean(lead.adName);

    await db.insert(formSubmissions).values({
      submissionId,
      formType: lead.isTest ? "rooms-vip-owner-lead-test" : "rooms-vip-owner-lead",
      name,
      email,
      phone,
      organization: propertyLocation,
      topic: propertyType,
      message: [
        lead.isTest && "Lead type: Test lead",
        propertyType && `Property type: ${propertyType}`,
        propertyLocation && `Property and city: ${propertyLocation}`,
        platform && `Platform: ${platform}`,
        campaignName && `Campaign: ${campaignName}`,
        adName && `Ad: ${adName}`,
      ]
        .filter(Boolean)
        .join("\n"),
      locale: "he",
      source: "Meta | RoomsVIP | Property owners",
      resourceKey: "business:vila4u:leads",
      status: "new",
      createdAt: normalizeCreatedAt(lead.createdAt),
    });
    inserted += 1;
  }

  return Response.json({ success: true, inserted, duplicates, skipped });
}
