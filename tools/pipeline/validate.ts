import type { RawIcon } from '../model.ts';

export interface ValidationIssue {
  readonly filePath: string;
  readonly message: string;
}

/**
 * Step 2 — Validate.
 * Enforce structural rules before any expensive optimization runs.
 * Returns an empty array when the icon is valid.
 */
export function validateIcon(icon: RawIcon): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const svg = icon.raw;

  if (!/<svg[\s>]/i.test(svg)) {
    issues.push({ filePath: icon.filePath, message: 'Missing <svg> root element.' });
  }
  if (!/viewBox\s*=/.test(svg) && !/width\s*=/.test(svg)) {
    issues.push({
      filePath: icon.filePath,
      message: 'SVG has neither a viewBox nor width/height; cannot infer geometry.',
    });
  }
  if (/<script[\s>]/i.test(svg)) {
    issues.push({ filePath: icon.filePath, message: 'Embedded <script> is not allowed.' });
  }
  if (/\son\w+\s*=/i.test(svg)) {
    issues.push({ filePath: icon.filePath, message: 'Inline event handlers are not allowed.' });
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(icon.name)) {
    issues.push({
      filePath: icon.filePath,
      message: `Icon name "${icon.name}" is not valid kebab-case.`,
    });
  }

  return issues;
}
