import os from 'node:os';
import path from 'node:path';
import { isInsider } from './constants';
import { getCtx } from './ctx';

/**
 * Get user data path
 *
 * * windows: %APPDATA%\\Code\\User
 * * mac: ~/Library/Application Support/Code/User
 * * linux: ~/.config/Code/User
 */
export function getUserDataPath() {
  const storageDir = path.dirname(getCtx().globalStorageUri.fsPath);
  return path.dirname(storageDir);
}

/**
 * Get .vscode path
 *
 * * windows: %USERPROFILE%\\.vscode
 * * mac: ~/.vscode
 * * linux: ~/.vscode
 */
export function getDotVSCodePath() {
  return path.join(os.homedir(), isInsider ? '.vscode-insiders' : '.vscode');
}
