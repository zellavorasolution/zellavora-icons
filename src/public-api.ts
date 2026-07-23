/*
 * Public API surface of @zellavora/icons.
 *
 * The generated icon consts live in the secondary entry point
 * `@zellavora/icons/generated` so that importing the runtime never pulls in
 * icon data you did not ask for.
 */
export { ZvIconComponent } from './lib/icon/icon.component';
export type { ZvIconFlip, ZvIconSize } from './lib/icon/icon.component';
export { ZvIconRegistry } from './lib/core/icon-registry.service';
export { provideZvIcons } from './lib/core/providers';
export { iconKey } from './lib/core/icon-definition';
export type {
  ZvIconDefinition,
  ZvIconMetadata,
  ZvIconVariant,
} from './lib/core/icon-definition';
