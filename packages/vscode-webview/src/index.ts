import type { WebviewApi as VsCodeWebviewApi } from 'vscode-webview';

export type PostMessageOptions = PostMessageAsyncOptions & PostMessageDataOptions;

export interface PostMessageAsyncOptions {
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
}

export interface PostMessageDataOptions {
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
const TYPE_KEY = 'type';
const DATA_KEY = 'data';

const globalPostMessageOptions: PostMessageOptions = {
  interval: INTERVAL,
  timeout: TIMEOUT,
  typeKey: TYPE_KEY,
  dataKey: DATA_KEY,
};

function isNil(v: any) {
  return typeof v === 'undefined' || v === null;
}

export type PostMessageListener<T> = (data: T) => void | Promise<void>;

/**
 * A utility wrapper around the acquireVsCodeApi() function, which enables
 * message passing and state management between the webview and extension
 * contexts.
 */
export class WebviewApi<StateType = any> {
  private readonly webviewApi!: VsCodeWebviewApi<StateType>;
  private _options: PostMessageOptions = {
    interval: INTERVAL,
    timeout: TIMEOUT,
  };

  private listeners: Map<string | number, PostMessageListener<any>[]> = new Map();

  constructor(options?: PostMessageOptions) {
    if (typeof acquireVsCodeApi !== 'function') {
      console.error('acquireVsCodeApi is not a function');
      return;
    }

    this.setOptions(options || {});
    this.webviewApi = acquireVsCodeApi();

    window.addEventListener('message', event => {
      const message = event.data || {};
      const { typeKey, dataKey } = this._options;
      this._runListener(message[typeKey ?? TYPE_KEY], message[dataKey ?? DATA_KEY]);
    });
  }

  /**
   * set the post message options
   * @param options
   */
  public setOptions(options: PostMessageOptions) {
    this._options = Object.assign({}, globalPostMessageOptions, this._options, options);
  }

  private _postMessage(type: string | number, data: any | undefined, options: PostMessageOptions) {
    if (!this.webviewApi) {
      return;
    }

    this.webviewApi.postMessage({
      [options.typeKey ?? TYPE_KEY]: type,
      [options.dataKey ?? DATA_KEY]: data,
    });
  }

  private _runListener(type: string | number, result: any, error?: any) {
    if (isNil(type) || this.listeners.size === 0) {
      return;
    }
    const listeners = this.listeners.get(type);
    if (listeners) {
      if (!isNil(result)) {
        listeners[0] && listeners[0](result);
      }
      if (!isNil(error)) {
        listeners[1] && listeners[1](error);
      }
    }
  }

  /**
   * Post a message to the owner of the webview
   * @param type the message type
   * @param data the message content
   * @param options
   */

  public post(type: string | number, data: any | undefined) {
    this._postMessage(type, data, this._options);
  }

  /**
   * Post a message to the owner of the webview, and return the response. The type of the message to be sent and received must be the same.
   * @param type the message type
   * @param data the message content
   * @param options
   * @returns
   */
  public postAndReceive<T>(
    type: string | number,
    data: any | undefined,
    options?: PostMessageAsyncOptions,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.webviewApi) {
        reject(new Error('acquireVsCodeApi is not available'));
        return;
      }

      const opts = Object.assign({}, this._options, options);
      const post = () => {
        this._postMessage(type, data, opts);
      };

      const intervalId = setInterval(post, opts.interval ?? INTERVAL);

      const timeoutId = setTimeout(() => {
        window.removeEventListener('message', receive);
        clearInterval(intervalId);

        this._runListener(type, undefined, new Error('Timeout'));

        reject(new Error('Timeout'));
      }, opts.timeout ?? TIMEOUT);

      const receive = (e: MessageEvent<any>) => {
        if (
          !e.origin.startsWith('vscode-webview://') ||
          !e.data ||
          e.data[opts.typeKey ?? TYPE_KEY] !== type
        ) {
          return;
        }

        window.removeEventListener('message', receive);
        clearTimeout(timeoutId);
        clearInterval(intervalId);

        const res = e.data[opts.dataKey ?? DATA_KEY];
        this._runListener(type, res);
        resolve(res);
      };

      window.addEventListener('message', receive);
      post();
    });
  }

  /**
   * Register a listener for a message type
   * @param type the message type
   * @param success the success listener
   * @param fail the fail listener
   */
  on<T>(type: string | number, success: PostMessageListener<T>, fail?: PostMessageListener<any>) {
    this.listeners.set(type, fail ? [success, fail] : [success]);
  }

  /**
   * Remove a listener for a message type
   * @param type the message type
   */
  off(type: string | number) {
    this.listeners.delete(type);
  }

  /**
   * Post a message to the owner of the webview
   * @param message the message content
   */
  postMessage<T = any>(message: T) {
    this.webviewApi.postMessage(message);
  }

  /**
   * Get the persistent state stored for this webview.
   *
   * @return The current state or `undefined` if no state has been set.
   */
  getState(): StateType | undefined {
    return this.webviewApi.getState();
  }

  /**
   * Set the persistent state stored for this webview.
   *
   * @param newState New persisted state. This must be a JSON serializable object. Can be retrieved
   * using {@link getState}.
   *
   * @return The new state.
   */
  setState<T extends StateType | undefined>(newState: T): T {
    this.webviewApi.setState(newState);
    return newState;
  }
}
