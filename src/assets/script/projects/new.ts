import { storage as fbStorage, firestore } from "firebase";
import { readFileSync } from "fs";
import tinymce from "tinymce";
import { date, object, string } from "yup";

import "tinymce/icons/default";
import "tinymce/plugins/autoresize";
import "tinymce/skins/ui/oxide/skin.css";
import "tinymce/themes/silver";

import { auth, db, storage } from "../../../fb";
import { ProjectData } from "../../../types";
import { FileUploader, Form } from "../components";
import { FormValues } from "../components/Form";
import TagsInput from "../components/TagsInput";

// https://github.com/tinymce/tinymce/issues/2836#issuecomment-544790987
const contentStyle = readFileSync("node_modules/tinymce/skins/content/default/content.css", "utf8");
const contentStyle2 = readFileSync("node_modules/tinymce/skins/ui/oxide/content.css", "utf8");

// Elements
const formEl = document.getElementById("new-project-form");
const coverImageInput = document.querySelector("#cover-image-field input[type=file]");
const coverImageName = document.querySelector("#cover-image-field .file-name");
const tagsContainer = document.getElementById("tags-input-container");
const tagsInputEl = document.querySelector("input[name=tags]");
const submitButton = document.getElementById("new-project-submit-btn");
const loader = document.getElementById("loader");

let projectRef: firestore.DocumentReference;

// Files and tags not handled by Yup
const newProjectSchema = object().shape({
  content: string().required(),
  description: string().required(),
  // Input with date type is empty string if no value, thus the transform
  developmentStart: date().notRequired().nullable().transform((curr, orig) => (orig === "" ? null : curr)),
  name: string().required(),
  // Same as above
  release: date().notRequired().nullable().transform((curr, orig) => (orig === "" ? null : curr)),
  url: string().required().url()
});

const inputTypes = {
  content: String,
  cover: FileUploader,
  description: String,
  developmentStart: Date,
  name: String,
  release: Date,
  tags: TagsInput,
  url: String
};

const getErrorEl = (path: string): Element | null => {
  const input = document.querySelector(`input[name=${path}], textarea[name=${path}]`);
  if (input) {
    let field = input.parentElement?.parentElement;
    // File fields
    if (!field?.classList.contains("field")) field = field?.parentElement;

    if (field) {
      const errorEl = field.querySelector("p.help.is-danger");
      return errorEl;
    }
  }

  return null;
};

// Helper function
const toggleSubmitting = () => {
  if (submitButton && submitButton instanceof HTMLButtonElement) {
    submitButton.classList.toggle("is-loading");
    submitButton.disabled = !submitButton.disabled;
  }
};

const tagCol = db.collection("tags");
const findOrCreateTag = async (name: string): Promise<string> => {
  const snapshot = await tagCol.where("name", "==", name).get();
  if (snapshot.docs.length > 0) return snapshot.docs[0].id;

  const result = await tagCol.add({ name });
  return result.id;
};

auth.onAuthStateChanged(async user => {
  if (!user) return location.replace("/login.html");

  const tokenResult = await user.getIdTokenResult();
  if (tokenResult.claims.editor !== true) return location.replace("/login.html");

  if (formEl) formEl.classList.remove("is-hidden");
  if (loader) loader.classList.add("is-hidden");
  if (
    coverImageInput
    && coverImageInput instanceof HTMLInputElement
    && coverImageName
    && tagsInputEl
    && tagsInputEl instanceof HTMLInputElement
    && tagsContainer
  ) {
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

    const handleSubmit = async (values: FormValues<typeof inputTypes>) => {
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
      data.release = firestore.Timestamp.fromDate(values.release);
      data.url = values.url.toString();

      const tagPromises: Promise<string>[] = values.tags.tags.map(tag => findOrCreateTag(tag.name));
      const tagsPromise = async () => {
        data.tags = await Promise.all(tagPromises);
      };

      const uploadPromise = values.cover.upload(coverRef).then(async task => {
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
      new Form<typeof newProjectSchema, typeof inputTypes>(
        formEl,
        getErrorEl,
        inputTypes,
        newProjectSchema,
        handleSubmit
      );
    }
  }

  return undefined;
});
