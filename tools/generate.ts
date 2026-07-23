import type { IconMetadata, PipelineError, PipelineResult, ProcessedIcon } from './model.ts';
import { scanIcons } from './pipeline/scan.ts';
import { validateIcon } from './pipeline/validate.ts';
import { optimizeSvg } from './pipeline/optimize.ts';
import { normalizeIcon } from './pipeline/normalize.ts';
import { buildMetadata } from './pipeline/metadata.ts';
import { emitGeneratedFiles } from './generators/emit.ts';

export interface GenerateOptions {
  /** When true, run every stage except writing files. */
  readonly dryRun?: boolean;
}

/**
 * Orchestrates the full, deterministic pipeline:
 * scan → validate → optimize → normalize → metadata → emit.
 */
export async function runPipeline(options: GenerateOptions = {}): Promise<PipelineResult> {
  const start = performance.now();
  const raw = await scanIcons();

  const processed: ProcessedIcon[] = [];
  const metadata: IconMetadata[] = [];
  const errors: PipelineError[] = [];

  for (const icon of raw) {
    const issues = validateIcon(icon);
    if (issues.length) {
      errors.push(...issues.map((i) => ({ filePath: i.filePath, message: i.message })));
      continue;
    }
    try {
      const optimized = optimizeSvg(icon.raw);
      const normalized = normalizeIcon(icon, optimized);
      processed.push(normalized);
      metadata.push(buildMetadata(normalized));
    } catch (error) {
      errors.push({
        filePath: icon.filePath,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (!options.dryRun && errors.length === 0) {
    await emitGeneratedFiles(processed, metadata);
  }

  return {
    icons: processed,
    errors,
    durationMs: Math.round(performance.now() - start),
  };
}
