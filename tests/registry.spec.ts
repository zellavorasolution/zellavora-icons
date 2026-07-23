import { describe, expect, it } from 'vitest';
import { ZvIconRegistry } from '../src/lib/core/icon-registry.service.ts';
import type { ZvIconDefinition } from '../src/lib/core/icon-definition.ts';

const home: ZvIconDefinition = {
  name: 'home',
  variant: 'outline',
  category: 'navigation',
  viewBox: '0 0 24 24',
  body: '<path d="M4 12h16"/>',
};

const homeFilled: ZvIconDefinition = { ...home, variant: 'filled' };

describe('ZvIconRegistry', () => {
  it('registers and resolves by name + variant', () => {
    const reg = new ZvIconRegistry();
    reg.register(home);
    expect(reg.resolve('home', 'outline')).toBe(home);
    expect(reg.has('home', 'outline')).toBe(true);
  });

  it('keeps variants of the same name distinct', () => {
    const reg = new ZvIconRegistry();
    reg.register(home, homeFilled);
    expect(reg.resolve('home', 'outline')).toBe(home);
    expect(reg.resolve('home', 'filled')).toBe(homeFilled);
    expect(reg.size()).toBe(2);
  });

  it('returns undefined for unknown icons', () => {
    const reg = new ZvIconRegistry();
    expect(reg.resolve('missing', 'outline')).toBeUndefined();
    expect(reg.has('missing', 'outline')).toBe(false);
  });

  it('is idempotent per key', () => {
    const reg = new ZvIconRegistry();
    reg.register(home);
    reg.register(home);
    expect(reg.size()).toBe(1);
  });
});
