import { firestore } from "firebase/app";

export interface ProjectData {
  content: string;
  cover: string;
  description: string;
  developmentStart?: firestore.Timestamp;
  name: string;
  release?: firestore.Timestamp;
  url: string;
  tags: string[];
}

export interface TagData {
  name: string;
}
