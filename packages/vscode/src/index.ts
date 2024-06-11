import type { ExtensionContext } from 'vscode';
import { setExtensionContext } from './ctx';
import { i18n } from './i18n';

export * from './configuration';
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
  i18n.use(ctx.extensionPath);
}

export default {
  /**
   * Initialize Extension Utils
   */
  init: initExtension,
};
