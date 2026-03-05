// 超轻量“同义词/上位词”扩展：解决“平板 vs iPad”这种情况
// 后续可以改成从数据库表维护
const SYNONYMS = new Map([
  ["平板", ["ipad", "iPad", "IPAD", "tablet", "pad", "平板电脑"]],
  ["ipad", ["平板", "tablet", "pad"]],
  ["雨伞", ["伞", "太阳伞", "遮阳伞"]],
  ["伞", ["雨伞", "太阳伞", "遮阳伞"]],
]);

function expandQuery(q) {
  if (!q) return [];
  const raw = String(q).trim();
  if (!raw) return [];

  const tokens = raw
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const expanded = new Set();
  for (const t of tokens) {
    expanded.add(t);
    const lower = t.toLowerCase();
    expanded.add(lower);
    const extra =
      SYNONYMS.get(t) || SYNONYMS.get(lower) || SYNONYMS.get(t.toUpperCase());
    if (extra) extra.forEach((x) => expanded.add(x));
  }
  return [...expanded].filter(Boolean);
}

module.exports = { expandQuery };

