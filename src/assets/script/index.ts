import { auth, db } from "../../fb";
import Project from "./projects/Project";
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
const tagFilterList = document.getElementById("tag-filter-list");

if (container) {
  const renderProject = (project: Project): void => {
    const id = `project-${project.id}`;
    if (document.getElementById(id)) return;

    const cardContainer = document.createElement("div");
    cardContainer.id = `project-${project.id}`;
    cardContainer.className = "column is-6";
    container.appendChild(cardContainer);

    project.renderCard(cardContainer);
  };

  const removeProject = (project: Project): void => {
    const card = document.getElementById(`project-${project.id}`);
    card?.remove();
  };

  const tagManager = new TagManager(db);
  tagManager.loadAll().then(() => {
    const manager = new ProjectManager(db, tagManager);

    const allProjects: Project[] = [];

    manager.on("new-project", project => {
      renderProject(project);
      allProjects.push(project);
    });

    manager.on("removed-project", project => {
      removeProject(project);
      const i = allProjects.findIndex(p => p.id === project.id);
      if (i >= 0) allProjects.splice(i, 1);
    });

    manager.listen();

    if (tagFilterList) {
      const tagFilter: string[] = [];

      for (const tag of tagManager.tags) {
        const li = document.createElement("li");
        tagFilterList.appendChild(li);

        const a = document.createElement("a");
        a.href = "#";
        li.appendChild(a);

        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = tag.name;
        a.addEventListener("click", e => {
          e.preventDefault();

          span.classList.toggle("is-primary");

          const tagIndex = tagFilter.indexOf(tag.id);
          if (tagIndex >= 0) tagFilter.splice(tagIndex, 1);
          else tagFilter.push(tag.id);

          allProjects.forEach(project => {
            // If there are no filters or project has any of the filtered tags, render its card, otherwise remove it
            if (tagFilter.length === 0 || project.tags.some(t => tagFilter.includes(t.id))) {
              renderProject(project);
            } else removeProject(project);
          });
        });
        a.appendChild(span);
      }
    }
  });
}
