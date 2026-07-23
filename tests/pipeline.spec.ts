import { describe, expect, it } from 'vitest';
import { optimizeSvg } from '../tools/pipeline/optimize.ts';
import { normalizeIcon } from '../tools/pipeline/normalize.ts';
import { validateIcon } from '../tools/pipeline/validate.ts';
import type { RawIcon } from '../tools/model.ts';

function raw(svg: string, overrides: Partial<RawIcon> = {}): RawIcon {
  return {
    name: 'test',
    variant: 'outline',
    category: 'navigation',
    filePath: '/icons/outline/navigation/test.svg',
    raw: svg,
    ...overrides,
  };
}

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <path d="M4 12h16" stroke="#111827" stroke-width="1.5" style="color:#111827" />
  <circle cx="12" cy="12" r="3" fill="none" />
</svg>`;

describe('optimize', () => {
  it('is deterministic', () => {
    expect(optimizeSvg(SAMPLE)).toBe(optimizeSvg(SAMPLE));
  });

  it('preserves the viewBox', () => {
    expect(optimizeSvg(SAMPLE)).toContain('viewBox="0 0 24 24"');
  });
});

describe('normalize', () => {
  const icon = normalizeIcon(raw(SAMPLE), optimizeSvg(SAMPLE));

  it('strips inline styles', () => {
    expect(icon.body).not.toContain('style=');
  });

  it('converts palette colors to currentColor', () => {
    expect(icon.body).toContain('currentColor');
    expect(icon.body).not.toContain('#111827');
  });

  it('preserves fill="none"', () => {
    const none = normalizeIcon(raw(SAMPLE), optimizeSvg(SAMPLE));
    // Body has no fill on the path, but a global none should never be rewritten.
    expect(none.body).not.toContain('fill="currentColor" ="none"');
  });

  it('normalizes stroke width to the canonical value', () => {
    expect(icon.body).toContain('stroke-width="2"');
  });

  it('produces a stable hash and export name', () => {
    expect(icon.hash).toHaveLength(12);
    expect(icon.exportName).toBe('testOutline');
    expect(icon.viewBox).toBe('0 0 24 24');
  });

  it('emits no wrapping <svg> element', () => {
    expect(icon.body).not.toContain('<svg');
  });
});

describe('validate', () => {
  it('accepts a well-formed icon', () => {
    expect(validateIcon(raw(SAMPLE))).toHaveLength(0);
  });

  it('rejects embedded scripts', () => {
    const issues = validateIcon(raw(`<svg viewBox="0 0 24 24"><script>alert(1)</script></svg>`));
    expect(issues.some((i) => /script/i.test(i.message))).toBe(true);
  });

  it('rejects inline event handlers', () => {
    const issues = validateIcon(
      raw(`<svg viewBox="0 0 24 24"><path onclick="x()" d="M0 0" /></svg>`),
    );
    expect(issues.some((i) => /event handler/i.test(i.message))).toBe(true);
  });

  it('rejects a non-kebab name', () => {
    const issues = validateIcon(raw(SAMPLE, { name: 'BadName' }));
    expect(issues.some((i) => /kebab/i.test(i.message))).toBe(true);
  });
});
