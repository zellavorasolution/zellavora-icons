import { describe, expect, it } from 'vitest';
import { toCamelCase, toExportName, toKebabCase, toPascalCase } from '../tools/util/naming.ts';

describe('naming', () => {
  it('kebab-cases mixed input', () => {
    expect(toKebabCase('ArrowRight')).toBe('arrow-right');
    expect(toKebabCase('arrow_right')).toBe('arrow-right');
    expect(toKebabCase('arrow right')).toBe('arrow-right');
    expect(toKebabCase('shield-check')).toBe('shield-check');
  });

  it('camel-cases and pascal-cases', () => {
    expect(toCamelCase('arrow-right')).toBe('arrowRight');
    expect(toPascalCase('outline')).toBe('Outline');
  });

  it('builds unique export names per variant', () => {
    expect(toExportName('arrow-right', 'outline')).toBe('arrowRightOutline');
    expect(toExportName('home', 'filled')).toBe('homeFilled');
  });
});
