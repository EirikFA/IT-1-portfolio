import { firestore } from "firebase/app";

import { auth, db } from "../../fb";
import { ProjectData } from "../../types";
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
const orderFieldList = document.getElementById("order-field-list");
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

  const renderAllProjects = (projects: Project[]): void => {
    projects.forEach(p => renderProject(p));
  };

  const removeProject = (project: Project): void => {
    const card = document.getElementById(`project-${project.id}`);
    card?.remove();
  };

  const removeAllProjects = (projects: Project[]): void => {
    projects.forEach(p => removeProject(p));
  };

  const tagManager = new TagManager(db);
  tagManager.loadAll().then(() => {
    const manager = new ProjectManager(db, tagManager);

    // We store all projects and do ordering/filtering on the client for performance and simplicity
    // There will never be enough projects to make this "bad practice"
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

    let currentSort: { field: string | null, order: string | null } = {
      field: null,
      order: null
    };
    let currentSortAnchor: HTMLElement | null | undefined;

    if (orderFieldList) {
      orderFieldList.childNodes.forEach(fieldItem => {
        if (fieldItem instanceof HTMLElement) {
          fieldItem.addEventListener("click", () => {
            const { field, order } = fieldItem.dataset;
            if (field && order) {
              // If data attributes exist and either changed
              if (field && order && (field !== currentSort.field || order !== currentSort.order)) {
                currentSort = {
                  field,
                  order
                };

                if (currentSortAnchor) currentSortAnchor.classList.toggle("is-active");

                const anchor = fieldItem.querySelector("a");
                currentSortAnchor = anchor;
                if (anchor) {
                  anchor.classList.toggle("is-active");
                }

                allProjects.sort((a, b) => {
                  const aVal = a[field as keyof ProjectData];
                  const bVal = b[field as keyof ProjectData];

                  let aParsed: number;
                  let bParsed: number;

                  if (typeof aVal === "number" && typeof bVal === "number") {
                    aParsed = aVal;
                    bParsed = bVal;
                  } else if (aVal instanceof firestore.Timestamp && bVal instanceof firestore.Timestamp) {
                    aParsed = aVal.toMillis();
                    bParsed = bVal.toMillis();
                  // Put undefined/nulls last
                  } else if (aVal && !bVal) return -1;
                  else if (!aVal && bVal) return 1;
                  else return 0;

                  if (aParsed > bParsed) return order === "desc" ? -1 : 1;
                  if (aParsed < bParsed) return order === "desc" ? 1 : -1;
                  return 0;
                });

                console.log(allProjects);
                removeAllProjects(allProjects);
                renderAllProjects(allProjects);
              }
            }
          });
        }
      });
    }

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
        li.addEventListener("click", e => {
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
