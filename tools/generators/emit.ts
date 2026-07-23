import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { AUTOGEN_BANNER, GENERATED_DIR, ROOT } from '../config.ts';
import type { IconMetadata, ProcessedIcon } from '../model.ts';

function registryKey(icon: ProcessedIcon): string {
  return `${icon.variant}/${icon.name}`;
}

function serialize(value: unknown): string {
  return JSON.stringify(value);
}

/** Emit one tree-shakeable const per icon plus a typed definition import. */
function renderIconsModule(icons: readonly ProcessedIcon[]): string {
  const body = icons
    .map(
      (icon) =>
        `export const ${icon.exportName}: ZvIconDefinition = {\n` +
        `  name: ${serialize(icon.name)},\n` +
        `  variant: ${serialize(icon.variant)},\n` +
        `  category: ${serialize(icon.category)},\n` +
        `  viewBox: ${serialize(icon.viewBox)},\n` +
        `  body: ${serialize(icon.body)},\n` +
        `};`,
    )
    .join('\n\n');

  return (
    AUTOGEN_BANNER +
    `import type { ZvIconDefinition } from '@zellavora/icons';\n\n` +
    body +
    '\n'
  );
}

/** Emit the string-literal union of every icon name for IntelliSense. */
function renderNamesModule(icons: readonly ProcessedIcon[]): string {
  const names = [...new Set(icons.map((i) => i.name))].sort();
  const union = names.length ? names.map((n) => `  | ${serialize(n)}`).join('\n') : '  | never';
  return (
    AUTOGEN_BANNER +
    `export type ZvIconName =\n${union};\n\n` +
    `export const ZV_ICON_NAMES = ${serialize(names)} as const;\n`
  );
}

/** Emit the full runtime registry keyed by "variant/name" (opt-in import). */
function renderRegistryModule(icons: readonly ProcessedIcon[]): string {
  const imports = icons.map((i) => i.exportName).join(', ');
  const entries = icons
    .map((icon) => `  ${serialize(registryKey(icon))}: ${icon.exportName},`)
    .join('\n');
  return (
    AUTOGEN_BANNER +
    `import type { ZvIconDefinition } from '@zellavora/icons';\n` +
    `import { ${imports} } from './icons';\n\n` +
    `export const ZV_ICON_REGISTRY: Readonly<Record<string, ZvIconDefinition>> = {\n` +
    `${entries}\n};\n`
  );
}

function renderMetadataModule(metadata: readonly IconMetadata[]): string {
  return (
    AUTOGEN_BANNER +
    `import type { ZvIconMetadata } from '@zellavora/icons';\n\n` +
    `export const ZV_ICON_METADATA: readonly ZvIconMetadata[] = ${serialize(metadata)};\n`
  );
}

function renderIndexModule(): string {
  return (
    AUTOGEN_BANNER +
    `export * from './icons';\n` +
    `export * from './icon-name';\n` +
    `export * from './registry';\n` +
    `export * from './metadata';\n`
  );
}

/**
 * Steps 10-12 — Generate registry, exports and typings. Writes deterministically
 * so an unchanged icon set produces byte-identical output (CI-friendly).
 */
export async function emitGeneratedFiles(
  icons: readonly ProcessedIcon[],
  metadata: readonly IconMetadata[],
): Promise<string[]> {
  await rm(GENERATED_DIR, { recursive: true, force: true });
  await mkdir(GENERATED_DIR, { recursive: true });

  const files: Array<[string, string]> = [
    ['icons.ts', renderIconsModule(icons)],
    ['icon-name.ts', renderNamesModule(icons)],
    ['registry.ts', renderRegistryModule(icons)],
    ['metadata.ts', renderMetadataModule(metadata)],
    ['index.ts', renderIndexModule()],
  ];

  await Promise.all(files.map(([name, content]) => writeFile(join(GENERATED_DIR, name), content)));

  // Machine-readable metadata for external tooling (gallery, search indexes).
  const docsDir = join(ROOT, 'docs');
  await mkdir(docsDir, { recursive: true });
  await writeFile(join(docsDir, 'icon-list.json'), JSON.stringify(metadata, null, 2) + '\n');

  return files.map(([name]) => name);
}
