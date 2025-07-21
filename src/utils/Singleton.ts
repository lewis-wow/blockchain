export class Singleton<T> {
  static readonly instances = new Set<() => unknown>();

  private instance: T;

  constructor(fn: () => T) {
    this.instance = fn();
    Singleton.instances.add(fn);
  }

  public getInstance(): T {
    return this.instance;
  }
}
