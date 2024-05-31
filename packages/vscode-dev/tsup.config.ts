import { defineConfig } from 'tsup';

export default defineConfig(options => {
  const isDev = !!options.watch;

  return [
    {
      entry: ['src/index.ts', 'src/cli.ts'],
      format: ['esm', 'cjs'],
      target: 'node16',
      shims: true,
      clean: true,
      dts: true,
      sourcemap: isDev,
      splitting: true,
      minifyWhitespace: !isDev,
      env: {
        NODE_ENV: isDev ? 'development' : 'production',
      },
    },
  ];
});
