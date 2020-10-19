export default class Project {
  public readonly id: string;

  private readonly content: string;

  private readonly coverImage: string;

  private readonly description: string;

  private readonly name: string;

  private readonly url: string;

  public constructor (id: string, content: string, coverImage: string, description: string, name: string, url: string) {
    this.id = id;
    this.content = content;
    this.coverImage = coverImage;
    this.description = description;
    this.name = name;
    this.url = url;
  }

  public createCard (elementId: string): HTMLDivElement {
    const card = document.createElement("div");
    card.id = elementId;
    card.className = "card";

    // Image
    const cardImage = document.createElement("div");
    cardImage.className = "card-image";
    card.appendChild(cardImage);

    const figure = document.createElement("figure");
    figure.className = "image is-2by1";
    cardImage.appendChild(figure);

    const imageAnchor = document.createElement("a");
    imageAnchor.href = this.getPermURL();
    figure.appendChild(imageAnchor);

    const img = document.createElement("img");
    img.src = this.coverImage;
    imageAnchor.appendChild(img);

    // Content
    const cardContent = document.createElement("div");
    cardContent.className = "card-content";
    card.appendChild(cardContent);

    const title = document.createElement("h4");
    title.className = "title is-4";
    title.textContent = this.name;
    cardContent.appendChild(title);

    const content = document.createElement("div");
    content.className = "content";
    content.textContent = this.description.slice(0, 170);
    cardContent.appendChild(content);

    const readMoreAnchor = document.createElement("a");
    readMoreAnchor.href = this.getPermURL();
    readMoreAnchor.textContent = " ...read more";
    content.appendChild(readMoreAnchor);

    // Footer
    const cardFooter = document.createElement("footer");
    cardFooter.className = "card-footer";
    card.appendChild(cardFooter);

    const anchor = document.createElement("a");
    anchor.className = "card-footer-item";
    anchor.href = this.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = this.url;
    cardFooter.appendChild(anchor);

    return card;
  }

  public removeCard (): void {
    const card = document.getElementById(`project-${this.id}`);
    card?.remove();
  }

  public renderCard (container: HTMLElement): void {
    container.appendChild(this.createCard(`project-${this.id}`));
  }

  private getPermURL (): string {
    return `/projects/project.html?id=${this.id}`;
  }
}
