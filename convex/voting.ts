import { Id } from "@convex-dev/react";
import { auth, db } from "@convex-dev/server";
import { Choice, Instance } from "./common";

export async function currentRanking(instance: Id) {
  const user = await auth.getUserIdentity();
  if (!user) {
    throw new Error("User isn't authenticated");
  }
  const subject = user.tokenIdentifier;
  const instanceDoc: Instance = await db.get(instance);
  if (instanceDoc.state !== "voting" && instanceDoc.state !== "done") {
    throw new Error("Instance is in wrong state");
  }
  if (!instanceDoc.votes.has(subject)) {
    throw new Error("User isn't in the poll");
  }
  const numParticipants = [...instanceDoc.participants.entries()].length;

  // Step 1: Accumulate all of the choices.
  const allChoicesSet: Set<Choice> = new Set();
  for (const choices of instanceDoc.choices.values()) {
    for (const choice of choices.names) {
      allChoicesSet.add(choice);
    }
  }
  const allChoices = [...allChoicesSet.keys()];
  allChoices.sort();

  // Step 2: Build up a table for pairs of choices A and B tallying
  // how many people prefer A to B.
  const preferenceTable = new Map<string, number>();
  for (let i = 0; i < allChoices.length; i++) {
    const A = allChoices[i];
    for (let j = i + 1; j < allChoices.length; j++) {
      const B = allChoices[j];
      let numPreferred = 0;
      for (const vote of instanceDoc.votes.values()) {
        if (vote.order.indexOf(A) < vote.order.indexOf(B)) {
          numPreferred += 1;
        }
      }
      preferenceTable.set(`${A}:${B}`, numPreferred);
      preferenceTable.set(`${B}:${A}`, numParticipants - numPreferred);
    }
  }

  // Step 3: For each choice, find its worst performance.
  const worstPerforming = new Map<string, number>();
  for (let i = 0; i < allChoices.length; i++) {
    const A = allChoices[i];
    const scores: number[] = [];
    for (let j = 0; j < allChoices.length; j++) {
      if (i == j) {
        continue;
      }
      const B = allChoices[j];
      scores.push(preferenceTable.get(`${A}:${B}`)!);
    }
    scores.sort();
    worstPerforming.set(A, scores[0]);
  }

  // Step 4: Compute a fallback score to break ties. A person's top vote gets
  // `numParticipants` points, their second get `numParticipants - 1`, and so
  // on.
  const fallbackScore = new Map<string, number>();
  for (const vote of instanceDoc.votes.values()) {
    for (let i = 0; i < vote.order.length; i++) {
      const choice = vote.order[i];
      const newScore = (fallbackScore.get(choice) ?? 0) + (numParticipants - i);
      fallbackScore.set(choice, newScore);
    }
  }

  // Step 5: Sort the choices by their worst performance.
  const currentRanking = [...allChoices];
  currentRanking.sort((A, B) => {
    const worseB = worstPerforming.get(B)!;
    const worseA = worstPerforming.get(A)!;
    if (worseA === worseB) {
      return fallbackScore.get(B)! - fallbackScore.get(A)!;
    }
    return worseB - worseA;
  });
  return currentRanking;
}
