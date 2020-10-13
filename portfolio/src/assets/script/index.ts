import { firestore } from "firebase/app";
import { ProjectData } from "types";

import { auth, db } from "../../fb";
import { renderCard } from "./projects";

const newButton = document.getElementById("new-project-button");

auth.onAuthStateChanged(user => {
  if (user && newButton) {
    newButton.style.display = "block";
  } else if (newButton) {
    newButton.style.display = "none";
  }
});

const container = document.getElementById("projects");

if (container) {
  const projects = db.collectionGroup("projects") as firestore.Query<ProjectData>;
  projects.onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        const card = renderCard(change.doc);
        container.appendChild(card);
      } else if (change.type === "removed") {
        const card = document.getElementById(`project-${change.doc.id}`);
        if (card) card.remove();
      }
    });
  });
}
