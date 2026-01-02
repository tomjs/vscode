export interface CLIOptions {
  /**
   * current working directory
   * @default process.cwd()
   */
  cwd?: string;
  /**
   * config file path
   * @default "vd.config.js"
   */
  config?: string;
  /**
   * i18n directory
   * @default "locales"
   */
  locales?: string;
  /**
   * source language
   * @default "en"
   */
  lang?: string;
  /**
   * generate d.ts file directory
   */
  dtsDir?: string;
  /**
   * generate d.ts file name, default is "vscode.d.ts"
   */
  dtsName?: string;
  /**
   * builtin commands
   */
  builtin?: string[];
  /**
   * A dot-separated identifier for the configuration
   *
   * When a section-identifier is provided only that part of the configuration
   * is returned. Dots in the section-identifier are interpreted as child-access,
   * like `{ myExt: { setting: { doIt: true }}}` and `getConfiguration('myExt.setting').get('doIt') === true`.
   */
  identifier?: string;
  /**
   * watch files change
   * @default false
   */
  watch?: boolean;
  /**
   * verbose mode
   * @default false
   */
  verbose: boolean;
}
