import type { ExtensionContext } from 'vscode';
import { setExtensionContext } from './ctx';
import { loadI18n } from './i18n';

export * from './ctx';
export * from './i18n';
export * from './workspace';

/**
 * Initialize Tomjs Extension Utils
 */
export function initExtension(ctx: ExtensionContext) {
  setExtensionContext(ctx);
  loadI18n();
}

export default {
  /**
   * Initialize Tomjs Extension Utils
   */
  init: initExtension,
};
