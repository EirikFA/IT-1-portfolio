import { firestore } from "firebase/app";

import { auth, db } from "../../fb";
import { ProjectData } from "../../types";
import { renderCard } from "./projects";

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
