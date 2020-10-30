import { db } from "../../../fb";
import TagManager from "../tags/TagManager";
import { ProjectManager } from "./ProjectManager";

const container = document.getElementById("project");

if (container) {
  const query = new URLSearchParams(window.location.search);
  const id = query.get("id");

  if (id) {
    const tagManager = new TagManager(db);
    const manager = new ProjectManager(db, tagManager);
    manager.load(id).then(project => {
      project.renderContent(container);
    });
  }
}
