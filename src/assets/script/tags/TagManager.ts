import { firestore } from "firebase/app";

import { TagData } from "../../../types";
import Tag from "./Tag";

export default class TagManager {
  private _tags: Tag[];

  private readonly db: firestore.Firestore;

  private tagCollection: firestore.CollectionReference<TagData>;

  public get tags (): readonly Tag[] {
    return this._tags;
  }

  public constructor (db: firestore.Firestore) {
    this.db = db;
    this.tagCollection = this.db.collection("tags") as firestore.CollectionReference<TagData>;
    this._tags = [];
  }

  public async getMultiple (ids: string[]): Promise<Tag[]> {
    const promises = ids.map(id => this.loadOne(id));
    const tags = await Promise.all(promises);

    // TypeScript does not handle type narrowing from `Array.filter` (yet - https://github.com/microsoft/TypeScript/issues/16069)
    return tags.filter(tag => !!tag) as Tag[];
  }

  public async loadAll (): Promise<void> {
    const snapshot = await this.tagCollection.get();
    snapshot.docs.forEach(doc => {
      this._tags.push(new Tag(doc.id, doc.data().name));
    });
  }

  private async loadOne (id: string): Promise<Tag | undefined> {
    const loaded = this._tags.find(t => t.id === id);
    if (loaded) return loaded;

    const doc = await this.tagCollection.doc(id).get();
    const data = doc.data();

    if (data) {
      const tag = new Tag(doc.id, data.name);
      this._tags.push(tag);
      return tag;
    }

    return undefined;
  }
}
