import { auth, dbWriter, Id } from "@convex-dev/server";
import { Choice, Instance } from "./common";

export async function votingMutation(instance: Id, newOrder: Choice[]) {
  const user = await auth.getUserIdentity();
  if (!user) {
    throw new Error("User isn't authenticated");
  }
  const subject = user.tokenIdentifier;
  const instanceDoc: Instance = await dbWriter.get(instance);
  if (instanceDoc.state !== "voting") {
    throw new Error("Instance is in wrong state");
  }
  if (!instanceDoc.votes.has(subject)) {
    throw new Error("User isn't in the poll");
  }
  instanceDoc.votes.get(subject)!.order = newOrder;
  await dbWriter.replace(instance, instanceDoc);
}

export async function doneVoting(instance: Id) {
    const user = await auth.getUserIdentity();
    if (!user) {
      throw new Error("User isn't authenticated");
    }
    const subject = user.tokenIdentifier;
    const instanceDoc: Instance = await dbWriter.get(instance);
    if (instanceDoc.state !== "voting") {
      throw new Error("Instance is in wrong state");
    }
    if (!instanceDoc.votes.has(subject)) {
      throw new Error("User isn't in the poll");
    }
    instanceDoc.votes.get(subject)!.done = true;

    const allDone = [...instanceDoc.votes.values()]
        .every(vote => vote.done);
    if (allDone) {
        instanceDoc.state = "done";
    }
    await dbWriter.replace(instance, instanceDoc);
}
