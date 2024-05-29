import fs from 'node:fs';
import path from 'node:path';
import { cwd } from 'node:process';
import { readJsonSync, writeJsonSync } from '@tomjs/node';
import chalk from 'chalk';
import chokidar from 'chokidar';
import { logger } from '../cli/utils';

export interface I18nOptions {
  /**
   * current working directory
   * @default process.cwd()
   */
  cwd?: string;
  /**
   * i18n directory
   * @default "locales"
   */
  dir?: string;
  /**
   * source language
   * @default "en"
   */
  lang?: string;
  /**
   * watch dir change
   * @default false
   */
  watch?: boolean;
}

const ROOT = cwd();

export function generateNlsJson(opts: I18nOptions) {
  opts.cwd = opts.cwd ?? ROOT;
  opts.dir = opts.dir ?? path.join(opts.cwd, 'locales');
  opts.lang = opts.lang ?? 'en';

  console.debug('i18n', opts);

  if (!opts.watch) {
    gen(opts);
    return;
  }

  const localePath = opts.dir;
  chokidar.watch(localePath).on('all', (event, path) => {
    logger.debug(event, path);
    gen(opts);
  });
}

function gen(opts: I18nOptions) {
  const localePath = path.join(opts.dir!);
  if (!fs.existsSync(localePath)) {
    return;
  }
  const files = fs.readdirSync(localePath);
  if (files.length === 0) {
    return;
  }

  const defaultLocale = Object.assign({}, readJsonSync(path.join(localePath, `${opts.lang}.json`)));

  files.forEach(name => {
    const locale = name.substring(0, name.length - 5);
    const messages = Object.assign({}, readJsonSync(path.join(localePath, name)));
    Object.keys(defaultLocale).forEach(key => {
      messages[key] = messages[key] || defaultLocale[key];
    });

    const fileName =
      locale === opts.lang ? './package.nls.json' : `./package.nls.${locale.toLowerCase()}.json`;
    writeJsonSync(path.join(opts.cwd!, fileName), messages);

    logger.success(`${chalk.blue(name)} => ${chalk.green(fileName)}`);
  });
}
