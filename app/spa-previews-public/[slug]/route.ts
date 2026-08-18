import { getSpaPreviewBySlug } from "../../spa-preview";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Context) {
  const { slug } = await context.params;
  const preview = await getSpaPreviewBySlug(slug);
  if (!preview || preview.status !== "shared") return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(
    { preview },
    { headers: { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } },
  );
}
