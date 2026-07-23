/** Convert an arbitrary token to kebab-case. */
export function toKebabCase(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Convert an arbitrary token to camelCase. */
export function toCamelCase(input: string): string {
  const kebab = toKebabCase(input);
  return kebab.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

/** Convert an arbitrary token to PascalCase. */
export function toPascalCase(input: string): string {
  const camel = toCamelCase(input);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * Build the unique export identifier for an icon, e.g.
 * ("arrow-right", "outline") -> "arrowRightOutline".
 */
export function toExportName(name: string, variant: string): string {
  return `${toCamelCase(name)}${toPascalCase(variant)}`;
}
