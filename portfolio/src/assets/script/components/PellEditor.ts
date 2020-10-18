import { exec, init, pellAction } from "pell";

export default class PellEditor<Container extends HTMLElement> {
  private _content: string;

  public get content (): string {
    return this._content;
  }

  private readonly container: Container;

  public constructor (container: Container) {
    this.container = container;
    this._content = "";
  }

  public exec (...args: Parameters<typeof exec>): ReturnType<typeof exec> {
    return exec(...args);
  }

  public load (actions: pellAction[] = []) {
    init({
      element: this.container,
      onChange: html => {
        this._content = html;
      },
      actions: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "heading1",
        "heading2",
        "paragraph",
        "quote",
        "olist",
        "ulist",
        "code",
        "line",
        "link",
        ...actions
      ]
    });
  }
}
