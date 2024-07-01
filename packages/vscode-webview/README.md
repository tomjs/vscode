# @tomjs/vscode-webview

[![npm](https://img.shields.io/npm/v/@tomjs/vscode-webview)](https://www.npmjs.com/package/@tomjs/vscode-webview) ![node-current (scoped)](https://img.shields.io/node/v/@tomjs/vscode-webview) ![NPM](https://img.shields.io/npm/l/@tomjs/vscode-webview) [![Docs](https://raw.githubusercontent.com/tomjs/assets/main/npm/api.svg)](https://www.unpkg.com/browse/@tomjs/vscode-webview/dist/index.d.ts)

**English** | [中文](./README.zh_CN.md)

> Optimize the postMessage issue between webview page and vscode extension

When developing extensions using `webview`, there will be communication-related issues. This project provides communication solutions between `webview` and extension. If [@tomjs/vite-plugin-vscode](https://github.com/tomjs/vite-plugin-vscode) is used during the development phase, there will be delay issues due to intermediate forwarding.

## Install

```bash
# pnpm
pnpm add @tomjs/vscode-webview

# yarn
yarn add @tomjs/vscode-webview

# npm
npm add @tomjs/vscode-webview
```

## Documentation

- [index.d.ts](https://www.unpkg.com/browse/@tomjs/vscode-webview/dist/index.d.ts) provided by [unpkg.com](https://www.unpkg.com).

## Usage

### vscodeWebview.postAndReceiveMessage(type, message, options): Promise<any>

Send and receive messages

- type: message type
- message: message content
- options: configuration items

### vscodeWebview.postMessage(type, message, options)

Send message

- type: message type
- message: message content

### vscodeWebview.on(type, listener)

Listen for messages

- type: message type
- listener: listener callback function

### vscodeWebview.off(type)

Cancel listening for messages

- type: message type

### vscodeWebview.getState():Promise<any>

Get the persistent state stored for this webview.

### vscodeWebview.setState(state: any): any

Set the persistent state stored for this webview.
