import { firestore } from "firebase";

import { auth, db, storage } from "../../../fb";
import { ProjectData } from "../../../types";
import { ValidationError } from "../../../util";
import { FileUploader, PellEditor } from "../components";

// Elements
const form = document.getElementById("new-project-form");
const loader = document.getElementById("loader");
const pellContainer = document.getElementById("pell-container");
const uploadModal = document.getElementById("image-upload-modal");
const modalClose = document.getElementById("upload-modal-close");
const uploadInput = document.querySelector("#image-upload-modal input[type=file]");
const uploadFileName = document.querySelector("#image-upload-modal .file-name");
const uploadError = document.querySelector("#image-upload-modal p.help.is-danger");
const uploadSubmit = document.getElementById("upload-modal-submit");

let projectRef: firestore.DocumentReference;

modalClose?.addEventListener("click", () => uploadModal?.classList.remove("is-active"));

auth.onAuthStateChanged(async user => {
  if (!user) return location.replace("/login.html");

  const tokenResult = await user.getIdTokenResult();
  if (tokenResult.claims.editor !== true) return location.replace("/login.html");

  if (form) form.classList.remove("is-hidden");
  if (loader) loader.classList.add("is-hidden");
  if (pellContainer) {
    // Get a reference (automatic ID) to use for uploading images before creating the project
    projectRef = db.collection(`users/${user.uid}/projects`).doc();

    const editor = new PellEditor(pellContainer);
    editor.load([
      {
        name: "image",
        result: () => {
          if (uploadModal && uploadInput && uploadInput instanceof HTMLInputElement && uploadFileName && uploadError && uploadSubmit) {
            uploadModal.classList.add("is-active");
            const uploader = new FileUploader(uploadInput, uploadFileName);

            let submitting = false;

            const handleFileSubmit = (): void => {
              if (submitting || !uploader.currentFile) return;
              submitting = true;

              const ref = storage.ref(`${projectRef.path}/images/${uploader.currentFile.name}`);
              uploader.upload(ref).then(async () => {
                const url = await ref.getDownloadURL();
                editor.exec("insertImage", url);

                uploadModal.classList.remove("is-active");
                uploadSubmit.removeEventListener("click", handleFileSubmit);
                uploader.clean();
                uploadFileName.textContent = "Image file";
              }).catch(e => {
                submitting = false;
                if (e instanceof ValidationError) {
                  uploadError.textContent = "File is not an image";
                } else {
                  uploadError.textContent = "Error occurred";
                  console.error(e);
                }
              });
            };

            uploadSubmit.addEventListener("click", handleFileSubmit);
          }
        }
      }
    ]);

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

        await projectRef.set({
          ...state,
          content: editor.content
        });
      }
    };

    if (form) form.addEventListener("submit", handleSubmit);
  }

  return undefined;
});
