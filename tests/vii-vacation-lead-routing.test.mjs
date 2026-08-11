import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("VII vacation joins are authenticated and archived under Vila4U", async () => {
  const route = await read("app/api/integrations/vii-leads/route.ts");

  assert.match(route, /VII_LEADS_SECRET/);
  assert.match(route, /x-vii-leads-secret/i);
  assert.match(route, /resourceKey: "business:vila4u:leads"/);
  assert.match(route, /Brand: \$\{sourceBrand\}/);
  assert.match(route, /"Website: VII"/);
  assert.match(route, /selectedWorld === "vacation"/);
  assert.match(route, /A valid customer email is required/);
  assert.match(route, /organization: organization \|\| name/);
  assert.match(route, /topic: worlds\[selectedWorld\]/);
});

test("VII vacation join emails use a paired idempotent Resend batch", async () => {
  const [route, templates] = await Promise.all([
    read("app/api/integrations/vii-leads/route.ts"),
    read("app/vii-lead-email-templates.ts"),
  ]);

  assert.match(route, /VII_JOIN_TO_EMAILS/);
  assert.doesNotMatch(route, /VII_JOIN_TO_EMAILS\)\s*\|\|\s*["''][^"'']+@/);
  assert.match(route, /api\.resend\.com\/emails\/batch/);
  assert.match(route, /Idempotency-Key/);
  assert.match(route, /vii-vacation-join-/);
  assert.match(route, /buildViiVacationOwnerEmail/);
  assert.match(route, /buildViiVacationVisitorEmail/);
  assert.match(route, /to: \[data\.email\]/);
  assert.match(route, /reply_to: data\.email/);
  assert.match(route, /emailDelivered: isVacationJoin/);

  assert.match(templates, /https:\/\/vii\.spaplus\.co\/vii-logo\.png/);
  assert.match(templates, /font-family:Rubik,Heebo,Arial,sans-serif/);
  assert.match(templates, /מרכז הלידים של וילה פור יו/);
  assert.match(templates, /אין חיוב ואין התחייבות/);
});
