import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "../db";
import { cmsUsers } from "../db/schema";
import {
  chatGPTSignInPath,
  getChatGPTUser,
  type ChatGPTUser,
} from "./chatgpt-auth";

export type AdminRole = "owner" | "editor" | "viewer";

export type AuthorizedAdmin = ChatGPTUser & {
  role: AdminRole;
};

function configuredOwners() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAuthorizedAdmin(): Promise<AuthorizedAdmin | null> {
  const identity = await getChatGPTUser();
  if (!identity) return null;

  const email = identity.email.trim().toLowerCase();
  if (configuredOwners().includes(email)) {
    await ensureOwner(identity);
    return { ...identity, email, role: "owner" };
  }

  const db = getDb();
  const [record] = await db
    .select()
    .from(cmsUsers)
    .where(and(eq(cmsUsers.email, email), eq(cmsUsers.status, "active")))
    .limit(1);

  if (!record) return null;

  await db
    .update(cmsUsers)
    .set({ lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(eq(cmsUsers.id, record.id));

  return { ...identity, email, role: record.role };
}

export async function requireAuthorizedAdmin(returnTo: string) {
  const identity = await getChatGPTUser();
  if (!identity) redirect(chatGPTSignInPath(returnTo));

  const admin = await getAuthorizedAdmin();
  if (!admin) redirect("/access-denied");
  return admin;
}

async function ensureOwner(identity: ChatGPTUser) {
  const db = getDb();
  const email = identity.email.trim().toLowerCase();
  const now = new Date().toISOString();
  await db
    .insert(cmsUsers)
    .values({
      email,
      displayName: identity.fullName || identity.displayName || "",
      role: "owner",
      status: "active",
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: cmsUsers.email,
      set: {
        displayName: identity.fullName || identity.displayName || "",
        role: "owner",
        status: "active",
        lastLoginAt: now,
        updatedAt: now,
      },
    });
}
