import { firestore } from "firebase";
import { exec, init } from "pell";

import { auth, db, storage } from "../../../fb";
import { ProjectData } from "../../../types";

// Elements
const form = document.getElementById("new-project-form");
const loader = document.getElementById("loader");
const pellContainer = document.getElementById("pell-container");
const pellContent = document.querySelector("#pell-container .pell-content");
const uploader = document.getElementById("image-upload-modal");
const modalClose = document.getElementById("upload-modal-close");
const fileUpload = document.querySelector("#image-upload-modal .file");
const uploadInput = document.querySelector("#image-upload-modal input[type=file]");
const uploadFileName = document.querySelector("#image-upload-modal .file-name");
const uploadError = document.querySelector("#image-upload-modal p.help.is-danger");
const uploadSubmit = document.getElementById("upload-modal-submit");

// Project content/description/whatever
let newHtml = "";

let projectRef: firestore.DocumentReference;

// Event listeners
modalClose?.addEventListener("click", () => uploader?.classList.remove("is-active"));
if (fileUpload && uploadInput && uploadInput instanceof HTMLInputElement && uploadFileName) {
  uploadInput.addEventListener("change", () => {
    if (uploadInput.files && uploadInput.files.length > 0) {
      uploadFileName.textContent = uploadInput.files[0].name;
      fileUpload.classList.add("has-name");
      uploadFileName.classList.remove("is-hidden");
    }
  });
}

if (uploader && uploadInput && uploadInput instanceof HTMLInputElement) {
  uploadSubmit?.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user || !projectRef) return;

    if (uploadInput.files && uploadInput.files.length > 0) {
      const file = uploadInput.files[0];

      if (!file.type.startsWith("image")) {
        if (uploadError) uploadError.textContent = "File is not an image";
        return;
      }

      const imageRef = storage.ref(`users/${user.uid}/projects/${projectRef.id}/images/${file.name}`);

      await imageRef.put(file);
      const url = await imageRef.getDownloadURL();
      if (pellContent && pellContent instanceof HTMLDivElement) {
        pellContent.focus();
      }

      uploader.classList.remove("is-active");
      exec("insertImage", url);
    }
  });
}

auth.onAuthStateChanged(async user => {
  if (!user) return location.replace("/login.html");

  // Get a reference (automatic ID) to use for uploading images before creating the project
  projectRef = db.collection(`users/${user.uid}/projects`).doc();

  const tokenResult = await user.getIdTokenResult();
  if (tokenResult.claims.editor !== true) return location.replace("/login.html");

  if (form) form.classList.remove("is-hidden");
  if (loader) loader.classList.add("is-hidden");
  if (pellContainer) {
    init({
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
        {
          name: "image",
          result: () => {
            // Upload is handled in event listener above
            if (uploader) {
              uploader.classList.add("is-active");
            }
          }
        }
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

    await projectRef.set({
      ...state,
      content: newHtml
    });
  }
};

if (form) form.addEventListener("submit", handleSubmit);
