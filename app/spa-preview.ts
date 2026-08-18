import { desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { spaPreviews } from "../db/schema";

export type Treatment = {
  name: string;
  description: string;
  duration: string;
  price: string;
};

export type SpaPackage = {
  name: string;
  description: string;
  price: string;
};

export type SpaPreview = {
  id: number;
  slug: string;
  status: "draft" | "shared";
  language: "en" | "fr-CA";
  spaName: string;
  address: string;
  about: string;
  hours: string;
  treatments: Treatment[];
  spaPackage: SpaPackage;
  logoUrl: string;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
};

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function serializePreview(row: typeof spaPreviews.$inferSelect): SpaPreview {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status as SpaPreview["status"],
    language: row.language as SpaPreview["language"],
    spaName: row.spaName,
    address: row.address,
    about: row.about,
    hours: row.hours,
    treatments: parseJson<Treatment[]>(row.treatments, []),
    spaPackage: parseJson<SpaPackage>(row.spaPackage, { name: "", description: "", price: "" }),
    logoUrl: row.logoUrl,
    photoUrls: parseJson<string[]>(row.photoUrls, []),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getSpaPreviewBySlug(slug: string) {
  const [row] = await getDb().select().from(spaPreviews).where(eq(spaPreviews.slug, slug)).limit(1);
  return row ? serializePreview(row) : null;
}

export async function getRecruitmentPreviewBySlug(slug: string) {
  try {
    const response = await fetch(`https://spaplus-global-brand.adir-naor-7510.chatgpt.site/spa-previews-public/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json() as { preview?: SpaPreview };
      if (data.preview) return data.preview;
    }
  } catch {
    // The direct Worker database remains a safe fallback during deployment transitions.
  }
  return getSpaPreviewBySlug(slug);
}

export async function listSpaPreviews() {
  const rows = await getDb().select().from(spaPreviews).orderBy(desc(spaPreviews.updatedAt));
  return rows.map(serializePreview);
}
