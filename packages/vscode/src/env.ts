import { ExtensionMode } from 'vscode';
import { getCtx } from './ctx';

/**
 * The extension is running from an --extensionDevelopmentPath provided when launching the editor.
 */
export function isUnderDevelopment() {
  return getCtx().extensionMode == ExtensionMode.Development;
}

/**
 * The extension is installed normally (for example, from the marketplace or VSIX) in the editor.
 */
export function isUnderProduction() {
  return getCtx().extensionMode == ExtensionMode.Production;
}
