import type { CAC } from 'cac';
import { generateNlsJson, type I18nOptions } from '../i18n';
import type { CLIOptions } from './types';
import { logger } from './utils';

export function registerLocaleCmd(cli: CAC) {
  cli
    .command(
      'i18n [dir]',
      'generate package.nls.{locale}.json files based on the provided i18n messages directory',
    )
    .alias('locale')
    .option('--cwd [cwd]', 'current working directory', {
      default: process.cwd(),
    })
    .option('--lang [lang]', 'i18n source language', {
      default: 'en',
    })
    .option('--watch', 'whether to monitor the i18n directory', {
      default: false,
    })
    .action((dir: string, options: I18nOptions & CLIOptions) => {
      logger.enableDebug(options.verbose);

      logger.info('generate package.nls.{locale}.json files');
      generateNlsJson(Object.assign({ dir }, options) as I18nOptions);
    });
}
