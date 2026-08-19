/**
 * @typedef {{ formType: string, message: string, isTest?: boolean }} LeadDisplayInput
 */

/**
 * @param {Pick<LeadDisplayInput, "message">} item
 * @param {string} label
 */
export function taggedValue(item, label) {
  return item.message.match(new RegExp(`^${label}:\\s*([^\\n]+)`, "im"))?.[1]?.trim() || "";
}

/**
 * Only explicit machine-readable test markers are accepted. Ordinary customer
 * text containing the word "test" must stay in the operational pipeline.
 *
 * @param {LeadDisplayInput} item
 */
export function isExplicitTestLead(item) {
  const formType = item.formType.trim().toLowerCase();
  const leadType = taggedValue(item, "Lead type").toLowerCase();
  const hasExplicitTestFormToken = /(^|[-_:])test($|[-_:])/.test(formType);
  const isMetaDummySentinel = item.message.toLowerCase().includes("<test lead: dummy data for");
  return item.isTest === true
    || hasExplicitTestFormToken
    || leadType === "test lead"
    || isMetaDummySentinel;
}

/**
 * @param {Pick<LeadDisplayInput, "message">} item
 */
export function leadLocation(item) {
  return ["City or region", "City", "Property and city", "Location"]
    .map((label) => taggedValue(item, label))
    .find(Boolean) || "";
}

/**
 * @param {Pick<LeadDisplayInput, "message">} item
 */
export function leadCustomerMessage(item) {
  const taggedMessage = taggedValue(item, "Message");
  if (taggedMessage && !/^no additional message$/i.test(taggedMessage)) return taggedMessage;

  const lines = item.message.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const knownTechnicalFieldCount = lines.filter((line) =>
    /^(Company group|Brand|Source channel|Lead purpose|World|Campaign|Platform|Meta |Lead type):/i.test(line),
  ).length;
  const looksStructured = knownTechnicalFieldCount >= 2
    && lines.every((line) => /^[^:\n]{1,80}:\s*.+$/.test(line));
  return looksStructured ? "" : item.message.trim();
}
