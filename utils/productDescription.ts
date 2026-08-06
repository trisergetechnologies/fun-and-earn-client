const HTML_BREAK = /<br\s*\/?>/gi;
const HTML_PARAGRAPH_BREAK = /<\/p>\s*<p[^>]*>/gi;
const HTML_TAGS = /<[^>]+>/g;
const EXCESS_NEWLINES = /\n{3,}/g;

const ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

function decodeBasicEntities(text: string): string {
  return text.replace(/&(?:nbsp|amp|lt|gt|quot|#39);/gi, (match) => {
    const key = match.toLowerCase();
    return ENTITY_MAP[key] ?? match;
  });
}

/** Normalize API description text for display; returns null when nothing meaningful to show. */
export function normalizeProductDescription(raw: unknown): string | null {
  if (raw == null) return null;

  let text = decodeBasicEntities(String(raw).trim());
  if (!text) return null;

  text = text
    .replace(HTML_BREAK, '\n')
    .replace(HTML_PARAGRAPH_BREAK, '\n\n')
    .replace(HTML_TAGS, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(EXCESS_NEWLINES, '\n\n')
    .trim();

  if (!text || text.toLowerCase() === 'null' || text.toLowerCase() === 'undefined') {
    return null;
  }

  return text;
}
