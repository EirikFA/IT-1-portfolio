import { storage as fbStorage, firestore } from "firebase";
import { readFileSync } from "fs";
import tinymce from "tinymce";

import "tinymce/icons/default";
import "tinymce/plugins/autoresize";
import "tinymce/skins/ui/oxide/skin.css";
import "tinymce/themes/silver";

import { auth, db, storage } from "../../../fb";
import { ProjectData } from "../../../types";
import { FileUploader } from "../components";

// https://github.com/tinymce/tinymce/issues/2836#issuecomment-544790987
const contentStyle = readFileSync("node_modules/tinymce/skins/content/default/content.css", "utf8");
const contentStyle2 = readFileSync("node_modules/tinymce/skins/ui/oxide/content.css", "utf8");

// Elements
const form = document.getElementById("new-project-form");
const coverImageInput = document.querySelector("#cover-image-field input[type=file]");
const coverImageName = document.querySelector("#cover-image-field .file-name");
const coverImageError = document.querySelector("#cover-image-field p.help.is-danger");
const submitButton = document.getElementById("new-project-submit-btn");
const loader = document.getElementById("loader");

let projectRef: firestore.DocumentReference;

// Helper function
const toggleSubmitting = () => {
  if (submitButton && submitButton instanceof HTMLButtonElement) {
    submitButton.classList.toggle("is-loading");
    submitButton.disabled = !submitButton.disabled;
  }
};

auth.onAuthStateChanged(async user => {
  if (!user) return location.replace("/login.html");

  const tokenResult = await user.getIdTokenResult();
  if (tokenResult.claims.editor !== true) return location.replace("/login.html");

  if (form) form.classList.remove("is-hidden");
  if (loader) loader.classList.add("is-hidden");
  if (coverImageInput && coverImageInput instanceof HTMLInputElement && coverImageName) {
    // Get a reference (automatic ID) to use for uploading images before creating the project
    projectRef = db.collection(`users/${user.uid}/projects`).doc();

    tinymce.init({
      selector: "#tinymce-editor",
      plugins: ["autoresize"],
      min_height: 300,
      max_height: 900,
      // https://github.com/tinymce/tinymce/issues/2836#issuecomment-544790987
      skin: false,
      content_css: false,
      content_style: `${contentStyle}\n${contentStyle2}`
    });

    const coverImageUploader = new FileUploader(coverImageInput, coverImageName, "image");

    const handleSubmit = async (event: Event) => {
      event.preventDefault();
      toggleSubmitting();

      if (form && form instanceof HTMLFormElement) {
        const state: Partial<ProjectData> = {};

        for (let i = 0; i < form.elements.length; i++) {
          const el = form.elements.item(i);
          // Ignore file inputs, they are handled separately
          if ((el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) && el.name && el.value) {
            if (!(el instanceof HTMLInputElement) || !el.files) {
              state[el.name as keyof ProjectData] = el.value;
            }
          }
        }

        const coverImageRef = (file: File): fbStorage.Reference => {
          const nameArr = file.name.split(".");
          // Last element is extension (after the dot)
          const fileExtension = nameArr[nameArr.length - 1];

          return storage.ref(`${projectRef.path}/images/cover.${fileExtension}`);
        };

        try {
          await coverImageUploader.upload(coverImageRef).then(async task => {
            const url = await task.ref.getDownloadURL();
            state.coverImage = url;
          });
        } catch (e) {
          toggleSubmitting();
          // `instanceof ValidationError` not working ¯\_(ツ)_/¯
          if (e instanceof Error && e.name === "ValidationError") {
            if (coverImageError) coverImageError.textContent = "Cover image is required and must be an image";
          } else {
            if (coverImageError) coverImageError.textContent = "Error occurred";
            console.error(e);
          }

          return;
        }

        await projectRef.set({
          ...state,
          id: projectRef.id
        });

        location.replace("/");
      }
    };

    if (form) form.addEventListener("submit", handleSubmit);
  }

  return undefined;
});
