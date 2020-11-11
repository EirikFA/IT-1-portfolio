import { firestore } from "firebase/app";

import { ProjectData } from "../../../types";
import CustomEmitter from "../../../util/CustomEmitter";
import TagManager from "../tags/TagManager";
import Project from "./Project";

export declare interface ProjectManager {
  on (event: "new-project", listener: (project: Project) => void): this;
  on (event: "removed-project", listener: (project: Project) => void): this;
}

export class ProjectManager extends CustomEmitter {
  private readonly db: firestore.Firestore;

  private projectCollection: firestore.Query<ProjectData>;

  private projects: Project[];

  private readonly tagManager: TagManager;

  public constructor (db: firestore.Firestore, tagManager: TagManager) {
    super();
    this.db = db;
    this.projectCollection = this.db.collectionGroup("projects") as firestore.Query<ProjectData>;
    this.projects = [];
    this.tagManager = tagManager;
  }

  public async delete (project: Project): Promise<void> {
    await project.ref.delete();
    const i = this.projects.findIndex(p => p.id === project.id);
    if (i >= 0) this.projects.splice(i, 1);
  }

  public listen (): void {
    this.projectCollection.orderBy("priority", "desc").onSnapshot(this.snapshotHandler.bind(this));
  }

  public async load (id: string): Promise<Project | undefined> {
    const snapshot = await this.projectCollection.where("id", "==", id).get();

    if (snapshot.docs.length === 0) return undefined;

    const doc = snapshot.docs[0];
    const data = doc.data();
    const tags = await this.tagManager.getMultiple(data.tags);
    const project = new Project(
      doc.id,
      data.content,
      data.cover,
      data.description,
      data.name,
      data.priority,
      doc.ref,
      tags,
      data.url,
      data.developmentStart,
      data.release
    );
    this.projects.push(project);

    return project;
  }

  private snapshotHandler (snapshot: firestore.QuerySnapshot<ProjectData>) {
    snapshot.docChanges().forEach(async change => {
      if (change.type === "added") {
        // Project may already have been loaded by `ProjectManager.load`
        const existing = this.projects.find(p => p.id === change.doc.id);
        if (!existing) {
          const data = change.doc.data();
          const tags = await this.tagManager.getMultiple(data.tags);

          const project = new Project(
            change.doc.id,
            data.content,
            data.cover,
            data.description,
            data.name,
            data.priority,
            change.doc.ref,
            tags,
            data.url,
            data.developmentStart,
            data.release
          );

          this.projects.push(project);
          this.emit("new-project", project);
        }
      } else if (change.type === "removed") {
        const index = this.projects.findIndex(p => p.id === change.doc.id);
        if (index >= 0) {
          this.emit("removed-project", this.projects[index]);
          this.projects.splice(index, 1);
        }
      }
    });
  }
}
