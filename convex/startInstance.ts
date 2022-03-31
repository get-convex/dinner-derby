import { auth, dbWriter } from "@convex-dev/server";
import { Instance } from "./common";

export default async function startInstance() {
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
  const document = await dbWriter.insert("instances", instance);
  return document._id;
}
