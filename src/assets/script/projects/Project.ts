import Tag from "../tags/Tag";

export default class Project {
  public readonly id: string;

  private readonly content: string;

  private readonly cover: string;

  private readonly description: string;

  private readonly name: string;

  private readonly tags: Tag[];

  private readonly url: string;

  public constructor (id: string, content: string, cover: string, description: string, name: string, tags: Tag[], url: string) {
    this.id = id;
    this.content = content;
    this.cover = cover;
    this.description = description;
    this.name = name;
    this.tags = tags;
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
    img.src = this.cover;
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

  public renderContent (container: HTMLElement): void {
    const title = document.createElement("h3");
    title.className = "title is-3";
    title.textContent = this.name;
    container.appendChild(title);

    const subtitle = document.createElement("h6");
    subtitle.className = "subtitle is-6";
    container.appendChild(subtitle);

    const subtitleAnchor = document.createElement("a");
    subtitleAnchor.href = this.url;
    subtitleAnchor.textContent = this.url;
    subtitleAnchor.target = "_blank";
    subtitleAnchor.rel = "noopener noreferrer";
    subtitle.appendChild(subtitleAnchor);

    const contentColumns = document.createElement("div");
    contentColumns.className = "columns";
    container.appendChild(contentColumns);

    const content = document.createElement("div");
    content.className = "content column is-10";
    content.innerHTML = this.content;
    contentColumns.appendChild(content);

    const side = document.createElement("side");
    side.className = "column is-2 box";

    const tagsContainer = document.createElement("div");
    tagsContainer.className = "tags";
    this.tags.forEach(t => {
      const tagEl = document.createElement("span");
      tagEl.className = "tag is-medium";
      tagEl.textContent = t.name;
      tagsContainer.appendChild(tagEl);
    });

    side.appendChild(tagsContainer);

    contentColumns.appendChild(side);
  }

  private getPermURL (): string {
    return `/projects/project.html?id=${this.id}`;
  }
}
