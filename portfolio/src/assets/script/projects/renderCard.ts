import { firestore } from "firebase/app";
import { ProjectData } from "types";

export default (projectDoc: firestore.QueryDocumentSnapshot<ProjectData>): HTMLDivElement => {
  const { name } = projectDoc.data();

  const card = document.createElement("div");
  card.id = `project-${projectDoc.id}`;
  card.className = "project-card column is-3";
  card.textContent = name;

  return card;
};
