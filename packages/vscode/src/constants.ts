import { version } from 'vscode';

/**
 * Whether the current version is insider.
 */
export const isInsider = version.includes('-insider');
