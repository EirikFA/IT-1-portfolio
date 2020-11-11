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
import { FileUploader, Form, TagsInput } from "../components";
import { FormValues } from "../components/Form";
import { projectInputTypes, projectSchema } from "../forms";
import TagManager from "../tags/TagManager";
import Project from "./Project";
import { ProjectManager } from "./ProjectManager";

// https://github.com/tinymce/tinymce/issues/2836#issuecomment-544790987
const contentStyle = readFileSync("node_modules/tinymce/skins/content/default/content.css", "utf8");
const contentStyle2 = readFileSync("node_modules/tinymce/skins/ui/oxide/content.css", "utf8");

const loader = document.getElementById("loader");
const formEl = document.getElementById("edit-project-form");
const coverInput = document.querySelector("input[name=cover]");
const coverInputName = coverInput?.parentElement?.querySelector(".file-name");
const tagsInput = document.querySelector("input[name=tags]");
const tagsContainer = document.getElementById("tags-input-container");
const submitButton = document.getElementById("edit-project-submit-btn");

const toggleSubmitting = () => {
  if (submitButton && submitButton instanceof HTMLButtonElement) {
    submitButton.classList.toggle("is-loading");
    submitButton.disabled = !submitButton.disabled;
  }
};

const handleSubmit = async (project: Project, values: FormValues<typeof projectInputTypes>): Promise<void> => {
  toggleSubmitting();

  const coverRef = (file: File): fbStorage.Reference => {
    const nameArr = file.name.split(".");
    // Last element is extension (after the dot)
    const fileExtension = nameArr[nameArr.length - 1];

    return storage.ref(`${project.ref.path}/images/cover.${fileExtension}`);
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

  await project.ref.set({ ...data }, { merge: true });

  location.replace(project.getPermURL());
};

const setupForm = async (project: Project): Promise<void> => {
  if (!(formEl && formEl instanceof HTMLFormElement && coverInput && coverInput instanceof HTMLInputElement)) {
    // TODO: Display fatal error of some sorts
    return location.replace("/");
  }

  const editors = await tinymce.init({
    selector: "#tinymce-editor",
    plugins: ["autoresize"],
    min_height: 300,
    max_height: 900,
    // https://github.com/tinymce/tinymce/issues/2836#issuecomment-544790987
    skin: false,
    content_css: false,
    content_style: `${contentStyle}\n${contentStyle2}`
  });

  editors[0].setContent(project.content);

  formEl.classList.remove("is-hidden");
  if (loader) loader.classList.add("is-hidden");

  let initialTagsInput: TagsInput | undefined;
  if (tagsInput && tagsInput instanceof HTMLInputElement && tagsContainer) {
    initialTagsInput = new TagsInput(tagsInput, tagsContainer, project.tags.map(t => ({ name: t.name })));
  }

  const initial: Partial<FormValues<typeof projectInputTypes>> = {
    // Needed to have the field optional
    // Could alternatively set the field to the current cover image,
    // but this would require checking if the field changed to avoid uploading the same file
    cover: new FileUploader(coverInput, "image", coverInputName, true),
    description: project.description,
    developmentStart: project.developmentStart?.toDate(),
    name: project.name,
    priority: project.priority,
    release: project.release?.toDate(),
    tags: initialTagsInput,
    url: project.url
  };

  new Form<typeof projectSchema, typeof projectInputTypes>(
    formEl,
    getFormErrorEl,
    projectInputTypes,
    projectSchema,
    values => handleSubmit(project, values),
    initial
  );

  return undefined;
};

auth.onAuthStateChanged(async user => {
  if (!user) return location.replace("/login.html");

  const tokenResult = await user.getIdTokenResult();
  if (tokenResult.claims.editor !== true) return location.replace("/");

  const query = new URLSearchParams(window.location.search);
  const id = query.get("id");

  if (id) {
    const tagManager = new TagManager(db);
    const manager = new ProjectManager(db, tagManager);

    manager.load(id).then(project => {
      if (project) setupForm(project);
      // TODO: Render "not found"
    });
  }

  return undefined;
});
