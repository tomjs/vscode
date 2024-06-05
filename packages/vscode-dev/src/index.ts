#!/usr/bin/env node
import path from 'node:path';
import { readJsonSync } from '@tomjs/node';
import cac from 'cac';
import { generateCode } from './cli';
import type { CLIOptions } from './types';
import { logger } from './utils';

let pkg: any = {};

try {
  pkg = readJsonSync(path.join(__dirname, '../package.json')) || {};
} catch (e) {
  console.error(e);
}

const cli = cac('vscode-dev');

cli
  .command('[cwd]', 'Generate package.nls.json and vscode.d.ts for vscode extension development')
  .option('--locales [locales]', 'Specify i18n directory', {
    default: 'locales',
  })
  .option('--lang [lang]', 'Specify i18n source language', {
    default: 'en',
  })
  .option(
    '--dts-dir [dtsDir]',
    'Specify the output directory of d.ts. If not specified, generated in the order "types", "extension", "src", "."',
  )
  .option('--dts-name [dtsName]', 'Specify the output file name of d.ts', {
    default: 'vscode.d.ts',
  })
  .option('-w, --watch', 'Watch mode')
  .option('--verbose', 'Display verbose output', {
    default: process.env.NODE_ENV === 'development',
  })
  .action(async (cwd: string, options: CLIOptions) => {
    logger.enableDebug(options.verbose);
    await generateCode(Object.assign({ cwd }, options) as CLIOptions);
  });

cli.help();
cli.version(pkg.version);
cli.parse();
