/**
 * copy from https://github.com/microsoft/vscode/blob/main/src/vs/platform/environment/common/environment.ts
 */

/**
 * Type of extension.
 *
 * **NOTE**: This is defined in `platform/environment` because it can appear as a CLI argument.
 */
export type ExtensionKind = 'ui' | 'workspace' | 'web';
