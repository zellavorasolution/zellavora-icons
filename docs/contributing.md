# Contributing

Thanks for helping grow the Zellavora icon system.

## Adding or changing an icon

1. Place the SVG at `icons/<variant>/<category>/<name>.svg`.
   - `variant` ∈ `outline · filled · rounded · sharp · duotone · brand · flag · emoji · animated`.
   - `name` and `category` must be kebab-case.
2. Author it on a 24×24 canvas with a `viewBox="0 0 24 24"`.
   - **Outline/rounded/sharp:** draw with strokes; the component supplies
     `fill="none" stroke="currentColor"`. Do not hard-code colors.
   - **Filled/duotone/brand:** draw with fills; colors are normalized to
     `currentColor` automatically.
3. Run `npm run icons:generate` (or keep `npm run icons:watch` running).
4. Run `npm run icons:validate` and `npm test`.

The pipeline strips inline styles, converts palette colors to `currentColor`,
normalizes stroke width, and regenerates all TypeScript — never edit anything
under `generated/`.

## Code standards

- Strict TypeScript, ESLint, and Prettier are enforced in CI (`npm run lint`,
  `npm run typecheck`, `npm run format:check`).
- One responsibility per file. No `TODO` placeholders.
- Tests accompany behavior changes (`tests/**/*.spec.ts`).

## Commit & release

- Use clear, imperative commit subjects — they become the changelog.
- Releases are automated: bump `package.json`, tag `vX.Y.Z`, push. The
  `release.yml` workflow validates, builds, and publishes.
