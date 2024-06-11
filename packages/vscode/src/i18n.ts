import fs from 'node:fs';
import path from 'node:path';
import { readJsonSync } from '@tomjs/node';
import { env } from 'vscode';
import { getCtx } from './ctx';

const DEFAULT_LANGUAGE = 'en';
const DEFAULT_NLS = 'package.nls.json';

export function loadI18n(extensionPath: string, language?: string) {
  const lang = language ?? env.language.toLocaleLowerCase();
  let name = lang === DEFAULT_LANGUAGE ? DEFAULT_NLS : `package.nls.${lang}.json`;

  const nlsPath = path.join(extensionPath, name);
  if (!fs.existsSync(nlsPath)) {
    name = DEFAULT_NLS;
  }

  return Object.assign(
    {},
    readJsonSync(path.join(extensionPath, DEFAULT_NLS)),
    readJsonSync(nlsPath),
  );
}

export interface NlsI18n {
  /**
   * Marks a string for localization. If a localized bundle is available for the language specified by
   * {@link env.language} and the bundle has a localized value for this message, then that localized
   * value will be returned (with injected {@link args} values for any templated values).
   *
   * @param message - The message to localize. Supports index templating where strings like `{0}` and `{1}` are
   * replaced by the item at that index in the {@link args} array.
   * @param args - The arguments to be used in the localized string. The index of the argument is used to
   * match the template placeholder in the localized string.
   * @returns localized string with injected arguments.
   *
   * @example
   * i18n.t('Hello {0}!', 'World');
   */
  t(message: string, ...args: Array<string | number | boolean>): string;

  /**
   * Marks a string for localization. If a localized bundle is available for the language specified by
   * {@link env.language} and the bundle has a localized value for this message, then that localized
   * value will be returned (with injected {@link args} values for any templated values).
   *
   * @param message The message to localize. Supports named templating where strings like `{foo}` and `{bar}` are
   * replaced by the value in the Record for that key (foo, bar, etc).
   * @param args The arguments to be used in the localized string. The name of the key in the record is used to
   * match the template placeholder in the localized string.
   * @returns localized string with injected arguments.
   *
   * @example
   * i18n.t('Hello {name}!', { name: 'World' });
   */
  t(message: string, args: Record<string, any>): string;

  t(
    ...params:
      | [message: string, ...args: Array<string | number | boolean>]
      | [message: string, args: Record<string, any>]
  ): string;
}

/**
 * Read i18n messages from package.nls.json
 */
export class I18n implements NlsI18n {
  private messages!: Record<string, string>;

  t(
    ...params:
      | [message: string, ...args: Array<string | number | boolean>]
      | [message: string, args: Record<string, any>]
  ) {
    if (params.length === 0) {
      return '';
    }

    if (this.messages === undefined) {
      this.messages = loadI18n(getCtx().extensionPath);
    }

    const key = params[0];
    const values = (params[1] as Record<string, any>) ?? {};
    const text = this.messages[key] || '';
    if (Object.keys(values).length === 0) {
      return text;
    }

    return text.replace(/{([^}]+)}/g, (match, group) => (values[group] ?? match) as string);
  }
}

/**
 * The i18n instance.
 */
export const i18n: NlsI18n = new I18n();
