import type { IconMetadata, ProcessedIcon } from '../model.ts';

/**
 * Step 8 — Generate metadata. Search tags are derived from the name, category
 * and variant so the documentation gallery search works with zero manual input.
 */
export function buildMetadata(icon: ProcessedIcon): IconMetadata {
  const tags = [...new Set([...icon.name.split('-'), icon.category, icon.variant])].sort();
  return {
    name: icon.name,
    variant: icon.variant,
    category: icon.category,
    exportName: icon.exportName,
    hash: icon.hash,
    tags,
  };
}
