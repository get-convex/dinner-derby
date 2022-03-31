import { auth, dbWriter, Id } from "@convex-dev/server";
import { Choice, Instance } from "./common";

export async function addChoice(instance: Id, choice: string) {
  const user = await auth.getUserIdentity();
  if (!user) {
    throw new Error("User isn't authenticated");
  }
  const subject = user.tokenIdentifier;
  const instanceDoc: Instance = await dbWriter.get(instance);
  if (instanceDoc.state !== "addingChoices") {
    throw new Error("Instance is in wrong state");
  }
  if (!instanceDoc.participants.has(subject)) {
    const name = user.name ?? "";
    const profile = user.pictureUrl ?? "";
    instanceDoc.participants.set(subject, { name, profile });
    instanceDoc.choices.set(subject, { names: new Set(), done: false });
  }

  const choices = instanceDoc.choices.get(subject)!;
  choices.names.add(choice);

  await dbWriter.replace(instance, instanceDoc);
}

export async function doneAdding(instance: Id) {
  const user = await auth.getUserIdentity();
  if (!user) {
    throw new Error("User isn't authenticated");
  }
  const subject = user.tokenIdentifier;
  const instanceDoc: Instance = await dbWriter.get(instance);
  if (instanceDoc.state !== "addingChoices") {
    throw new Error("Instance is in wrong state");
  }
  if (!instanceDoc.participants.has(subject)) {
    const name = user.name ?? "";
    const profile = user.pictureUrl ?? "";
    instanceDoc.participants.set(subject, { name, profile });
    instanceDoc.choices.set(subject, { names: new Set(), done: false });
  }
  instanceDoc.choices.get(subject)!.done = true;
  await dbWriter.replace(instance, instanceDoc);
}

export async function startVoting(instance: Id) {
  const user = await auth.getUserIdentity();
  if (!user) {
    throw new Error("User isn't authenticated");
  }
  const instanceDoc: Instance = await dbWriter.get(instance);
  const subject = user.tokenIdentifier;
  if (subject !== instanceDoc.owner) {
    throw new Error("User isn't owner");
  }
  if (instanceDoc.state !== "addingChoices") {
    throw new Error("Instance is in wrong state");
  }
  instanceDoc.state = "voting";
  const allChoicesMap: Map<Choice, string[]> = new Map();
  for (const [subject, choiceSet] of instanceDoc.choices.entries()) {
    for (const choice of choiceSet.names) {
      if (!allChoicesMap.has(choice)) {
        allChoicesMap.set(choice, []);
      }
      const name = instanceDoc.participants.get(subject)!.name;
      allChoicesMap.get(choice)?.push(name);
    }
  }
  const allChoices = [...allChoicesMap.keys()];
  allChoices.sort();
  for (const participant of instanceDoc.participants.keys()) {
    instanceDoc.votes.set(participant, { order: allChoices, done: false });
  }
  await dbWriter.replace(instance, instanceDoc);
}
