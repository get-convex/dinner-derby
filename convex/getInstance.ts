import { Id, query } from "@convex-dev/server";
import { Instance } from "./common";

export default query(async ({db}, id: Id): Promise<Instance> => {
  return await db.get(id);
});
