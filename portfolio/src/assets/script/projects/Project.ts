export default class Project {
  public readonly id: string;

  private readonly content: string;

  private readonly name: string;

  public constructor (content: string, id: string, name: string) {
    this.content = content;
    this.id = id;
    this.name = name;
  }

  public createCard (elementId: string): HTMLDivElement {
    const card = document.createElement("div");
    card.id = elementId;
    card.className = "project-card column is-3 content";
    card.innerHTML = `<h3>${this.name}</h3>${this.content}`;

    return card;
  }

  public removeCard (): void {
    const card = document.getElementById(`project-${this.id}`);
    card?.remove();
  }

  public renderCard (container: HTMLElement): void {
    container.appendChild(this.createCard(`project-${this.id}`));
  }
}
