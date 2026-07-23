# @zellavora/icons

> Enterprise-grade Angular SVG icon ecosystem — signal-first, standalone, SSR-safe, and tree-shakeable to the last byte.

[![CI](https://github.com/zellavora/icons/actions/workflows/ci.yml/badge.svg)](https://github.com/zellavora/icons/actions/workflows/ci.yml)
![Angular](https://img.shields.io/badge/Angular-22-dd0031)
![Zero runtime deps](https://img.shields.io/badge/runtime%20deps-0-success)

`@zellavora/icons` is not just an icon pack. It is a complete, self-maintaining
pipeline: drop an SVG into the master folder and the registry, component
bindings, TypeScript types, exports, and metadata regenerate automatically —
deterministically, with zero hand-editing.

---

## Highlights

| Principle | How it is delivered |
| --- | --- |
| **Signal-first** | Every component input is a signal; all derived state is `computed`. No `RxJS`. |
| **Standalone-first** | `ZvIconComponent` is standalone; icons register via `provideZvIcons(...)`. |
| **SSR-first** | Pure in-memory registry, no HTTP, synchronous render → hydration-safe. |
| **Tree-shakeable** | One named export per icon + `"sideEffects": false`. You bundle only what you import. |
| **Zero runtime deps** | Only `@angular/core` and `@angular/common` peers. |
| **Self-maintaining** | A deterministic scan → validate → optimize → normalize → generate pipeline. |

---

## Installation

```bash
npm install @zellavora/icons
```

Peer requirements: Angular `>=22`.

---

## Quick start

Register only the icons you use, then render them anywhere:

```ts
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZvIcons } from '@zellavora/icons';
import { homeOutline, bellOutline, walletFilled } from '@zellavora/icons/generated';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [provideZvIcons(homeOutline, bellOutline, walletFilled)],
});
```

```ts
// app.ts
import { Component } from '@angular/core';
import { ZvIconComponent } from '@zellavora/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ZvIconComponent],
  template: `
    <zv-icon name="home" />
    <zv-icon name="bell" size="32" color="#0f766e" />
    <zv-icon name="wallet" filled />
    <zv-icon name="arrow-right" [spin]="true" title="Loading" />
  `,
})
export class App {}
```

Because only `homeOutline`, `bellOutline`, and `walletFilled` are imported, only
those three icons are bundled. Nothing else ships.

---

## Component API — `<zv-icon>`

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `name` *(required)* | `string` | — | Registered icon name, e.g. `"home"`. |
| `variant` | `ZvIconVariant` | `'outline'` | `outline · filled · rounded · sharp · duotone · brand · flag · emoji · animated`. |
| `size` | `number \| string` | `'1em'` | Shorthand for width + height. Numbers → `px`. |
| `width` / `height` | `number \| string` | `size` | Per-axis override. |
| `color` | `string` | inherit | Drives `currentColor`. |
| `strokeWidth` | `number \| string` | `2` | Stroke width for stroke-based variants. |
| `filled` | `boolean` | `false` | Shortcut for `variant="filled"`. |
| `rounded` | `boolean` | `false` | Shortcut for `variant="rounded"`. |
| `rotate` | `number` | `0` | Degrees of rotation. |
| `flip` | `'horizontal' \| 'vertical' \| 'both'` | — | Mirror the icon. |
| `spin` / `pulse` | `boolean` | `false` | CSS animations (respect `prefers-reduced-motion`). |
| `title` / `ariaLabel` | `string` | — | Promotes the icon to `role="img"` with a `<title>`. |
| `class` / `style` | native | — | Standard host bindings. |

### Accessibility by default

- **Decorative** (no label): `aria-hidden="true"`, `focusable="false"`.
- **Meaningful** (`title`/`ariaLabel` set): `role="img"`, `aria-label`, and an SVG `<title>`.

### Theming

Icons render with `currentColor`, so a single CSS `color` themes fill and stroke:

```css
.danger zv-icon { color: #dc2626; }
```

---

## The pipeline

The master SVG folder is the single source of truth:

```
icons/<variant>/<category>/<name>.svg
```

Running the generator executes a deterministic, repeatable pipeline:

```
scan → validate → optimize (SVGO) → normalize attrs → strip inline styles
     → currentColor → normalize stroke width → metadata → emit TS/registry/types
```

Every unchanged icon set produces byte-identical output — enforced in CI.

### Generated artifacts (`@zellavora/icons/generated`)

- `icons.ts` — one tree-shakeable `const` per icon (`homeOutline`, `walletFilled`, …).
- `icon-name.ts` — the `ZvIconName` string-literal union + `ZV_ICON_NAMES`.
- `registry.ts` — `ZV_ICON_REGISTRY` (full map; opt-in, for galleries).
- `metadata.ts` — `ZV_ICON_METADATA` (name, category, tags) for search.

---

## CLI

```bash
zv-icons generate   # run the full pipeline and write generated TypeScript
zv-icons optimize   # alias for generate (optimization is always applied)
zv-icons watch      # regenerate on any add/change/remove — no restart
zv-icons sync       # alias for generate
zv-icons build      # generate, then hint the ng-packagr build
zv-icons validate   # validate every SVG without writing output
zv-icons preview    # generate a searchable icon browser at docs/preview.html
zv-icons doctor     # diagnose toolchain + icon-set health
zv-icons stats      # counts per variant and category
```

Equivalent npm scripts: `icons:generate`, `icons:watch`, `icons:validate`,
`icons:preview`, `icons:doctor`, `icons:stats`.

`icons:generate` also emits `docs/icon-list.json` — a machine-readable metadata
index for external gallery/search tooling.

---

## Adding an icon

1. Drop `my-icon.svg` into `icons/outline/navigation/`.
2. `npm run icons:watch` (or `icons:generate` once).
3. Import `myIconOutline` from `@zellavora/icons/generated` and register it.

No component, registry, type, or export edits — ever.

---

## Development

```bash
npm ci
npm run icons:generate   # produce generated/lib (gitignored)
npm run lint
npm run typecheck
npm test
npm run build            # ng-packagr → dist/
```

See [`docs/`](./docs) for the [SSR guide](./docs/ssr.md),
[signals guide](./docs/signals.md), and [contributing](./docs/contributing.md).

---

## Releasing

Fully automated via [Semantic Versioning](https://semver.org):

1. Bump `version` in `package.json`.
2. Tag `vX.Y.Z` and push.
3. `release.yml` verifies the tag, builds, publishes to npm with provenance, and
   cuts a GitHub Release with an auto-generated changelog.

---

## License

MIT © Zellavora — see [LICENSE](./LICENSE).
