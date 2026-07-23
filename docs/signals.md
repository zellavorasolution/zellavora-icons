# Signals guide

The library is signal-first end to end. Understanding the data flow helps you
compose icons efficiently.

## Component internals

Every `<zv-icon>` input is a signal input (`input()` / `input.required()`), and
every derived value is a `computed()`:

```
name, variant, filled, rounded   ─┐
                                   ├─▶ effectiveVariant() ─▶ definition() ─┐
                                   │                                       ├─▶ safeBody()
size, width, height              ─┼─▶ resolvedWidth/Height()               ├─▶ viewBox()
rotate, flip                     ─┼─▶ transform()                          ├─▶ fill/stroke attrs
strokeWidth                      ─┴─▶ effectiveStrokeWidth()               │
title, ariaLabel                 ────▶ labelled(), label() ────────────────┘
```

Because everything is a `computed`, only the inputs that actually change trigger
re-evaluation, and the component runs with `ChangeDetectionStrategy.OnPush`. This
plays perfectly with zoneless Angular.

## The registry is a signal, too

`ZvIconRegistry` stores its definitions in a `signal<ReadonlyMap>`. `resolve()`
reads that signal, so an icon registered later is picked up reactively by any
already-rendered `<zv-icon>` whose definition was previously missing.

```ts
const registry = inject(ZvIconRegistry);
registry.size(); // reactive count — use it in computed/effect
```

## Zoneless & OnPush

No `RxJS`, no `NgZone` reliance. The component is compatible with
`provideZonelessChangeDetection()` out of the box.
