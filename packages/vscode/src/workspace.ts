import type { WorkspaceFolder } from 'vscode';
import { window, workspace } from 'vscode';

/**
 * Get the active workspace folder
 */
export function getActiveWorkspaceFolder() {
  let activeWorkspace: WorkspaceFolder | undefined;
  const editor = window.activeTextEditor;
  if (editor) {
    activeWorkspace = workspace.getWorkspaceFolder(editor.document.uri);
  } else {
    if (workspace.workspaceFolders && workspace.workspaceFolders.length > 0) {
      activeWorkspace = workspace.workspaceFolders[0];
    }
  }

  return activeWorkspace;
}

/**
 * Get the active workspace folder uri
 */
export function getActiveWorkspaceFolderUri() {
  return getActiveWorkspaceFolder()?.uri;
}

/**
 * Get the active workspace folder path
 */
export function getActiveWorkspaceFolderPath() {
  return getActiveWorkspaceFolder()?.uri.fsPath;
}

/**
 * Get all workspace folders
 */
export function getAllWorkspaceFolders() {
  const folders: (WorkspaceFolder & { active?: boolean })[] = [];
  if (workspace.workspaceFolders) {
    folders.push(...workspace.workspaceFolders.map(s => ({ ...s, current: false })));
  }

  if (folders.length === 0) {
    return [];
  }

  const activePath = getActiveWorkspaceFolderPath();
  const current = folders.find(s => s.uri.fsPath === activePath);
  if (current) {
    current.active = true;
  }

  return folders;
}
