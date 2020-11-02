import { firestore } from "firebase";

import Tag from "../tags/Tag";

export default class Project {
  public readonly id: string;

  private readonly content: string;

  private readonly cover: string;

  private readonly description: string;

  private readonly developmentStart?: firestore.Timestamp;

  private readonly name: string;

  private readonly release?: firestore.Timestamp;

  private readonly tags: Tag[];

  private readonly url: string;

  public constructor (
    id: string,
    content: string,
    cover: string,
    description: string,
    name: string,
    tags: Tag[],
    url: string,
    developmentStart?: firestore.Timestamp,
    release?: firestore.Timestamp
  ) {
    this.id = id;
    this.content = content;
    this.cover = cover;
    this.description = description;
    this.developmentStart = developmentStart;
    this.name = name;
    this.release = release;
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

    const media = document.createElement("div");
    media.className = "media";
    cardContent.appendChild(media);

    const mediaLeft = document.createElement("div");
    mediaLeft.className = "media-content";
    media.appendChild(mediaLeft);

    const title = document.createElement("h4");
    title.className = "title is-4";
    title.textContent = this.name;
    mediaLeft.appendChild(title);

    const mediaRight = document.createElement("div");
    mediaRight.className = "media-right";
    media.appendChild(mediaRight);

    if (this.release) {
      const date = document.createElement("time");
      date.dateTime = this.release.toDate().toISOString();
      date.textContent = this.release.toDate().toLocaleString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      mediaRight.appendChild(date);
    }

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
    side.className = "column is-2 box content";
    contentColumns.appendChild(side);

    if (this.developmentStart) {
      const devStart = document.createElement("h6");
      devStart.className = "title is-6";
      devStart.textContent = "Development started";
      side.appendChild(devStart);

      devStart.appendChild(document.createElement("br"));

      const devStartTime = document.createElement("time");
      devStartTime.className = "subtitle is-6";
      devStartTime.dateTime = this.developmentStart.toDate().toISOString();
      devStartTime.textContent = this.developmentStart.toDate().toLocaleDateString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      devStart.appendChild(devStartTime);
    }

    if (this.release) {
      const release = document.createElement("h6");
      release.className = "title is-6";
      release.textContent = "First release";
      side.appendChild(release);

      release.appendChild(document.createElement("br"));

      const releaseTime = document.createElement("time");
      releaseTime.className = "subtitle is-6";
      releaseTime.dateTime = this.release.toDate().toISOString();
      releaseTime.textContent = this.release.toDate().toLocaleDateString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      release.appendChild(releaseTime);
    }

    const directLinkTitle = document.createElement("h6");
    directLinkTitle.className = "title is-6";
    directLinkTitle.textContent = "Direct link";
    side.appendChild(directLinkTitle);

    const directLinkContainer = document.createElement("h6");
    directLinkContainer.className = "subtitle is-6";
    side.appendChild(directLinkContainer);

    directLinkContainer.appendChild(subtitleAnchor.cloneNode(true));

    const tagsTitle = document.createElement("h6");
    tagsTitle.textContent = "Tags";
    side.appendChild(tagsTitle);

    const tagsContainer = document.createElement("div");
    tagsContainer.className = "tags";
    side.appendChild(tagsContainer);

    this.tags.forEach(t => {
      const tagEl = document.createElement("span");
      tagEl.className = "tag";
      tagEl.textContent = t.name;
      tagsContainer.appendChild(tagEl);
    });
  }

  private getPermURL (): string {
    return `/projects/project.html?id=${this.id}`;
  }
}
