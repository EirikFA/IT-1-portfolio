import { auth, db } from "../../fb";
import { ProjectManager } from "./projects/ProjectManager";

const newButton = document.getElementById("new-project-button");

auth.onAuthStateChanged(async user => {
  if (user && newButton) {
    const tokenResult = await user.getIdTokenResult();
    if (tokenResult.claims.editor === true) {
      newButton.style.display = "block";
    }
  } else if (newButton) {
    newButton.style.display = "none";
  }
});

const container = document.getElementById("projects");

if (container) {
  const manager = new ProjectManager(db);

  manager.on("new-project", project => project.renderCard(container));
  manager.on("removed-project", project => project.removeCard());
  manager.listen();
}
