import { Id, query } from "@convex-dev/server";
import { Instance } from "./common";

export default query(async ({db, auth}, id: Id): Promise<Instance> => {
  const user = await auth.getUserIdentity();
  if (!user) {
    throw new Error("User isn't authenticated");
  }
  return await db.get(id);
});
