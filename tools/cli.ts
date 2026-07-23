#!/usr/bin/env -S npx tsx
import { scanIcons } from './pipeline/scan.ts';
import { validateIcon } from './pipeline/validate.ts';
import { runPipeline } from './generate.ts';
import { watchIcons } from './watch.ts';
import { emitPreview } from './generators/preview.ts';
import { ICON_VARIANTS } from './config.ts';

type Command =
  | 'generate'
  | 'optimize'
  | 'watch'
  | 'sync'
  | 'build'
  | 'validate'
  | 'preview'
  | 'doctor'
  | 'stats'
  | 'help';

const COMMANDS: Record<string, string> = {
  generate: 'Run the full pipeline and write generated TypeScript.',
  optimize: 'Alias for generate (optimization is part of every run).',
  watch: 'Watch the SVG directory and regenerate on change.',
  sync: 'Alias for generate.',
  build: 'Generate then build the Angular library (ng-packagr).',
  validate: 'Validate every SVG without writing output.',
  preview: 'Generate a searchable icon browser at docs/preview.html.',
  doctor: 'Diagnose the toolchain and icon set health.',
  stats: 'Print counts per variant and category.',
  help: 'Show this help.',
};

function printHelp(): void {
  console.log('\nzv-icons — @zellavora/icons pipeline CLI\n');
  console.log('Usage: zv-icons <command>\n');
  for (const [name, desc] of Object.entries(COMMANDS)) {
    console.log(`  ${name.padEnd(10)} ${desc}`);
  }
  console.log('');
}

async function cmdGenerate(): Promise<number> {
  const result = await runPipeline();
  if (result.errors.length) {
    console.error(`✗ ${result.errors.length} error(s):`);
    for (const e of result.errors) console.error(`  ${e.filePath}: ${e.message}`);
    return 1;
  }
  console.log(`✓ Generated ${result.icons.length} icon(s) in ${result.durationMs}ms`);
  return 0;
}

async function cmdValidate(): Promise<number> {
  const icons = await scanIcons();
  const issues = icons.flatMap((icon) => validateIcon(icon));
  if (issues.length) {
    for (const i of issues) console.error(`  ${i.filePath}: ${i.message}`);
    console.error(`✗ ${issues.length} validation issue(s) across ${icons.length} icon(s).`);
    return 1;
  }
  console.log(`✓ ${icons.length} icon(s) valid.`);
  return 0;
}

async function cmdStats(): Promise<number> {
  const icons = await scanIcons();
  const byVariant = new Map<string, number>();
  const byCategory = new Map<string, number>();
  for (const icon of icons) {
    byVariant.set(icon.variant, (byVariant.get(icon.variant) ?? 0) + 1);
    byCategory.set(icon.category, (byCategory.get(icon.category) ?? 0) + 1);
  }
  console.log(`\nTotal icons: ${icons.length}\n`);
  console.log('By variant:');
  for (const variant of ICON_VARIANTS) {
    const count = byVariant.get(variant) ?? 0;
    if (count) console.log(`  ${variant.padEnd(10)} ${count}`);
  }
  console.log('\nBy category:');
  for (const [cat, count] of [...byCategory].sort()) {
    console.log(`  ${cat.padEnd(16)} ${count}`);
  }
  console.log('');
  return 0;
}

async function cmdPreview(): Promise<number> {
  const result = await runPipeline({ dryRun: true });
  if (result.errors.length) {
    for (const e of result.errors) console.error(`  ${e.filePath}: ${e.message}`);
    return 1;
  }
  const out = await emitPreview(result.icons);
  console.log(`✓ Preview written to ${out} (${result.icons.length} icons)`);
  return 0;
}

async function cmdDoctor(): Promise<number> {
  const checks: Array<[string, boolean, string]> = [];
  const icons = await scanIcons();
  checks.push(['Node >= 20', Number(process.versions.node.split('.')[0]) >= 20, process.versions.node]);
  checks.push(['Icons discovered', icons.length > 0, `${icons.length} found`]);
  const dry = await runPipeline({ dryRun: true });
  checks.push(['Pipeline clean', dry.errors.length === 0, `${dry.errors.length} error(s)`]);

  let ok = true;
  for (const [label, pass, detail] of checks) {
    console.log(`${pass ? '✓' : '✗'} ${label.padEnd(20)} ${detail}`);
    ok = ok && pass;
  }
  return ok ? 0 : 1;
}

async function main(): Promise<void> {
  const command = (process.argv[2] ?? 'help') as Command;
  let code = 0;
  switch (command) {
    case 'generate':
    case 'optimize':
    case 'sync':
      code = await cmdGenerate();
      break;
    case 'build':
      code = await cmdGenerate();
      if (code === 0) console.log('→ Now run: npm run build');
      break;
    case 'watch':
      watchIcons();
      return;
    case 'validate':
      code = await cmdValidate();
      break;
    case 'preview':
      code = await cmdPreview();
      break;
    case 'stats':
      code = await cmdStats();
      break;
    case 'doctor':
      code = await cmdDoctor();
      break;
    case 'help':
    default:
      printHelp();
      break;
  }
  process.exit(code);
}

void main();
