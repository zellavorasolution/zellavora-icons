import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT } from '../config.ts';
import type { ProcessedIcon } from '../model.ts';

const STROKE_VARIANTS = new Set(['outline', 'rounded', 'sharp']);

/** Wrap a normalized body into a full, themeable <svg> mirroring the component. */
function renderSvg(icon: ProcessedIcon): string {
  const stroke = STROKE_VARIANTS.has(icon.variant);
  const attrs = stroke
    ? `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`
    : `fill="currentColor"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.viewBox}" width="28" height="28" ${attrs} aria-hidden="true">${icon.body}</svg>`;
}

/**
 * Generate a self-contained, searchable icon browser at docs/preview.html.
 * Zero external requests — every SVG is inlined, matching how the runtime ships.
 */
export async function emitPreview(icons: readonly ProcessedIcon[]): Promise<string> {
  const cards = icons
    .map(
      (icon) =>
        `<figure class="card" data-search="${icon.name} ${icon.category} ${icon.variant}">` +
        renderSvg(icon) +
        `<figcaption><b>${icon.name}</b><span>${icon.variant} · ${icon.category}</span></figcaption>` +
        `</figure>`,
    )
    .join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>@zellavora/icons — preview</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 15px/1.5 system-ui, sans-serif; margin: 0; padding: 24px; }
  header { display: flex; gap: 16px; align-items: baseline; flex-wrap: wrap; margin-bottom: 20px; }
  h1 { font-size: 18px; margin: 0; }
  .count { opacity: .6; }
  input { flex: 1 1 240px; padding: 10px 14px; font-size: 15px; border: 1px solid #8884; border-radius: 10px; background: transparent; color: inherit; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
  .card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 8px; border: 1px solid #8883; border-radius: 12px; text-align: center; }
  .card svg { color: currentColor; }
  figcaption { display: flex; flex-direction: column; }
  figcaption b { font-size: 13px; }
  figcaption span { font-size: 11px; opacity: .6; }
  .hidden { display: none; }
</style>
</head>
<body>
<header>
  <h1>@zellavora/icons</h1>
  <span class="count" id="count">${icons.length} icons</span>
  <input id="q" type="search" placeholder="Search by name, category, or variant…" autofocus />
</header>
<div class="grid" id="grid">
${cards}
</div>
<script>
  const q = document.getElementById('q');
  const cards = [...document.querySelectorAll('.card')];
  const count = document.getElementById('count');
  q.addEventListener('input', () => {
    const term = q.value.trim().toLowerCase();
    let shown = 0;
    for (const card of cards) {
      const match = card.dataset.search.includes(term);
      card.classList.toggle('hidden', !match);
      if (match) shown++;
    }
    count.textContent = shown + ' icons';
  });
</script>
</body>
</html>
`;

  const dir = join(ROOT, 'docs');
  await mkdir(dir, { recursive: true });
  const out = join(dir, 'preview.html');
  await writeFile(out, html);
  return out;
}
