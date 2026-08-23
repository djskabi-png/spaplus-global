export function normalizeMetaFieldName(name: string) {
  return String(name ?? "")
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "");
}

export function findNormalizedMetaField(
  fields: Map<string, string>,
  names: string[],
) {
  const normalizedNames = names.map(normalizeMetaFieldName).filter(Boolean);
  for (const [key, value] of fields) {
    const normalizedKey = normalizeMetaFieldName(key);
    if (!normalizedKey) continue;
    if (
      normalizedNames.some(
        (name) => normalizedKey === name || normalizedKey.includes(name),
      )
    ) {
      return value;
    }
  }
  return "";
}
