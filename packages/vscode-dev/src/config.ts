import fs from 'node:fs';
import { cosmiconfig } from 'cosmiconfig';
import type { CLIOptions } from './types';

export async function getConfig(opts: CLIOptions) {
  const explorer = cosmiconfig('vd', {
    stopDir: opts.cwd,
    searchPlaces: [
      'package.json',
      'vd.config.json',
      'vd.config.js',
      'vd.config.mjs',
      'vd.config.cjs',
    ],
  });

  if (opts.config) {
    if (!fs.existsSync(opts.config)) {
      return {};
    }

    const result = await explorer.load(opts.config);
    return result?.config || {};
  }

  const result = await explorer.search();
  return result?.config || {};
}
