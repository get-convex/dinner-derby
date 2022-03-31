import { db, Id } from "@convex-dev/server";
import { Instance } from "./common";

export default async function getInstance(id: Id): Promise<Instance> {
  return await db.get(id);
}
