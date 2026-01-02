import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cwd } from 'node:process';
import { readJson, readJsonSync, writeFile, writeJson } from '@tomjs/node';
import type { IExtensionManifest } from '@tomjs/vscode-types';
import chalk from 'chalk';
import chokidar from 'chokidar';
import type { CLIOptions } from './types';
import { formatCode, getDtsOutputPath, logger } from './utils';

const ROOT = cwd();

let nlsCode = '';
let pkgCode = '';

function createWatcher(paths: string | string[], callback: () => Promise<any>) {
  const watchPaths = Array.isArray(paths) ? paths : [paths];

  const watchOptions: chokidar.WatchOptions = {
    ignorePermissionErrors: true,
    persistent: true,
    disableGlobbing: os.platform() === 'win32',
  };

  const watcher = chokidar.watch(watchPaths, watchOptions);

  let ready = false;

  watcher.on('ready', async function () {
    ready = true;

    logger.info(`watching: ${watchPaths.map(s => chalk.green(s))}`);

    await callback();
  });

  watcher.on('all', async (event, path) => {
    if (!ready || ['addDir', 'unlinkDir'].includes(event)) {
      return;
    }
    logger.debug(event, path);

    try {
      await callback();
    } catch (e: any) {
      logger.error(e?.message);
    }
  });
}

export async function generateCode(opts: CLIOptions) {
  opts.cwd = opts.cwd ?? ROOT;
  opts.locales = path.join(opts.cwd, opts.locales ?? 'locales');
  opts.lang = opts.lang ?? 'en';
  opts.dtsName = opts.dtsName ?? 'vscode.d.ts';

  logger.debug('gen options', opts);

  if (!opts.watch) {
    await Promise.all([genNls(opts), genPackageDts(opts)]);
    return;
  }

  createWatcher(opts.locales, () => genNls(opts));
  createWatcher(path.join(opts.cwd, 'package.json'), () => genPackageDts(opts));
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

  nlsCode = /* ts */ `
import '@tomjs/vscode';

declare module '@tomjs/vscode' {
  type I18nMessageType = ${nslKeys.map(key => `'${key}'`).join(' | ') || 'undefined'};

  interface NlsI18n {
    t: (message: I18nMessageType, ...args: Array<string | number | boolean>) => string;
    t: (message: I18nMessageType, args: Record<string, any>) => string;
    t: (
      ...params:
        | [message: I18nMessageType, ...args: Array<string | number | boolean>]
        | [message: I18nMessageType, args: Record<string, any>]
    ) => string;
  }
}
  `;

  await mergeDts(opts);

  logger.success(`generate ${chalk.green(opts.dtsName)} [package.nls.json]`);
}

function getDtsType(types: string[]) {
  if (!Array.isArray(types) || types.length === 0) {
    return;
  }
  const list = types.map(type => `'${type}'`);
  list.sort();
  return [...new Set(list)].join(' | ');
}

function getCommandDts(pkg: IExtensionManifest, opts: CLIOptions) {
  const commands = pkg?.contributes?.commands || [];
  const commandType = getDtsType(commands.map(s => s.command));
  const builtinType = getDtsType([...new Set(opts.builtin || [])]);
  if (!commandType && !builtinType) {
    return '';
  }

  return /* ts */ `
  export type BuiltinCommand = ${builtinType || 'undefined'};
  export type UserCommand = ${commandType || 'undefined'};

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
`;
}

function getViewDts(pkg: IExtensionManifest) {
  const views = pkg?.contributes?.views || {};
  const viewKeys = Object.keys(views);
  if (viewKeys.length === 0) {
    return '';
  }

  const viewIds = viewKeys.reduce((acc, cur) => {
    const ids = (views[cur] || []).map(view => view.id);
    return acc.concat(ids);
  }, [] as string[]);

  const dtsType = getDtsType(viewIds);
  if (!dtsType) {
    return '';
  }

  return /* ts */ `
  export namespace window {
    type ViewId = ${dtsType};

    export function registerTreeDataProvider<T>(viewId: ViewId, treeDataProvider: TreeDataProvider<T>): Disposable;
    export function createTreeView<T>(viewId: ViewId, options: TreeViewOptions<T>): TreeView<T>;
    export function registerWebviewViewProvider(viewId: ViewId, provider: WebviewViewProvider, options?: {
      readonly webviewOptions?: {
        readonly retainContextWhenHidden?: boolean;
			};
		}): Disposable;
  }
  `;
}

async function genPackageDts(opts: CLIOptions) {
  let pkg = {} as IExtensionManifest;
  try {
    pkg = (await readJson(path.join(opts.cwd!, 'package.json'))) || {};
  } catch (e: any) {
    logger.error(e?.message);
  }

  pkgCode = /* ts */ `
declare module 'vscode' {
  ${getCommandDts(pkg, opts)}

  ${getViewDts(pkg)}
}
`;

  await mergeDts(opts);

  logger.success(`generate ${chalk.green(opts.dtsName)} [package.json]`);
}

async function mergeDts(opts: CLIOptions) {
  const codes = [nlsCode, pkgCode].filter(s => s);
  const code = await formatCode(codes.join('\n\n'), opts.cwd!);
  await writeFile(getDtsOutputPath(opts), `// generated by @tomjs/vscode-dev\n${code}`);
}
