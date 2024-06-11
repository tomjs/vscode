import cloneDeep from 'lodash.clonedeep';
import { ConfigurationTarget, workspace } from 'vscode';

export class Configuration<T> {
  private _defaultValues: T = {} as T;
  private _values: T = {} as T;
  private identifier: string;
  constructor(identifier: string, defaultValues?: T) {
    this.identifier = identifier;
    this._defaultValues = Object.assign({}, defaultValues);
  }

  configuration() {
    return workspace.getConfiguration(this.identifier);
  }

  /**
   * Return a value from this configuration.
   * @param section — Configuration name, supports dotted names.
   * @param defaultValue — A value should be returned when no value could be found, is undefined.
   * @returns — The value section denotes or the default.
   */
  get<T>(section: string): T | undefined;
  get<T>(section: string, defaultValue: T): T | undefined;
  get<T>(section: string, defaultValue?: T): T | undefined {
    return this.configuration().get(section, defaultValue ?? this._defaultValues[section]);
  }

  /**
   * Get all Configuration values.
   */
  values(): T {
    const values = Object.assign({});
    const cfg = this.configuration();
    Object.keys(cfg)
      .filter(key => typeof cfg[key] !== 'function')
      .forEach(key => {
        values[key] = cfg.get(key) ?? cloneDeep(this._defaultValues[key]);
      });
    return values;
  }

  /**
   * Update a configuration value. The updated configuration values are persisted.
   * @param section Configuration name, supports dotted names.
   * @param value  The new value.
   * @param target The {@link ConfigurationTarget configuration target} or a boolean value. Defaults to `true`
   *	- If `true` updates {@link ConfigurationTarget.Global Global settings}.
   *	- If `false` updates {@link ConfigurationTarget.Workspace Workspace settings}.
   *	- If `undefined` or `null` updates to {@link ConfigurationTarget.WorkspaceFolder Workspace folder settings} if configuration is resource specific,
   * 	otherwise to {@link ConfigurationTarget.Workspace Workspace settings}.
   */
  async update(
    section: string,
    value: any,
    target?: ConfigurationTarget | boolean | null,
  ): Promise<void>;

  /**
   * Update configuration values. The updated configuration values are persisted.
   * @param values Configuration names and values, supports dotted names.
   * @param target The {@link ConfigurationTarget configuration target} or a boolean value. Defaults to `true`
   *	- If `true` updates {@link ConfigurationTarget.Global Global settings}.
   *	- If `false` updates {@link ConfigurationTarget.Workspace Workspace settings}.
   *	- If `undefined` or `null` updates to {@link ConfigurationTarget.WorkspaceFolder Workspace folder settings} if configuration is resource specific,
   * 	otherwise to {@link ConfigurationTarget.Workspace Workspace settings}.
   */
  async update(values: T, target?: ConfigurationTarget | boolean | null): Promise<void>;
  async update(section: string | T, value: any, target?: ConfigurationTarget | boolean | null) {
    const values: any = {};
    let _target: ConfigurationTarget | boolean | undefined | null;
    if (typeof section === 'string') {
      values[section] = value;
      _target = target;
    } else if (typeof section === 'object') {
      Object.assign(values, section);
      _target = value;
    } else {
      throw new Error('');
    }

    const cfg = this.configuration();
    await Promise.all(
      Object.keys(values).map(key =>
        cfg.update(key, values[key], _target ?? ConfigurationTarget.Global).then(() => {
          this._values[key] = values[key];
        }),
      ),
    );
  }
}
