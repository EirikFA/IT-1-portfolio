import {
  date, number, object, string
} from "yup";

import { FileUploader, TagsInput } from "../components";

// Files and tags not handled by Yup
export const projectSchema = object().shape({
  content: string().required(),
  description: string().required(),
  // Input with date type is empty string if no value, thus the transform
  developmentStart: date().notRequired().nullable().transform((curr, orig) => (orig === "" ? null : curr)),
  name: string().required(),
  priority: number().required().integer().min(0)
    .default(0),
  // Same as above
  release: date().notRequired().nullable().transform((curr, orig) => (orig === "" ? null : curr)),
  url: string().required().url()
});

export const projectInputTypes = {
  content: String,
  cover: FileUploader,
  description: String,
  developmentStart: Date,
  name: String,
  priority: Number,
  release: Date,
  tags: TagsInput,
  url: String
};
