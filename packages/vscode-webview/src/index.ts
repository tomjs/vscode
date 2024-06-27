import type { WebviewApi } from 'vscode-webview';

export interface PostMessageOptions {
  /**
   * the millisecond of try interval time
   * @default 200
   */
  interval?: number;
  /**
   * the millisecond of post timeout
   * @default 10000
   */
  timeout?: number;
  /**
   *  the name of key in the message, default 'type'
   */
  typeKey?: string;
  /**
   *  the name of data in the message, default 'data'
   */
  dataKey?: string;
}

const INTERVAL = 200;
const TIMEOUT = 10000;

const globalPostMessageOptions: PostMessageOptions = {
  interval: INTERVAL,
  timeout: TIMEOUT,
};

export type PostMessageListener<T> = (data: T) => void | Promise<void>;

/**
 * The vscode api for post message
 */
class VSCodeWebview {
  private readonly webviewApi: WebviewApi<unknown> | undefined;
  private _options: PostMessageOptions = {
    interval: INTERVAL,
    timeout: TIMEOUT,
  };

  private listeners: Map<string, PostMessageListener<any>> = new Map();

  constructor() {
    if (typeof acquireVsCodeApi !== 'function') {
      console.error('acquireVsCodeApi is not a function');
      return;
    }

    this.webviewApi = acquireVsCodeApi();
    window.addEventListener('message', event => {
      const message = event.data || {};
      if (this.listeners.size === 0) {
        return;
      }
      const listener = this.listeners.get(message.type);
      if (listener) {
        listener(message.data);
      }
    });
  }

  /**
   * set the post message options
   * @param options
   */
  public setOptions(options: PostMessageOptions) {
    this._options = Object.assign({}, this._options, options);
  }

  private _postMessage(type: string | number, data: any, opts: PostMessageOptions) {
    if (!this.webviewApi) {
      return;
    }
    this.webviewApi.postMessage({ [opts.typeKey ?? 'type']: type, [opts.typeKey ?? 'data']: data });
  }

  /**
   * Post a message to the owner of the webview
   * @param type the message type
   * @param data the message content
   * @param options
   */

  public postMessage(type: string | number, data: any, options?: PostMessageOptions) {
    const opts = Object.assign({}, globalPostMessageOptions, options);
    this._postMessage(type, data, opts);
  }

  /**
   * Post a message to the owner of the webview, and return the response. The type of the message to be sent and received must be the same.
   * @param type the message type
   * @param data the message content
   * @param options
   * @returns
   */
  public postAndReceiveMessage<T>(
    type: string | number,
    data: any,
    options?: PostMessageOptions,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.webviewApi) {
        reject(new Error('acquireVsCodeApi is not available'));
        return;
      }

      const opts = Object.assign({}, globalPostMessageOptions, options);
      const post = () => {
        this._postMessage(type, data, opts);
      };

      const intervalId = setInterval(post, opts.interval ?? INTERVAL);

      const timeoutId = setTimeout(() => {
        window.removeEventListener('message', receive);
        clearInterval(intervalId);
        reject(new Error('Timeout'));
      }, opts.timeout ?? TIMEOUT);

      const receive = (e: MessageEvent<any>) => {
        console.log(e);
        if (!e.origin.startsWith('vscode-webview://') || e.data?.type !== type) {
          return;
        }

        window.removeEventListener('message', receive);
        clearTimeout(timeoutId);
        clearInterval(intervalId);

        resolve(e.data?.data);
      };

      window.addEventListener('message', receive);
      post();
    });
  }

  on<T>(type: string, listener: PostMessageListener<T>) {
    this.listeners.set(type, listener);
  }

  off(type: string) {
    this.listeners.delete(type);
  }

  /**
   * Get the persistent state stored for this webview.
   *
   * @return The current state or `undefined` if no state has been set.
   */
  async getState(): Promise<any> {
    return this.webviewApi?.getState();
  }

  /**
   * Set the persistent state stored for this webview.
   *
   * @param newState New persisted state. This must be a JSON serializable object. Can be retrieved
   * using {@link getState}.
   *
   * @return The new state.
   */
  setState<T>(state: T) {
    this.webviewApi?.setState(state);
    return state;
  }
}

/**
 * the vscode webview api
 */
export const vscodeWebview = new VSCodeWebview();
