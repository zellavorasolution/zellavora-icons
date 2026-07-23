import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['tools/**/*.ts', 'src/lib/core/**/*.ts'],
      exclude: ['**/*.spec.ts', 'src/lib/generated/**'],
    },
  },
});
