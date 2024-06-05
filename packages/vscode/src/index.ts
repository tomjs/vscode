import type { ExtensionContext } from 'vscode';
import { setExtensionContext } from './ctx';
import { loadI18n } from './i18n';

export * from './constants';
export * from './ctx';
export * from './i18n';
export * from './user';
export * from './workspace';

/**
 * Initialize Extension Utils
 */
export function initExtension(ctx: ExtensionContext) {
  setExtensionContext(ctx);
  loadI18n();
}

export default {
  /**
   * Initialize Extension Utils
   */
  init: initExtension,
};
