import { query } from "@convex-dev/server";
import { Subject } from "./common";

export default query(async ({auth}): Promise<Subject | null> => {
  const user = await auth.getUserIdentity();
  return user?.tokenIdentifier ?? null;
});