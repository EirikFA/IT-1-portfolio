import pell from "pell";

import { auth, db } from "../../../fb";
import { ProjectData } from "../../../types";

const form = document.getElementById("new-project-form");
const loader = document.getElementById("loader");
const pellContainer = document.getElementById("pell-container");

let newHtml = "";

auth.onAuthStateChanged(async user => {
  if (!user) return location.replace("/login.html");

  const tokenResult = await user.getIdTokenResult();
  if (tokenResult.claims.editor !== true) return location.replace("/login.html");

  if (form) form.classList.remove("is-hidden");
  if (loader) loader.classList.add("is-hidden");
  if (pellContainer) {
    pell.init({
      element: pellContainer,
      onChange: html => {
        newHtml = html;
      },
      actions: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "heading1",
        "heading2",
        "paragraph",
        "quote",
        "olist",
        "ulist",
        "code",
        "line",
        "link",
        "image"
      ]
    });
  }

  return undefined;
});

const handleSubmit = async (event: Event) => {
  event.preventDefault();

  if (form && form instanceof HTMLFormElement) {
    const state: Partial<ProjectData> = {};

    for (let i = 0; i < form.elements.length; i++) {
      const el = form.elements.item(i);
      if (el instanceof HTMLInputElement && el.name && el.value) {
        state[el.name as keyof ProjectData] = el.value;
      }
    }

    const user = auth.currentUser;
    // `onAuthStateChanged` should redirect if not authenticated
    if (!user) return;

    await db.collection(`users/${user.uid}/projects`).doc().set({
      ...state,
      content: newHtml
    });
  }
};

if (form) form.addEventListener("submit", handleSubmit);
