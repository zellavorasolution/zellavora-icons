import { optimize, type Config as SvgoConfig } from 'svgo';

/**
 * Step 3 — Optimize.
 * A deterministic SVGO configuration. We deliberately keep the viewBox and
 * disable id/color munging so downstream normalization is predictable.
 */
export const SVGO_CONFIG: SvgoConfig = {
  multipass: true,
  js2svg: { indent: 0, pretty: false },
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          // We convert colors to currentColor ourselves in the normalize step.
          convertColors: false,
          // Keep group structure meaningful for duotone icons.
          collapseGroups: false,
          cleanupIds: { remove: false },
        },
      },
    },
    { name: 'removeDimensions' },
    { name: 'sortAttrs' },
  ],
};

/** Optimize a raw SVG string. Deterministic for a given input. */
export function optimizeSvg(raw: string): string {
  const result = optimize(raw, SVGO_CONFIG);
  return result.data;
}
