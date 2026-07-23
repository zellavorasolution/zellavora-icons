/**
 * The complete set of icon variants supported by the ecosystem. Kept in sync
 * with the pipeline's `ICON_VARIANTS` constant by generated code + tests.
 */
export type ZvIconVariant =
  | 'outline'
  | 'filled'
  | 'rounded'
  | 'sharp'
  | 'duotone'
  | 'brand'
  | 'flag'
  | 'emoji'
  | 'animated';

/**
 * An immutable, fully-processed icon definition. The `body` is inner SVG markup
 * with all palette colors normalized to `currentColor`, so a single CSS `color`
 * themes the icon. This is the unit that is registered and rendered.
 */
export interface ZvIconDefinition {
  readonly name: string;
  readonly variant: ZvIconVariant;
  readonly category: string;
  /** viewBox attribute value, e.g. "0 0 24 24". */
  readonly viewBox: string;
  /** Inner SVG markup — no wrapping <svg> element. */
  readonly body: string;
}

/** Lightweight metadata used by tooling and the documentation gallery. */
export interface ZvIconMetadata {
  readonly name: string;
  readonly variant: ZvIconVariant;
  readonly category: string;
  readonly exportName: string;
  readonly hash: string;
  readonly tags: readonly string[];
}

/** Build the registry key used to look up a definition. */
export function iconKey(name: string, variant: ZvIconVariant): string {
  return `${variant}/${name}`;
}
