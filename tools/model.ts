import type { IconVariant } from './config.ts';

/**
 * A single icon discovered on disk after the scan step. Immutable — every
 * pipeline stage returns a new object rather than mutating in place.
 */
export interface RawIcon {
  /** kebab-case icon name derived from the file name. */
  readonly name: string;
  readonly variant: IconVariant;
  /** kebab-case category derived from the containing folder. */
  readonly category: string;
  /** Absolute path to the source .svg file. */
  readonly filePath: string;
  /** Raw file contents. */
  readonly raw: string;
}

/**
 * A fully processed icon ready for code generation.
 */
export interface ProcessedIcon {
  readonly name: string;
  readonly variant: IconVariant;
  readonly category: string;
  /** viewBox attribute value, e.g. "0 0 24 24". */
  readonly viewBox: string;
  /** Inner SVG markup (no wrapping <svg>), colors normalized to currentColor. */
  readonly body: string;
  /** Stable content hash used for change detection and cache-busting. */
  readonly hash: string;
  /** camelCase export identifier, e.g. "arrowRightOutline". */
  readonly exportName: string;
}

export interface IconMetadata {
  readonly name: string;
  readonly variant: IconVariant;
  readonly category: string;
  readonly exportName: string;
  readonly hash: string;
  readonly tags: readonly string[];
}

export interface PipelineResult {
  readonly icons: readonly ProcessedIcon[];
  readonly errors: readonly PipelineError[];
  readonly durationMs: number;
}

export interface PipelineError {
  readonly filePath: string;
  readonly message: string;
}
