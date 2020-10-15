export interface Listener {
  (...args: any[]): void;
}

export default class CustomEmitter {
  private listeners: Map<string, Listener[]>;

  public constructor () {
    this.listeners = new Map<string, Listener[]>();
  }

  public off (event: string, listener: Listener): void {
    const listeners = this.listeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index >= 0) {
      listeners.splice(index, 1);
      this.listeners.set(event, listeners);
    }
  }

  public on (event: string, listener: Listener): void {
    const listeners = this.listeners.get(event) || [];
    listeners.push(listener);
    this.listeners.set(event, listeners);
  }

  protected emit (event: string, ...args: any[]): void {
    const listeners = this.listeners.get(event);
    listeners?.forEach(handler => handler.apply(this, args));
  }
}
