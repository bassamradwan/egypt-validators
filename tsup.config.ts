import { defineConfig } from 'tsup';

export default defineConfig({
  // Two entry points: the core (no dependencies) and the optional Zod helpers.
  entry: ['src/index.ts', 'src/zod.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2020',
  // Zod is a peer dependency: never bundle it, use the copy the app already has.
  external: ['zod'],
});
