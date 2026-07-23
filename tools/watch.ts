import chokidar from 'chokidar';
import { ICONS_SRC } from './config.ts';
import { runPipeline } from './generate.ts';

/**
 * Continuously watch the master SVG directory. Any add/change/unlink/rename
 * triggers a debounced full regeneration — no restart required.
 */
export function watchIcons(): void {
  let timer: NodeJS.Timeout | undefined;
  let running = false;
  let pending = false;

  const regenerate = async (): Promise<void> => {
    if (running) {
      pending = true;
      return;
    }
    running = true;
    try {
      const result = await runPipeline();
      if (result.errors.length) {
        console.error(`✗ ${result.errors.length} error(s):`);
        for (const e of result.errors) console.error(`  ${e.filePath}: ${e.message}`);
      } else {
        console.log(`✓ Regenerated ${result.icons.length} icon(s) in ${result.durationMs}ms`);
      }
    } finally {
      running = false;
      if (pending) {
        pending = false;
        void regenerate();
      }
    }
  };

  const schedule = (): void => {
    clearTimeout(timer);
    timer = setTimeout(() => void regenerate(), 120);
  };

  console.log(`👀 Watching ${ICONS_SRC} …`);
  chokidar
    .watch(ICONS_SRC, { ignoreInitial: false, awaitWriteFinish: true })
    .on('add', schedule)
    .on('change', schedule)
    .on('unlink', schedule);
}
