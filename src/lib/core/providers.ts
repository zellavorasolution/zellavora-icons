import {
  ENVIRONMENT_INITIALIZER,
  inject,
  makeEnvironmentProviders,
  type EnvironmentProviders,
} from '@angular/core';
import type { ZvIconDefinition } from './icon-definition';
import { ZvIconRegistry } from './icon-registry.service';

/**
 * Register a curated set of icons at application bootstrap.
 *
 * Only the icons you import are bundled, so tree-shaking is preserved:
 *
 * ```ts
 * import { provideZvIcons } from '@zellavora/icons';
 * import { homeOutline, bellOutline } from '@zellavora/icons/generated';
 *
 * bootstrapApplication(App, {
 *   providers: [provideZvIcons(homeOutline, bellOutline)],
 * });
 * ```
 */
export function provideZvIcons(...icons: readonly ZvIconDefinition[]): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => inject(ZvIconRegistry).register(...icons),
    },
  ]);
}
