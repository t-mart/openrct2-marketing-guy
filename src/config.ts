export interface ConfigItemOptions {
  key: string;
  storage: "park" | "shared";
}

export class ConfigItem<T> {
  options: ConfigItemOptions;

  constructor(options: ConfigItemOptions) {
    this.options = options;
  }

  private getStorage() {
    switch (this.options.storage) {
      case "park": {
        return context.getParkStorage();
      }
      case "shared": {
        return context.sharedStorage;
      }
    }
  }

  get() {
    return this.getStorage().get<T>(this.options.key);
  }

  getOrDefault(defaultValue: T) {
    return this.getStorage().get<T>(this.options.key, defaultValue);
  }

  set(value: T) {
    this.getStorage().set<T>(this.options.key, value);
  }

  clear() {
    this.getStorage().set<undefined>(this.options.key, undefined);
  }
}