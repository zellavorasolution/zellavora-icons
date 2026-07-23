# SSR & Hydration guide

`@zellavora/icons` is SSR-first. There is nothing to configure — the design makes
server rendering and hydration correct by construction.

## Why it is safe

- **No HTTP.** Icons are registered eagerly from an in-memory map via
  `provideZvIcons(...)`. There is no runtime fetch of `.svg` files, so there is
  no request that could resolve differently on server vs. client.
- **Synchronous render.** `<zv-icon>` resolves its definition and renders inline
  SVG in the same change-detection pass. The server-rendered DOM and the
  client's first render are identical, so hydration never mismatches or reflows.
- **No `window`/`document` access** in the render path. All geometry and
  presentation are computed from signals.

## Setup

Register the same icons on both server and browser bootstraps. If you share a
providers array (recommended), you get this for free:

```ts
// app.config.ts
import { provideZvIcons } from '@zellavora/icons';
import { homeOutline, bellOutline } from '@zellavora/icons/generated';

export const appConfig = {
  providers: [provideZvIcons(homeOutline, bellOutline)],
};
```

```ts
// app.config.server.ts
import { mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

export const serverConfig = mergeApplicationConfig(appConfig, {
  providers: [provideServerRendering()],
});
```

## Checklist

- [x] Register icons in the **shared** config so server and client match.
- [x] Prefer the `color` CSS property for theming — it hydrates without JS.
- [x] Avoid conditionally registering icons based on `isPlatformBrowser`.
