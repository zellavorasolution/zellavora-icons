import { createHash } from 'node:crypto';
import { CANONICAL_STROKE_WIDTH, CANONICAL_VIEWBOX } from '../config.ts';
import type { ProcessedIcon, RawIcon } from '../model.ts';
import { toExportName } from '../util/naming.ts';

const SVG_OPEN_RE = /<svg\b([^>]*)>/i;
const VIEWBOX_RE = /viewBox\s*=\s*"([^"]*)"/i;

function extractViewBox(svgOpenAttrs: string): string {
  const match = svgOpenAttrs.match(VIEWBOX_RE);
  return match ? match[1].trim() : CANONICAL_VIEWBOX;
}

function extractBody(svg: string): string {
  const withoutOpen = svg.replace(SVG_OPEN_RE, '');
  return withoutOpen.replace(/<\/svg>\s*$/i, '').trim();
}

/**
 * Steps 4-7 — Normalize attributes, strip inline styles, map palette colors to
 * `currentColor`, and normalize the stroke width. The goal is a body that is
 * fully themeable via CSS `color` with zero hard-coded palette.
 */
function normalizeBody(body: string): string {
  return (
    body
      // Remove inline style attributes entirely — theming is CSS-driven.
      .replace(/\sstyle\s*=\s*"[^"]*"/gi, '')
      // Any explicit fill that is not "none" becomes currentColor.
      .replace(/fill\s*=\s*"(?!none")[^"]*"/gi, 'fill="currentColor"')
      // Any explicit stroke that is not "none" becomes currentColor.
      .replace(/stroke\s*=\s*"(?!none")[^"]*"/gi, 'stroke="currentColor"')
      // Normalize stroke width to the canonical value.
      .replace(/stroke-width\s*=\s*"[^"]*"/gi, `stroke-width="${CANONICAL_STROKE_WIDTH}"`)
      .replace(/\s{2,}/g, ' ')
      .trim()
  );
}

function hashContent(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 12);
}

/**
 * Steps 4-9 — Produce the final immutable ProcessedIcon from an optimized SVG.
 */
export function normalizeIcon(icon: RawIcon, optimized: string): ProcessedIcon {
  const openMatch = optimized.match(SVG_OPEN_RE);
  const viewBox = openMatch ? extractViewBox(openMatch[1]) : CANONICAL_VIEWBOX;
  const body = normalizeBody(extractBody(optimized));
  const hash = hashContent(`${viewBox}|${body}`);

  return {
    name: icon.name,
    variant: icon.variant,
    category: icon.category,
    viewBox,
    body,
    hash,
    exportName: toExportName(icon.name, icon.variant),
  };
}
