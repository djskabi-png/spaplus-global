import { env } from "cloudflare:workers";

const PASSWORD_KEY = "project_portal_password";
const PBKDF2_ITERATIONS = 210_000;
const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function derivePassword(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const saltBuffer = Uint8Array.from(salt).buffer;
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltBuffer, iterations }, key, 256);
  return new Uint8Array(bits);
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  const subtle = crypto.subtle as SubtleCrypto & { timingSafeEqual(a: ArrayBufferView, b: ArrayBufferView): boolean };
  return subtle.timingSafeEqual(Uint8Array.from(left), Uint8Array.from(right));
}

export async function ensureProjectMetaTable() {
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS project_workspace_meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL, updated_at TEXT NOT NULL)").run();
}

export async function isProjectPasswordConfigured() {
  await ensureProjectMetaTable();
  const row = await env.DB.prepare("SELECT value FROM project_workspace_meta WHERE key = ?").bind(PASSWORD_KEY).first<{ value: string }>();
  return Boolean(row?.value);
}

export async function setProjectPassword(password: string) {
  if (password.length < 8 || password.length > 128) throw new Error("Password length is invalid");
  await ensureProjectMetaTable();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePassword(password, salt, PBKDF2_ITERATIONS);
  const value = JSON.stringify({ algorithm: "PBKDF2-SHA256", iterations: PBKDF2_ITERATIONS, salt: toBase64(salt), hash: toBase64(hash) });
  const now = new Date().toISOString();
  await env.DB.prepare("INSERT INTO project_workspace_meta (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at")
    .bind(PASSWORD_KEY, value, now).run();
}

export async function verifyProjectPassword(password: string) {
  if (!password || password.length > 128) return false;
  await ensureProjectMetaTable();
  const row = await env.DB.prepare("SELECT value FROM project_workspace_meta WHERE key = ?").bind(PASSWORD_KEY).first<{ value: string }>();
  if (!row?.value) return false;
  try {
    const stored = JSON.parse(row.value) as { iterations: number; salt: string; hash: string };
    const expected = fromBase64(stored.hash);
    const actual = await derivePassword(password, fromBase64(stored.salt), Number(stored.iterations));
    return constantTimeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function normalizeProjectUrl(value: unknown) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}
