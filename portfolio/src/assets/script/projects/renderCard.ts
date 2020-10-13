import { firestore } from "firebase/app";

import { ProjectData } from "../../../types";

export default (projectDoc: firestore.QueryDocumentSnapshot<ProjectData>): HTMLDivElement => {
  const { name, content } = projectDoc.data();

  const card = document.createElement("div");
  card.id = `project-${projectDoc.id}`;
  card.className = "project-card column is-3 content";

  if (content) {
    card.innerHTML = content;
  } else {
    card.textContent = name;
  }

  return card;
};
