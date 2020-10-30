interface SimpleTag {
  name: string;
}

const TAG_REGEX: RegExp = /^[A-Z ]+$/i;

export default class TagsInput {
  private _tags: SimpleTag[];

  private readonly inputEl: HTMLInputElement;

  private readonly tagContainer: HTMLElement;

  public get tags (): readonly SimpleTag[] {
    return this._tags;
  }

  public constructor (inputEl: HTMLInputElement, tagContainer: HTMLElement) {
    this.inputEl = inputEl;
    this.tagContainer = tagContainer;
    this._tags = [];

    this.inputEl.addEventListener("keypress", this.handleKeyPress.bind(this));
  }

  private handleKeyPress (event: KeyboardEvent): void {
    const tagName = this.inputEl.value.trim();

    if (event.key === "," && tagName !== "") {
      event.preventDefault();
      this._tags.push({ name: tagName });
      this.inputEl.value = "";

      const tagEl = document.createElement("span");
      tagEl.className = "tag mr-1";
      tagEl.textContent = tagName;

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete is-small";
      deleteBtn.addEventListener("click", () => this.removeTag(tagName, tagEl));
      tagEl.appendChild(deleteBtn);

      this.tagContainer.insertBefore(tagEl, this.inputEl);
    } else if (!TAG_REGEX.test(event.key)) event.preventDefault();
  }

  private removeTag (tagName: string, tagEl: HTMLSpanElement): void {
    const tagIndex = this._tags.findIndex(t => t.name === tagName);
    if (tagIndex >= 0) this._tags.splice(tagIndex, 1);
    tagEl.remove();
  }
}
