import {
  Configuration,
  getDotVSCodePath,
  getUserDataPath,
  i18n,
  initExtension,
} from '@tomjs/vscode';
import type { ExtensionContext } from 'vscode';
import { commands, window } from 'vscode';

interface IConfig {
  hello?: string;
}

export async function activate(context: ExtensionContext) {
  initExtension(context);

  context.subscriptions.push(
    commands.registerCommand('tomjs.xxx.showHello', async () => {
      window.showInformationMessage(i18n.t('tomjs.commands.hello'));
    }),
  );

  console.log('user data path:', getUserDataPath());
  console.log('.vscode path:', getDotVSCodePath());

  const config = new Configuration<IConfig>('tomjs.xxx');
  console.log('values:', config.values());
  await config.update('hello', {
    time: Date.now(),
  });
  console.log('values:', config.values());
}

export function deactivate() {}
