import { db } from "../../../fb";
import { ProjectManager } from "./ProjectManager";

const container = document.getElementById("project");

if (container) {
  const query = new URLSearchParams(window.location.search);
  const id = query.get("id");

  if (id) {
    const manager = new ProjectManager(db);
    manager.load(id).then(project => {
      project.renderContent(container);
    });
  }
}
