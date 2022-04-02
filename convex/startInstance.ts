import { mutation, Id } from "@convex-dev/server";
import { Instance } from "./common";

export default mutation(async ({db, auth}): Promise<Id> => {
  const user = await auth.getUserIdentity();
  if (!user) {
    throw new Error("User isn't authenticated");
  }
  const instance: Instance = {
    owner: user.tokenIdentifier,
    participants: new Map(),
    state: "addingChoices",
    choices: new Map(),
    votes: new Map(),
  };
  return db.insert("instances", instance);
});
