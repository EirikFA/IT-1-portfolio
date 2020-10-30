import { firestore } from "firebase/app";

import { TagData } from "../../../types";
import Tag from "./Tag";

export default class TagManager {
  private readonly db: firestore.Firestore;

  private tagCollection: firestore.CollectionReference<TagData>;

  private tags: Tag[];

  public constructor (db: firestore.Firestore) {
    this.db = db;
    this.tagCollection = this.db.collection("tags") as firestore.CollectionReference<TagData>;
    this.tags = [];
  }

  public async getMultiple (ids: string[]): Promise<Tag[]> {
    const promises: Promise<Tag | undefined>[] = [];
    const tags: Tag[] = [];

    for (const id of ids) {
      const loaded = this.tags.find(t => t.id === id);
      if (loaded) tags.push(loaded);
      else {
        promises.push(this.loadOne(id));
      }
    }

    const allTags = [...await Promise.all(promises), ...tags];

    // TypeScript does not handle type narrowing from `Array.filter` (yet - https://github.com/microsoft/TypeScript/issues/16069)
    return allTags.filter(tag => !!tag) as Tag[];
  }

  public async loadAll (): Promise<void> {
    const snapshot = await this.tagCollection.get();
    snapshot.docs.forEach(doc => {
      this.tags.push(new Tag(doc.id, doc.data().name));
    });
  }

  private async loadOne (id: string): Promise<Tag | undefined> {
    const doc = await this.tagCollection.doc(id).get();
    const data = doc.data();

    return data ? new Tag(doc.id, data.name) : undefined;
  }
}
