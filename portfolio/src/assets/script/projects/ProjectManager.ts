import { firestore } from "firebase/app";

import { ProjectData } from "../../../types";
import CustomEmitter from "../../../util/CustomEmitter";
import Project from "./Project";

export declare interface ProjectManager {
  on (event: "new-project", listener: (project: Project) => void): this;
  on (event: "removed-project", listener: (project: Project) => void): this;
}

export class ProjectManager extends CustomEmitter {
  private readonly db: firestore.Firestore;

  private projectCollection: firestore.Query<ProjectData>;

  private readonly projects: Project[];

  public constructor (db: firestore.Firestore) {
    super();
    this.db = db;
    this.projectCollection = this.db.collectionGroup("projects") as firestore.Query<ProjectData>;
    this.projects = [];
  }

  public listen (): void {
    this.projectCollection.onSnapshot(this.snapshotHandler.bind(this));
  }

  private snapshotHandler (snapshot: firestore.QuerySnapshot<ProjectData>) {
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        const data = change.doc.data();

        const project = new Project(change.doc.id, data.content, data.coverImage, data.description, data.name, data.url);
        this.projects.push(project);
        this.emit("new-project", project);
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
