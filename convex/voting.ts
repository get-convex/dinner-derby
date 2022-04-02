import { Id, mutation, query } from "@convex-dev/server";
import { Choice, Instance } from "./common";

export const currentRanking = query(async ({db, auth}, instance: Id) => {
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

  // Collect all of the choices.
  const remainingChoices: Set<Choice> = new Set();
  for (const choices of instanceDoc.choices.values()) {
    for (const choice of choices.names) {
      remainingChoices.add(choice);
    }
  }

  // As a tiebreaker, compute the Borda score for each choice. For each
  // ballot, this gives (numChoices - 1 - i) points to the ith choice.
  const bordaScore = new Map<string, number>();
  for (const vote of instanceDoc.votes.values()) {
    for (let i = 0; i < vote.order.length; i++) {
      const choice = vote.order[i];
      const existing = bordaScore.get(choice) ?? 0;
      const increment = remainingChoices.size - i - 1;
      bordaScore.set(choice, existing + increment);
    }
  }

  const eliminated = [];
  while (remainingChoices.size > 1) {
    // Each round we'll eliminate the choice with the fewest first-place votes,
    // breaking ties using the Borda score we computed above.
    const firstVotes = new Map<string, number>();
    for (const vote of instanceDoc.votes.values()) {
      for (const choice of vote.order) {
        if (remainingChoices.has(choice)) {
          firstVotes.set(choice, (firstVotes.get(choice) ?? 0) + 1);
          break;
        }
      }
    }
    const choices = [...remainingChoices];
    choices.sort((a, b) => {
      const aScore = firstVotes.get(a) ?? 0;
      const bScore = firstVotes.get(b) ?? 0;
      if (aScore == bScore) {
        return (bordaScore.get(a) ?? 0) - (bordaScore.get(b) ?? 0);
      };
      return aScore - bScore;
    });
    const toEliminate = choices[0];
    eliminated.push(toEliminate);
    remainingChoices.delete(toEliminate);
  }
  // Return the winner with everyone else in reverse order of elimination.
  return [...remainingChoices].concat(eliminated.reverse());
});

export const changeVote = mutation(async ({db, auth}, instance: Id, newOrder: Choice[]) => {
  const user = await auth.getUserIdentity();
  if (!user) {
    throw new Error("User isn't authenticated");
  }
  const subject = user.tokenIdentifier;
  const instanceDoc: Instance = await db.get(instance);
  if (instanceDoc.state !== "voting") {
    throw new Error("Instance is in wrong state");
  }
  if (!instanceDoc.votes.has(subject)) {
    throw new Error("User isn't in the poll");
  }
  instanceDoc.votes.get(subject)!.order = newOrder;
  db.replace(instance, instanceDoc);
});

export const doneVoting = mutation(async ({db, auth}, instance: Id) => {
  const user = await auth.getUserIdentity();
  if (!user) {
    throw new Error("User isn't authenticated");
  }
  const subject = user.tokenIdentifier;
  const instanceDoc: Instance = await db.get(instance);
  if (instanceDoc.state !== "voting") {
    throw new Error("Instance is in wrong state");
  }
  if (!instanceDoc.votes.has(subject)) {
    throw new Error("User isn't in the poll");
  }
  instanceDoc.votes.get(subject)!.done = true;

  const allDone = [...instanceDoc.votes.values()].every((vote) => vote.done);
  if (allDone) {
    instanceDoc.state = "done";
  }
  db.replace(instance, instanceDoc);
});
