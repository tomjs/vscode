#!/usr/bin/env node
import path from 'node:path';
import { readJsonSync } from '@tomjs/node';
import cac from 'cac';
import { getConfig } from './config';
import { generateCode } from './gen';
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
  .option('--config [config]', 'The config file path')
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
  .option('-b, --builtin [...builtin]', 'Builtin commands')
  .option('-w, --watch', 'Watch mode')
  .option('--verbose', 'Display verbose output')
  .action(async (cwd: string, options: CLIOptions) => {
    const cliOpts = Object.assign({ cwd }, options);
    console.log('cli options:', cliOpts);

    const config = await getConfig(cliOpts);
    console.log('config file:', config);

    const mergedOpts = Object.assign(
      {
        verbose: process.env.NODE_ENV === 'development',
      } as CLIOptions,
      config,
      cliOpts,
    ) as CLIOptions;

    mergedOpts.cwd ||= process.cwd();
    console.log('merged options:', mergedOpts);

    logger.enableDebug(options.verbose);
    await generateCode(mergedOpts);
  });

cli.help();
cli.version(pkg.version);
cli.parse();
