#!/usr/bin/env node
import path from 'node:path';
import { readJsonSync } from '@tomjs/node';
import cac from 'cac';
import { registerLocaleCmd } from './cli/i18n';

let pkg: any = {};

try {
  pkg = readJsonSync(path.join(__dirname, '../package.json')) || {};
} catch (e) {
  console.error(e);
}

const cli = cac('vscode-dev').option('--verbose', 'display verbose output', {
  default: process.env.NODE_ENV === 'development',
});

registerLocaleCmd(cli);

cli.help();
cli.version(pkg.version);
cli.parse();
