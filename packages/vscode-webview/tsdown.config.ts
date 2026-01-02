import { defineConfig } from 'tsdown';

export default defineConfig((options) => {
  const isDev = !!options.watch;

  return {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    target: ['es2015', 'chrome87'],
    shims: true,
    clean: true,
    dts: true,
    sourcemap: isDev,
    publint: true,
    fixedExtension: false,
    env: {
      NODE_ENV: isDev ? 'development' : 'production',
    },
  };
});
