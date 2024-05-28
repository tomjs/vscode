import { defineConfig } from 'tsup';

export default defineConfig(options => {
  const isDev = !!options.watch;

  return {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    target: ['es2021', 'node16'],
    external: ['vscode'],
    shims: true,
    clean: true,
    dts: true,
    sourcemap: isDev,
    splitting: true,
    env: {
      NODE_ENV: isDev ? 'development' : 'production',
    },
  };
});
