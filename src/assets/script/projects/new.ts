import { storage as fbStorage, firestore } from "firebase";

import { auth, db, storage } from "../../../fb";
import { ProjectData } from "../../../types";
import { FileUploader, PellEditor } from "../components";

// Elements
const form = document.getElementById("new-project-form");
const coverImageInput = document.querySelector("#cover-image-field input[type=file]");
const coverImageName = document.querySelector("#cover-image-field .file-name");
const coverImageError = document.querySelector("#cover-image-field p.help.is-danger");
const submitButton = document.getElementById("new-project-submit-btn");
const loader = document.getElementById("loader");
const pellContainer = document.getElementById("pell-container");
const uploadModal = document.getElementById("image-upload-modal");
const modalClose = document.getElementById("upload-modal-close");
const bodyImageInput = document.querySelector("#image-upload-modal input[type=file]");
const bodyImageName = document.querySelector("#image-upload-modal .file-name");
const bodyImageError = document.querySelector("#image-upload-modal p.help.is-danger");
const bodyImageSubmit = document.getElementById("upload-modal-submit");

let projectRef: firestore.DocumentReference;

modalClose?.addEventListener("click", () => uploadModal?.classList.remove("is-active"));

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
  if (coverImageInput && coverImageInput instanceof HTMLInputElement && coverImageName && pellContainer) {
    // Get a reference (automatic ID) to use for uploading images before creating the project
    projectRef = db.collection(`users/${user.uid}/projects`).doc();

    const editor = new PellEditor(pellContainer);
    editor.load([
      {
        name: "image",
        result: () => {
          if (
            uploadModal
            && bodyImageInput
            && bodyImageInput instanceof HTMLInputElement
            && bodyImageName
            && bodyImageError
            && bodyImageSubmit
          ) {
            uploadModal.classList.add("is-active");
            const uploader = new FileUploader(bodyImageInput, bodyImageName, "image");

            let submitting = false;

            const handleFileSubmit = async (): Promise<void> => {
              if (submitting || !uploader.currentFile) return;
              submitting = true;

              const ref = storage.ref(`${projectRef.path}/images/${uploader.currentFile.name}`);
              try {
                await uploader.upload(ref).then(async () => {
                  const url = await ref.getDownloadURL();
                  editor.exec("insertImage", url);

                  uploadModal.classList.remove("is-active");
                  bodyImageSubmit.removeEventListener("click", handleFileSubmit);
                  uploader.clean();
                  bodyImageName.textContent = "Image file";
                });
              } catch (e) {
                submitting = false;
                if (e instanceof Error && e.name === "ValidationError") {
                  bodyImageError.textContent = "File is not an image";
                } else {
                  bodyImageError.textContent = "Error occurred";
                  console.error(e);
                }
              }
            };

            bodyImageSubmit.addEventListener("click", handleFileSubmit);
          }
        }
      }
    ]);

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
          id: projectRef.id,
          content: editor.content
        });

        location.replace("/");
      }
    };

    if (form) form.addEventListener("submit", handleSubmit);
  }

  return undefined;
});
