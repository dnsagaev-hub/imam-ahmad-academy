/**
 * Есть ли в тексте редактора (Lexical) что-то видимое. Если владелец стёр весь текст в админке, редактор
 * сохраняет не пустоту, а «пустой абзац» — без этой проверки на сайте оставался заголовок без содержания.
 */
type Node = { type?: string; text?: string; children?: Node[] };

const VISIBLE = new Set([
  "upload",
  "relationship",
  "horizontalrule",
  "block",
  "inlineBlock",
]);

function visible(n: Node | undefined): boolean {
  if (!n || typeof n !== "object") return false;
  if (typeof n.text === "string" && n.text.trim()) return true;
  if (n.type && VISIBLE.has(n.type)) return true;
  return Array.isArray(n.children) && n.children.some(visible);
}

export function hasRichText(data: unknown): boolean {
  return Boolean(
    data && typeof data === "object" && visible((data as { root?: Node }).root),
  );
}
