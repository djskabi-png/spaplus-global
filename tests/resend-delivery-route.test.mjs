import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const route = await readFile(new URL("../app/api/cms/delivery-status/route.ts", import.meta.url), "utf8");

test("Resend delivery lookup requires lead-management authorization", () => {
  assert.match(route, /getAuthorizedAdmin/);
  assert.match(route, /manageLeads/);
  assert.match(route, /status: 401/);
  assert.match(route, /status: 403/);
});

test("Resend delivery lookup validates and limits provider IDs", () => {
  assert.match(route, /MAX_IDS = 25/);
  assert.match(route, /RESEND_ID = \//);
  assert.match(route, /ids\.length > MAX_IDS/);
  assert.match(route, /encodeURIComponent\(id\)/);
});

test("Resend delivery lookup uses the server secret and never returns message content", () => {
  assert.match(route, /RESEND_API_KEY/);
  assert.match(route, /Authorization: `Bearer \$\{apiKey\}`/);
  assert.match(route, /last_event/);
  assert.match(route, /created_at/);
  assert.match(route, /maskRecipient/);
  assert.doesNotMatch(route, /subject|html|text|body:/);
  assert.match(route, /cache-control.*private, no-store/);
});
