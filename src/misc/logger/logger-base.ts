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
    if (!this.isEnabled()) {
      return LogNoOp;
    }
    const boundLogFn: (...args: any) => void = console.log.bind(
      console,
      this.title
    );
    return boundLogFn;
  }

  public get warn() {
    if (!this.isEnabled()) {
      return LogNoOp;
    }
    const boundLogFn: (...args: any) => void = console.warn.bind(
      console,
      this.title
    );
    return boundLogFn;
  }

  public get error() {
    if (!this.isEnabled()) {
      return LogNoOp;
    }
    const boundLogFn: (...args: any) => void = console.error.bind(
      console,
      this.title
    );
    return boundLogFn;
  }
}
