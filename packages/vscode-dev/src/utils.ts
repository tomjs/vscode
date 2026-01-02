import type { CLIOptions } from './types';
import fs from 'node:fs';
import path from 'node:path';
import Logger from '@tomjs/logger';
import { mkdirpSync } from '@tomjs/node';

export const logger = new Logger({ directory: 'vscode-dev/logs' });

export async function formatCode(code: string, cwd: string) {
  try {
    const prettier = await import('prettier');

    let filepath: string | undefined;
    const configFileNames = ['.prettierrc', '.prettier.cjs', '.prettier.mjs', '.prettier.js'];
    for (const name of configFileNames) {
      const fp = path.join(cwd, name);
      if (fs.existsSync(fp)) {
        filepath = fp;
        break;
      }
    }

    if (prettier) {
      return prettier.format(
        code,
        filepath
          ? { filepath }
          : {
              parser: 'babel-ts',
              printWidth: 100,
              tabWidth: 2,
              useTabs: false,
              semi: true,
              singleQuote: true,
              trailingComma: 'all',
              arrowParens: 'avoid',
              proseWrap: 'never',
              endOfLine: 'lf',
            },
      );
    }
  }
  catch (e: any) {
    logger.error(e);
  }

  return code.replace(/^\s+/gm, '').replace(/\n/g, '');
}

function getDtsDir(cwd: string) {
  const folders = ['types', 'extension', 'src'];
  for (const folder of folders) {
    const dir = path.join(cwd, folder);
    if (fs.existsSync(dir)) {
      return dir;
    }
  }
  return cwd;
}

export function getDtsOutputPath(opts: CLIOptions) {
  const filePath = opts.dtsDir ? path.join(opts.cwd!, opts.dtsDir) : getDtsDir(opts.cwd!);
  if (!fs.existsSync(filePath)) {
    mkdirpSync(filePath);
  }
  return path.join(filePath, opts.dtsName || 'vscode.d.ts');
}
