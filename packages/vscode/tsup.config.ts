import { defineConfig } from 'tsup';

export default defineConfig(options => {
  const isDev = !!options.watch;

  return {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    target: 'node14',
    external: ['vscode'],
    shims: true,
    clean: true,
    dts: true,
    sourcemap: isDev,
    splitting: true,
    minifyWhitespace: !isDev,
  };
});
