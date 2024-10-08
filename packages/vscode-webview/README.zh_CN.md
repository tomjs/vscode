# @tomjs/vscode-webview

[![npm](https://img.shields.io/npm/v/@tomjs/vscode-webview)](https://www.npmjs.com/package/@tomjs/vscode-webview) ![node-current (scoped)](https://img.shields.io/node/v/@tomjs/vscode-webview) ![NPM](https://img.shields.io/npm/l/@tomjs/vscode-webview) [![jsDocs.io](https://img.shields.io/badge/jsDocs.io-reference-blue)](https://www.jsdocs.io/package/@tomjs/vscode-webview)

[English](./README.md) | **中文**

> 优化 webview 页面与 vscode 扩展的 postMessage 问题

对官方的 [@types/vscode-webview](https://www.npmjs.com/package/@types/vscode-webview) 进行了封装并增加了一些方法。

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

- [jsdocs.io](https://www.jsdocs.io) 提供的 [API Document](https://www.jsdocs.io/package/@tomjs/vscode-webview).
- [unpkg.com](https://www.unpkg.com/) 提供的 [index.d.ts](https://www.unpkg.com/browse/@tomjs/vscode-webview/dist/index.d.ts).

## 使用

### WebviewApi

#### getState(): any

获取此 webview 存储的持久状态。

#### setState(state: any): any

设置此 webview 存储的持久状态。

#### postMessage(message:any)

向 WebView 的所有者发布消息

#### post(type, message, options)

发送消息

- type: 消息类型
- message: 消息内容
- options: 配置项

#### postAndReceive(type, message, options): Promise<any>

发送并接收消息

- type: 消息类型
- message: 消息内容
- options: 配置项

#### on(type, success[, fail])

监听消息

- type: 消息类型
- success: 监听成功回调函数
- fail: 监听失败回调函数

#### off(type)

取消监听消息

- type: 消息类型

## 重要说明

### v2.0.0

**破坏性更新：**

- 导出由官方 [@types/vscode-webview](https://www.npmjs.com/package/@types/vscode-webview) 的`WebviewApi` 来封装的 `WebviewApi` 类
  - `postMessage` 方法修改为与官方的 `WebviewApi` 实例的方法一致
  - 原 `postMessage` 和 `postAndReceiveMessage` 方法名改为 `post` 和 `postAndReceive`
- 删除 `WebviewApi` 的实例：`vscodeWebview` 和 `webviewApi`，需要手动引入并实例化
