# @tomjs/vscode-webview

[![npm](https://img.shields.io/npm/v/@tomjs/vscode-webview)](https://www.npmjs.com/package/@tomjs/vscode-webview) ![node-current (scoped)](https://img.shields.io/node/v/@tomjs/vscode-webview) ![NPM](https://img.shields.io/npm/l/@tomjs/vscode-webview)

[English](./README.md) | **中文**

> 优化 webview 页面与 vscode 扩展的 postMessage 问题

使用 `webview` 开发扩展，会有通讯相关的问题，本项目提供了 `webview` 和 扩展的通讯解决方案。如果使用了 [@tomjs/vite-plugin-vscode](https://github.com/tomjs/vite-plugin-vscode) 开发阶段，由于中间转发，会有延时的问题。

## 安装

```bash
# pnpm
pnpm add @tomjs/vscode-webview

# yarn
yarn add @tomjs/vscode-webview

# npm
npm add @tomjs/vscode-webview
```

## 文档

- [unpkg.com](https://www.unpkg.com/) 提供的 [index.d.ts](https://www.unpkg.com/browse/@tomjs/vscode-webview/dist/index.d.ts).

## 使用

### vscodeWebview.postAndReceiveMessage(type, message, options): Promise<any>

发送并接收消息

- type: 消息类型
- message: 消息内容
- options: 配置项

### vscodeWebview.postMessage(type, message, options)

发送消息

- type: 消息类型
- message: 消息内容

### vscodeWebview.on(type, listener)

监听消息

- type: 消息类型
- listener: 监听回调函数

### vscodeWebview.off(type)

取消监听消息

- type: 消息类型

### vscodeWebview.getState():Promise<any>

获取此 webview 存储的持久状态。

### vscodeWebview.setState(state: any): any

设置此 webview 存储的持久状态。
