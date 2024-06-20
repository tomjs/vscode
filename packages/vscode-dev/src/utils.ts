import fs from 'node:fs';
import path from 'node:path';
import Logger from '@tomjs/logger';

export const logger = new Logger({ directory: 'vscode-dev/logs' });

export const formatCode = async (code: string, cwd: string) => {
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
  } catch (e: any) {
    logger.error(e);
  }

  return code.replace(/^\s+/gm, '').replace(/\n/g, '');
};

/**
 * Get dts output path
 * @param cwd
 * @returns
 */
export function getDtsOutputPath(cwd: string) {
  const folders = ['types', 'extension', 'src'];
  for (const folder of folders) {
    const dir = path.join(cwd, folder);
    if (fs.existsSync(dir)) {
      return dir;
    }
  }
  return cwd;
}
