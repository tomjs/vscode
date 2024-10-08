# @tomjs/vscode-webview

[![npm](https://img.shields.io/npm/v/@tomjs/vscode-webview)](https://www.npmjs.com/package/@tomjs/vscode-webview) ![node-current (scoped)](https://img.shields.io/node/v/@tomjs/vscode-webview) ![NPM](https://img.shields.io/npm/l/@tomjs/vscode-webview) [![jsDocs.io](https://img.shields.io/badge/jsDocs.io-reference-blue)](https://www.jsdocs.io/package/@tomjs/vscode-webview)

**English** | [中文](./README.zh_CN.md)

> Optimize the postMessage issue between webview page and vscode extension

Wrapped the official [@types/vscode-webview](https://www.npmjs.com/package/@types/vscode-webview) and added some methods.

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

- [API Document](https://www.jsdocs.io/package/@tomjs/vscode-webview) provided by [jsdocs.io](https://www.jsdocs.io).
- [index.d.ts](https://www.unpkg.com/browse/@tomjs/vscode-webview/dist/index.d.ts) provided by [unpkg.com](https://www.unpkg.com).

## Usage

### WebviewApi

#### getState()

Get the persistent state stored for this webview.

#### setState(state)

Set the persistent state stored for this webview.

#### postMessage(message)

Post a message to the owner of the webview

#### post(type, message, options)

Send message

- type: message type
- message: message content
- options: configuration items

#### postAndReceive(type, message, options): Promise<any>

Send and receive messages

- type: message type
- message: message content
- options: configuration items

#### on(type, success[, fail])

Listen for messages

- type: message type
- success: listener success callback function
- fail: listener error callback function

#### off(type)

Cancel listening for messages

- type: message type

## Important Notes

### v2.0.0

**Breaking Updates:**

- Export the `WebviewApi` class wrapped by the `WebviewApi` of the official [@types/vscode-webview](https://www.npmjs.com/package/@types/vscode-webview)
  - The `postMessage` method is modified to be consistent with the method of the official `WebviewApi` instance
  - The original `postMessage` and `postAndReceiveMessage` method names are changed to `post` and `postAndReceive`
- Delete the `WebviewApi` instances: `vscodeWebview` and `webviewApi`, which need to be manually imported and instantiated
