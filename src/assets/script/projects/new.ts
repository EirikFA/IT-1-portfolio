import { storage as fbStorage, firestore } from "firebase/app";
import { readFileSync } from "fs";
import tinymce from "tinymce";

import "tinymce/icons/default";
import "tinymce/plugins/autoresize";
import "tinymce/skins/ui/oxide/skin.css";
import "tinymce/themes/silver";

import { auth, db, storage } from "../../../fb";
import { ProjectData } from "../../../types";
import { findOrCreateTag, getFormErrorEl } from "../../../util";
import { Form } from "../components";
import { FormValues } from "../components/Form";
import { projectInputTypes, projectSchema } from "../forms";

// https://github.com/tinymce/tinymce/issues/2836#issuecomment-544790987
const contentStyle = readFileSync("node_modules/tinymce/skins/content/default/content.css", "utf8");
const contentStyle2 = readFileSync("node_modules/tinymce/skins/ui/oxide/content.css", "utf8");

const loader = document.getElementById("loader");
const formEl = document.getElementById("new-project-form");
const submitButton = document.getElementById("new-project-submit-btn");

let projectRef: firestore.DocumentReference;

const toggleSubmitting = () => {
  if (submitButton && submitButton instanceof HTMLButtonElement) {
    submitButton.classList.toggle("is-loading");
    submitButton.disabled = !submitButton.disabled;
  }
};

auth.onAuthStateChanged(async user => {
  if (!user) return location.replace("/login.html");

  const tokenResult = await user.getIdTokenResult();
  if (tokenResult.claims.editor !== true) return location.replace("/");

  if (formEl) formEl.classList.remove("is-hidden");
  if (loader) loader.classList.add("is-hidden");
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

  const handleSubmit = async (values: FormValues<typeof projectInputTypes>) => {
    toggleSubmitting();

    const coverRef = (file: File): fbStorage.Reference => {
      const nameArr = file.name.split(".");
      // Last element is extension (after the dot)
      const fileExtension = nameArr[nameArr.length - 1];

      return storage.ref(`${projectRef.path}/images/cover.${fileExtension}`);
    };

    const data: Partial<ProjectData> = {};

    // TODO: Find different way to use string as a type (instead of using `String`)
    data.content = values.content.toString();
    data.description = values.description.toString();
    data.developmentStart = firestore.Timestamp.fromDate(values.developmentStart);
    data.name = values.name.toString();
    data.priority = Number(values.priority);
    data.release = firestore.Timestamp.fromDate(values.release);
    data.url = values.url.toString();

    const tagPromises: Promise<string>[] = values.tags.tags.map(tag => findOrCreateTag(tag.name));
    const tagsPromise = async () => {
      data.tags = await Promise.all(tagPromises);
    };

    const uploadPromise = values.cover.upload(coverRef)?.then(async task => {
      const url = await task.ref.getDownloadURL();
      data.cover = url;
    });

    await Promise.all([tagsPromise(), uploadPromise]);

    await projectRef.set({
      ...data,
      id: projectRef.id
    });

    location.replace("/");
  };

  if (formEl && formEl instanceof HTMLFormElement) {
    new Form<typeof projectSchema, typeof projectInputTypes>(
      formEl,
      getFormErrorEl,
      projectInputTypes,
      projectSchema,
      handleSubmit
    );
  }

  return undefined;
});
