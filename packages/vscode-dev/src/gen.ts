import fs from 'node:fs';
import path from 'node:path';
import { cwd } from 'node:process';
import { emptyDirSync, readFile, readJson, readJsonSync, writeFile, writeJson } from '@tomjs/node';
import chalk from 'chalk';
import chokidar from 'chokidar';
import type { CLIOptions } from './types';
import { formatCode, getDtsOutputPath, logger } from './utils';

const ROOT = cwd();

const DTS_CACHE_DIR = path.join(ROOT, 'node_modules', '.cache/@tomjs/vscode-dev');
const DTS_CACHE_NLS_PATH = path.join(DTS_CACHE_DIR, 'nls.d.ts');
const DTS_CACHE_PKG_PATH = path.join(DTS_CACHE_DIR, 'pkg.d.ts');

export async function generateCode(opts: CLIOptions) {
  emptyDirSync(DTS_CACHE_DIR);

  opts.cwd = opts.cwd ?? ROOT;
  opts.locales = path.join(opts.cwd, opts.locales ?? 'locales');
  opts.lang = opts.lang ?? 'en';
  opts.dtsName = opts.dtsName ?? 'vscode.d.ts';

  console.debug('gen options', opts);

  if (!opts.watch) {
    await Promise.all([genNls(opts), genPackageDts(opts)]);
    return;
  }

  {
    const localePath = opts.locales;
    chokidar.watch(localePath).on('all', async (event, path) => {
      logger.debug(event, path);
      try {
        await genNls(opts);
      } catch (e) {
        logger.error(e);
      }
    });
  }

  {
    const pkgPath = path.join(opts.cwd, 'package.json');
    chokidar.watch(pkgPath).on('all', async (event, path) => {
      logger.debug(event, path);
      try {
        await genPackageDts(opts);
      } catch (e) {
        logger.error(e);
      }
    });
  }
}

async function genNls(opts: CLIOptions) {
  const localePath = path.join(opts.locales!);
  if (!fs.existsSync(localePath)) {
    return;
  }
  const files = fs.readdirSync(localePath);
  if (files.length === 0) {
    return;
  }

  const defaultLocale = Object.assign({}, readJsonSync(path.join(localePath, `${opts.lang}.json`)));

  const nslKeys: string[] = [];

  await Promise.all(
    files.map(async name => {
      const locale = name.substring(0, name.length - 5);
      const messages = Object.assign({}, await readJson(path.join(localePath, name)));
      Object.keys(defaultLocale).forEach(key => {
        messages[key] = messages[key] || defaultLocale[key];
      });

      nslKeys.push(...Object.keys(messages));

      const fileName =
        locale === opts.lang ? './package.nls.json' : `./package.nls.${locale.toLowerCase()}.json`;
      await writeJson(path.join(opts.cwd!, fileName), messages);
    }),
  );

  logger.success(`generate ${chalk.green('package.nls.json')}`);

  await genNlsDts(nslKeys, opts);
}

async function genNlsDts(keys: string[], opts: CLIOptions) {
  // generate d.ts file
  const nslKeys = [...new Set(keys)];
  nslKeys.sort();

  const code = /* ts */ `
import '@tomjs/vscode';

declare module '@tomjs/vscode' {
  type I18nMessageType = ${nslKeys.map(key => `'${key}'`).join(' | ') || 'undefined'};

  interface NlsI18n {
    t(message: I18nMessageType, ...args: Array<string | number | boolean>): string;
    t(message: I18nMessageType, args: Record<string, any>): string;
    t(
      ...params:
        | [message: I18nMessageType, ...args: Array<string | number | boolean>]
        | [message: I18nMessageType, args: Record<string, any>]
    ): string;
  }
}
  `;

  await writeFile(DTS_CACHE_NLS_PATH, code);
  await mergeDts(opts);

  logger.success(`generate ${chalk.green(opts.dtsName)} [package.nls.json]`);
}

function getDtsType(types: string[]) {
  let type = 'undefined';
  if (Array.isArray(types) && types.length) {
    const list = types.map(type => `'${type}'`);
    list.sort();
    type = [...new Set(list)].join(' | ');
  }
  return type;
}

async function genPackageDts(opts: CLIOptions) {
  let pkg: any = {};
  try {
    pkg = (await readJson(path.join(opts.cwd!, 'package.json'))) || {};
  } catch (e: any) {
    logger.error(e?.message);
  }

  const commands = pkg?.contributes?.commands || [];
  const command = getDtsType(commands.map(s => s.command));
  const builtin = getDtsType([...new Set(opts.builtin || [])]);

  const code = /* ts */ `
declare module 'vscode' {
  export type BuiltinCommand = ${builtin};

  export type UserCommand = ${command};

  export namespace commands {
    export function registerCommand( command: UserCommand,
      callback: (...args: any[]) => any,
      thisArg?: any,
    ): Disposable;

    export function registerTextEditorCommand(
      command: UserCommand,
      callback: (textEditor: TextEditor, edit: TextEditorEdit, ...args: any[]) => void,
      thisArg?: any,
    ): Disposable;

    export function executeCommand<T = unknown>(
      command: BuiltinCommand | UserCommand,
      ...rest: any[]
    ): Thenable<T>;
  }

  export interface Command {
    command?: BuiltinCommand | UserCommand;
  }

  export interface StatusBarItem {
    command?: BuiltinCommand | UserCommand;
  }
}
`;

  await writeFile(DTS_CACHE_PKG_PATH, code);
  await mergeDts(opts);

  logger.success(`generate ${chalk.green(opts.dtsName)} [package.json]`);
}

async function mergeDts(opts: CLIOptions) {
  const codes = await Promise.all(
    [DTS_CACHE_NLS_PATH, DTS_CACHE_PKG_PATH].map(async filePath => {
      if (!fs.existsSync(filePath)) {
        return '';
      }
      return readFile(filePath);
    }),
  );

  const code = await formatCode(codes.join('\n\n'), opts.cwd!);

  await writeFile(
    path.join(getDtsOutputPath(opts.cwd!), opts.dtsName!),
    `// generated by @tomjs/vscode-dev\n\n${code}`,
  );
}
