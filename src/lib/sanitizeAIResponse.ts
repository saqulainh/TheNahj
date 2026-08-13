/**
 * sanitizeAIResponse
 *
 * Strips raw Markdown formatting from LLM output before rendering in the
 * TheNahj chat UI. The chat renders with `whitespace-pre-wrap` (plain text),
 * so Markdown symbols appear as ugly literal characters without this step.
 *
 * What is removed / converted:
 *   - Heading markers  : `# Heading` → `Heading`
 *   - Bold             : `**text**`  → `text`
 *   - Italic           : `*text*`    → `text`   (single asterisk, not list items)
 *   - Underline-bold   : `__text__`  → `text`
 *   - Underline-italic : `_text_`    → `text`
 *   - Horizontal rules : lines of only `---`, `***`, `___` → removed
 *   - Inline backticks : `code`      → `code`
 *
 * What is preserved:
 *   - Numbered lists  (1. 2. 3.)
 *   - Bullet lists    (- item)  — kept as-is, they are readable
 *   - Paragraph breaks / newlines
 *   - Arabic and Urdu text (untouched)
 *   - `#` that appears mid-line (URLs, colors, hashtags, etc.)
 */
export function sanitizeAIResponse(text: string): string {
  if (!text || typeof text !== "string") return "";

  const lines = text.split("\n");
  const processed = lines.map((line) => {
    // ── Horizontal rules: lines containing ONLY `---`, `***`, or `___` ──
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) return "";

    // ── Markdown headings: `# `, `## `, `### `, `#### ` at start of line ──
    // Only strip the leading # symbols, not # appearing mid-line (URLs etc.)
    line = line.replace(/^#{1,6}\s+/, "");

    return line;
  });

  // Re-join and run inline replacements on the full text
  let result = processed.join("\n");

  // ── Bold + Italic: `***text***` → `text` ──
  result = result.replace(/\*{3}([^*]+)\*{3}/g, "$1");

  // ── Bold: `**text**` → `text` ──
  result = result.replace(/\*{2}([^*]+)\*{2}/g, "$1");

  // ── Italic (asterisk): `*text*` → `text`
  // Guard: do NOT match `* text` bullet list items.
  // Only match when `*` is preceded by whitespace AND followed by a non-space char,
  // and the closing `*` is not at the start of a line.
  result = result.replace(/(\s)\*([^*\n]+)\*/g, "$1$2");

  // ── Bold (underscore): `__text__` → `text` ──
  result = result.replace(/__([^_]+)__/g, "$1");

  // ── Italic (underscore): `_text_` → `text` ──
  // Guard: match only when preceded by space/start and followed by space/end
  // This avoids breaking snake_case identifiers.
  result = result.replace(/(^|\s)_([^_]+)_(\s|$)/gm, "$1$2$3");

  // ── Inline backticks: `code` → code ──
  result = result.replace(/`([^`\n]+)`/g, "$1");

  // ── Collapse 3+ consecutive blank lines into 2 ──
  result = result.replace(/\n{3,}/g, "\n\n");

  return result.trim();
}
