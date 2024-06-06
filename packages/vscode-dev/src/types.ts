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
   * generate d.ts file name, default is "vscode-i18n.d.ts"
   */
  dtsName?: string;
  /**
   * builtin commands
   */
  builtin?: string[];
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
