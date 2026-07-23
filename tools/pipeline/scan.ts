import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { ICONS_SRC, isIconVariant } from '../config.ts';
import type { RawIcon } from '../model.ts';
import { toKebabCase } from '../util/naming.ts';

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return entry.isFile() && entry.name.endsWith('.svg') ? [full] : [];
    }),
  );
  return files.flat();
}

/**
 * Step 1 — Scan.
 * Discover every icon under icons/<variant>/<category>/<name>.svg.
 * The folder layout is the single source of truth for variant + category.
 */
export async function scanIcons(): Promise<RawIcon[]> {
  try {
    await stat(ICONS_SRC);
  } catch {
    return [];
  }

  const files = await walk(ICONS_SRC);
  const icons: RawIcon[] = [];

  for (const filePath of files) {
    const rel = relative(ICONS_SRC, filePath);
    const parts = rel.split(sep);
    if (parts.length < 3) {
      throw new Error(
        `Invalid icon path "${rel}". Expected icons/<variant>/<category>/<name>.svg`,
      );
    }
    const [variant, category, ...rest] = parts;
    if (!isIconVariant(variant)) {
      throw new Error(`Unknown variant "${variant}" in "${rel}".`);
    }
    const fileName = rest[rest.length - 1].replace(/\.svg$/, '');
    icons.push({
      name: toKebabCase(fileName),
      variant,
      category: toKebabCase(category),
      filePath,
      raw: await readFile(filePath, 'utf8'),
    });
  }

  return icons.sort((a, b) =>
    `${a.variant}/${a.name}`.localeCompare(`${b.variant}/${b.name}`),
  );
}
