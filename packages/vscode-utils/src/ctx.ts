import type { ExtensionContext } from 'vscode';

let _ctx!: ExtensionContext;

/*
 * Set current extension context
 */
export function setExtensionContext(ctx: ExtensionContext) {
  _ctx = ctx;
}

/**
 * Get current extension context
 */
export function getExtensionContext() {
  return _ctx;
}

/**
 * Get current extension context
 */
export function getCtx() {
  return _ctx;
}
