import { db } from "../../fb";

const container = document.getElementById("projects");

if (container) {
  const projects = db.collectionGroup("projects");
  projects.onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        const { name } = change.doc.data();

        const card = document.createElement("div");
        card.id = `project-${change.doc.id}`;
        card.className = "project-card column is-3";
        card.textContent = name;

        container.appendChild(card);
      } else if (change.type === "removed") {
        const card = document.getElementById(`project-${change.doc.id}`);
        if (card) card.remove();
      }
    });
  });
}
