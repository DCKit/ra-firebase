export class LoggerBase {
  enabled: boolean = false;
  constructor(private title: string, private cacheEnabledKey: string) {
    this.enabled = false
  }

  private isEnabled() {
    return this.enabled;
  }

  SetEnabled(isEnabled: boolean) {
    this.enabled = isEnabled;
  }

  public log(...args: any) {
    if (!this.enabled) return
    console.log(this.title, ...args)
  }
  public warn(...args: any) {
    if (!this.enabled) return
    console.warn(this.title, ...args)
  }
  public error(...args: any) {
    if (!this.enabled) return
    console.error(this.title, ...args)
  }
}
