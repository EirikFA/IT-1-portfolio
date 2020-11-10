import { db } from "../fb";

const tagCol = db.collection("tags");

export default async (name: string): Promise<string> => {
  const snapshot = await tagCol.where("name", "==", name).get();
  if (snapshot.docs.length > 0) return snapshot.docs[0].id;

  const result = await tagCol.add({ name });
  return result.id;
};
