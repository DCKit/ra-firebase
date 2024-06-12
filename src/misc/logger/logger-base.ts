type LogFn = (...args: any) => void;

export const LogNoOp: LogFn = (...args: any) => null;

export class LoggerBase {
  enabled: boolean = false;
  constructor(private title: string, private cacheEnabledKey: string) {}

  private isEnabled() {
    return this.enabled;
  }

  SetEnabled(isEnabled: boolean) {
    this.enabled = isEnabled;
  }

  public get log() {
    return this.enabled ? (...args: any) => console.log(this.title, ...args) : LogNoOp;
  }

  public get warn() {
    return this.enabled ? (...args: any) => console.warn(this.title, ...args) : LogNoOp;
  }

  public get error() {
    return this.enabled ? (...args: any) => console.error(this.title, ...args) : LogNoOp;
  }
}
