import { defineConfig } from 'tsdown';
import pkg from './package.json';

export default defineConfig((options) => {
  const isDev = !!options.watch;

  return [
    {
      entry: ['src/cli.ts'],
      format: ['cjs'],
      target: 'node16',
      shims: true,
      clean: true,
      dts: false,
      sourcemap: isDev,
      publint: true,
      fixedExtension: false,
      external: Object.keys(pkg.dependencies).concat('prettier'),
      env: {
        NODE_ENV: isDev ? 'development' : 'production',
      },
    },
  ];
});
