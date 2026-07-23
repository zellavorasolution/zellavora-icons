import { Injectable, computed, signal } from '@angular/core';
import { iconKey, type ZvIconDefinition, type ZvIconVariant } from './icon-definition';

/**
 * Signal-first, framework-idiomatic icon registry.
 *
 * The registry is a pure in-memory map — zero HTTP, zero side effects — so it is
 * fully SSR- and hydration-safe. Icons are registered eagerly at bootstrap via
 * `provideZvIcons(...)`, which keeps the render path synchronous and flicker-free.
 */
@Injectable({ providedIn: 'root' })
export class ZvIconRegistry {
  private readonly definitions = signal<ReadonlyMap<string, ZvIconDefinition>>(new Map());

  /** Reactive count of registered icons — handy for gallery/doctor tooling. */
  readonly size = computed(() => this.definitions().size);

  /** Register one or more icon definitions. Idempotent per key. */
  register(...icons: readonly ZvIconDefinition[]): void {
    if (icons.length === 0) return;
    const next = new Map(this.definitions());
    for (const icon of icons) {
      next.set(iconKey(icon.name, icon.variant), icon);
    }
    this.definitions.set(next);
  }

  /** Resolve a definition, or `undefined` when not registered. */
  resolve(name: string, variant: ZvIconVariant): ZvIconDefinition | undefined {
    return this.definitions().get(iconKey(name, variant));
  }

  /** Whether a given icon is registered. */
  has(name: string, variant: ZvIconVariant): boolean {
    return this.definitions().has(iconKey(name, variant));
  }
}
