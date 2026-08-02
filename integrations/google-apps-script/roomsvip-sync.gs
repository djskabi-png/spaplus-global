const ROOMSVIP_SPREADSHEET_ID = "1HBXtIpCmCJcBEL-dNIaIWI4PsvjUe2EX3stKTGtFm-E";
const ROOMSVIP_SOURCE_SHEET = "גיליון1";
const ROOMSVIP_ENDPOINT = "https://app.spaplus.co/api/integrations/roomsvip-leads";
const ROOMSVIP_SECRET_PROPERTY = "ROOMSVIP_LEADS_WEBHOOK_SECRET";
const ROOMSVIP_LAST_SUCCESS_PROPERTY = "ROOMSVIP_LAST_SUCCESS_AT";
const ROOMSVIP_OVERLAP_MS = 24 * 60 * 60 * 1000;
const ROOMSVIP_BATCH_SIZE = 100;

function syncRoomsVipLeads() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return;

  try {
    const properties = PropertiesService.getScriptProperties();
    const secret = properties.getProperty(ROOMSVIP_SECRET_PROPERTY);
    if (!secret || secret.length < 24) throw new Error("Missing RoomsVIP webhook secret");

    const sheet = SpreadsheetApp.openById(ROOMSVIP_SPREADSHEET_ID).getSheetByName(ROOMSVIP_SOURCE_SHEET);
    if (!sheet) throw new Error("RoomsVIP source sheet was not found");

    const values = sheet.getDataRange().getDisplayValues();
    const lastSuccess = properties.getProperty(ROOMSVIP_LAST_SUCCESS_PROPERTY);
    const cutoff = lastSuccess
      ? new Date(new Date(lastSuccess).getTime() - ROOMSVIP_OVERLAP_MS)
      : null;

    const leads = values
      .map(roomToRoomsVipLead_)
      .filter(Boolean)
      .filter((lead) => !cutoff || new Date(lead.createdAt) >= cutoff);

    for (let index = 0; index < leads.length; index += ROOMSVIP_BATCH_SIZE) {
      const response = UrlFetchApp.fetch(ROOMSVIP_ENDPOINT, {
        method: "post",
        contentType: "application/json",
        headers: { "x-roomsvip-webhook-secret": secret },
        payload: JSON.stringify({ leads: leads.slice(index, index + ROOMSVIP_BATCH_SIZE) }),
        muteHttpExceptions: true,
      });

      const status = response.getResponseCode();
      if (status < 200 || status >= 300) {
        throw new Error(`RoomsVIP sync failed with status ${status}: ${response.getContentText()}`);
      }
    }

    properties.setProperty(ROOMSVIP_LAST_SUCCESS_PROPERTY, new Date().toISOString());
  } finally {
    lock.releaseLock();
  }
}

function roomToRoomsVipLead_(row) {
  const leadId = String(row[0] || "").trim().replace(/^l:/, "");
  const createdAt = String(row[1] || "").trim();
  const formName = String(row[9] || "").trim();
  const propertyType = String(row[12] || "").trim();
  const propertyLocation = String(row[13] || "").trim();
  const email = String(row[14] || "").trim();
  const name = String(row[15] || "").trim();
  const phone = String(row[16] || "").trim().replace(/^p:/, "");

  if (!leadId || !createdAt || !formName.startsWith("RoomsVIP | בעלי מתחמים | 2026")) return null;
  if (!name || (!email && !phone)) return null;

  return {
    leadId,
    createdAt,
    name,
    phone,
    email,
    propertyType,
    propertyLocation,
    platform: String(row[11] || "").trim(),
    campaignName: String(row[7] || "").trim(),
    adName: String(row[3] || "").trim(),
    isTest: String(row[10] || "").trim().toLowerCase() === "true",
  };
}

function installRoomsVipMinuteTrigger() {
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === "syncRoomsVipLeads")
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger("syncRoomsVipLeads")
    .timeBased()
    .everyMinutes(1)
    .create();
}
