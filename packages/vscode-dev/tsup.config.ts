import { defineConfig } from 'tsup';

export default defineConfig(options => {
  const isDev = !!options.watch;

  return [
    {
      entry: ['src/index.ts'],
      format: ['esm', 'cjs'],
      target: ['es2021', 'node16'],
      shims: true,
      clean: false,
      dts: true,
      sourcemap: isDev,
      splitting: true,
      env: {
        NODE_ENV: isDev ? 'development' : 'production',
      },
    },
    {
      entry: ['src/cli.ts'],
      format: ['cjs'],
      target: ['es2021', 'node16'],
      shims: false,
      clean: false,
      sourcemap: isDev,
      dts: false,
      splitting: true,
    },
  ];
});
