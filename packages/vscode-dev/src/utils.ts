import type { CLIOptions } from './types';
import fs from 'node:fs';
import path from 'node:path';
import Logger from '@tomjs/logger';
import { mkdirpSync } from '@tomjs/node';

export const logger = new Logger({ directory: 'vscode-dev/logs' });

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
