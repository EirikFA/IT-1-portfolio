import { auth, db } from "../../fb";
import { ProjectManager } from "./projects/ProjectManager";
import TagManager from "./tags/TagManager";

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
  const tagManager = new TagManager(db);
  // TODO: Load all tags on page load (for filtering)
  const manager = new ProjectManager(db, tagManager);

  manager.on("new-project", project => {
    const cardContainer = document.createElement("div");
    cardContainer.className = "column is-6";
    container.appendChild(cardContainer);

    project.renderCard(cardContainer);
  });
  manager.on("removed-project", project => project.removeCard());
  manager.listen();
}
