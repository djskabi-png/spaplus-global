import { desc } from "drizzle-orm";
import { getDb } from "../../../../db";
import { formSubmissions } from "../../../../db/schema";
import { getAuthorizedAdmin } from "../../../admin-auth";

export async function GET() {
  const admin = await getAuthorizedAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const submissions = await getDb()
    .select()
    .from(formSubmissions)
    .orderBy(desc(formSubmissions.createdAt))
    .limit(200);
  return Response.json({ submissions });
}
