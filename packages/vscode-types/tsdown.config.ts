import { defineConfig } from 'tsdown';
import pkg from './package.json';

export default defineConfig((options) => {
  const isDev = !!options.watch;

  return {
    entry: ['src/index.ts'],
    format: ['cjs'],
    target: 'node14',
    external: Object.keys(pkg.dependencies).concat('vscode'),
    shims: true,
    clean: true,
    dts: true,
    sourcemap: isDev,
    publint: true,
    fixedExtension: false,
  };
});
