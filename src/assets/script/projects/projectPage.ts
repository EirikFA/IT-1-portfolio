import { auth, db } from "../../../fb";
import TagManager from "../tags/TagManager";
import Project from "./Project";
import { ProjectManager } from "./ProjectManager";

const container = document.getElementById("project");

if (container) {
  const query = new URLSearchParams(window.location.search);
  const id = query.get("id");

  if (id) {
    const tagManager = new TagManager(db);
    const manager = new ProjectManager(db, tagManager);

    const handleDelete = async (project: Project): Promise<void> => {
      // TODO: Replace with Bulma modal or equivalent
      // eslint-disable-next-line no-alert
      const doDelete = confirm(`Are you sure you want to delete ${project.name}?`);
      if (doDelete) {
        await manager.delete(project);
        return location.replace("/");
      }

      return undefined;
    };

    manager.load(id).then(project => {
      auth.onAuthStateChanged(async user => {
        if (project) {
          const tokenResult = await user?.getIdTokenResult();
          project.renderContent(container, tokenResult && tokenResult.claims.editor === true, handleDelete);
        }
        // TODO: Render "not found"
      });
    });
  }
}
