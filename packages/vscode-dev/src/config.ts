import type { CLIOptions } from './types';
import fs from 'node:fs';
import { cosmiconfig } from 'cosmiconfig';

export async function getConfig(opts: CLIOptions) {
  const explorer = cosmiconfig('vscode', {
    stopDir: opts.cwd,
    searchPlaces: [
      'package.json',
      '.vscoderc.js',
      '.vscoderc.ts',
      '.vscoderc.mjs',
      '.vscoderc.cjs',
      'vscode.config.js',
      'vscode.config.ts',
      'vscode.config.mjs',
      'vscode.config.cjs',
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
