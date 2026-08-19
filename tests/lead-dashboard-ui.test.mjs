import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  isExplicitTestLead,
  leadCustomerMessage,
  leadLocation,
} from "../app/tools/lead-display.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("lead cards prioritize customer details and collapse secondary information", async () => {
  const [dashboard, helpers, styles] = await Promise.all([
    read("app/tools/SubmissionsClient.tsx"),
    read("app/tools/lead-display.mjs"),
    read("app/tools/leads.css"),
  ]);

  assert.match(helpers, /function leadLocation/);
  assert.match(helpers, /"City or region", "City", "Property and city", "Location"/);
  const locationHelper = helpers.match(/function leadLocation[\s\S]*?\n\}/)?.[0] || "";
  assert.doesNotMatch(locationHelper, /organization/);
  assert.match(helpers, /function leadCustomerMessage/);
  assert.match(helpers, /knownTechnicalFieldCount >= 2/);
  assert.match(helpers, /item\.isTest === true/);
  assert.match(helpers, /<test lead: dummy data for/);
  assert.match(dashboard, /operationalSubmissions/);
  assert.match(dashboard, /!isExplicitTestLead\(item\)/);
  assert.match(dashboard, /className="lead-customer-card"/);
  assert.match(dashboard, /className="lead-customer-facts"/);
  assert.match(dashboard, /className="lead-contact-actions"/);
  assert.match(dashboard, /className="lead-customer-message"/);
  assert.match(dashboard, /הצג מידע נוסף/);
  assert.match(dashboard, /טיפול בליד/);
  assert.match(dashboard, /aria-expanded=\{infoIsOpen\}/);
  assert.match(dashboard, /aria-controls=\{infoPanelId\}/);
  assert.match(dashboard, /aria-expanded=\{treatmentIsOpen\}/);
  assert.match(dashboard, /aria-controls=\{treatmentPanelId\}/);
  assert.match(dashboard, /infoIsOpen \? \(/);
  assert.match(dashboard, /treatmentIsOpen \? \(/);
  assert.match(dashboard, /className="lead-technical-panel"/);
  assert.match(dashboard, /item\.submissionId \|\| String\(item\.id\)/);

  assert.match(styles, /font-family: "SpaPlus Heebo Leads"/);
  assert.match(styles, /font-display: block/);
  assert.match(styles, /\.lead-card-grid[\s\S]*?grid-template-columns: minmax\(320px, \.82fr\) minmax\(0, 1\.18fr\)/);
  assert.match(styles, /\.lead-message-panel/);
  assert.match(styles, /\.lead-disclosure-button:focus-visible/);
  assert.match(styles, /@media \(max-width: 560px\)[\s\S]*?\.lead-customer-facts,[\s\S]*?grid-template-columns: 1fr/);
  assert.match(styles, /@media \(max-width: 560px\)[\s\S]*?\.lead-filters\.has-custom-range \{[\s\S]*?position: static;[\s\S]*?z-index: auto;/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});

test("explicit test leads are excluded without hiding real customer leads", () => {
  const leads = [
    { formType: "rooms-vip-owner-lead-test", message: "Lead type: Test lead" },
    { formType: "israel-meta-instant-form", message: "Lead type: Test lead\nBrand: SpaPlus" },
    { formType: "israel-meta-instant-form", message: "<test lead: dummy data for page>" },
    { formType: "israel-meta-instant-form", message: "Message: Please test the booking flow" },
    { formType: "contest-registration", message: "Campaign: contest launch\nMessage: Real spa owner" },
    { formType: "israel-meta-instant-form", message: "Message: Real customer" },
  ];

  assert.equal(isExplicitTestLead({ formType: "regular-form", message: "", isTest: true }), true);
  assert.equal(isExplicitTestLead(leads[0]), true);
  assert.equal(isExplicitTestLead(leads[1]), true);
  assert.equal(isExplicitTestLead(leads[2]), true);
  assert.equal(isExplicitTestLead(leads[3]), false);
  assert.equal(isExplicitTestLead(leads[4]), false);
  assert.equal(isExplicitTestLead(leads[5]), false);
  assert.equal(leads.filter((item) => !isExplicitTestLead(item)).length, 3);
});

test("lead display helpers preserve customer content and suppress technical-only payloads", () => {
  assert.equal(
    leadCustomerMessage({ message: "Company group: SpaPlus\nMessage: אשמח לשמוע פרטים\nBrand: SpaPlus Israel" }),
    "אשמח לשמוע פרטים",
  );
  assert.equal(
    leadCustomerMessage({ message: "אשמח להצטרף\nאפשר לחזור אליי בבוקר" }),
    "אשמח להצטרף\nאפשר לחזור אליי בבוקר",
  );
  assert.equal(
    leadCustomerMessage({ message: "Company group: SpaPlus\nBrand: SpaPlus Israel\nPlatform: Facebook" }),
    "",
  );
  assert.equal(
    leadCustomerMessage({ message: "Campaign: הטבה לקיץ\nבקשה: חזרו אליי" }),
    "Campaign: הטבה לקיץ\nבקשה: חזרו אליי",
  );
  assert.equal(leadLocation({ message: "Brand: SpaPlus\nCity or region: חיפה" }), "חיפה");
  assert.equal(leadLocation({ message: "Organization: חיפה ספא" }), "");
});
