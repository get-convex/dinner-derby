import { Id } from "@convex-dev/react";
import { arrayMoveImmutable } from "array-move";
import { useState } from "react";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import Box from "../components/box";
import Button from "../components/button";
import Flex from "../components/flex";
import Separator from "../components/separator";
import { Instance, Subject } from "../convex/common";
import { useMutation, useQuery } from "../convex/_generated";

const SortableItem = SortableElement((props: { value: string }) => (
  <li>{props.value}</li>
));
const SortableList = SortableContainer((props: { items: string[] }) => {
  return (
    <ol>
      {props.items.map((value, i) => {
        return (
          <SortableItem key={value} index={i} value={value} />
        )
      })}
    </ol>
  );
});

export const Voting = (props: {
  subject: Subject;
  instance: Instance;
  id: Id;
}) => {
  const { subject, instance, id } = props;

  const [choices, setChoices] = useState(
    instance.votes.get(subject)?.order ?? []
  );
  const currentRanking = useQuery("voting:currentRanking", id);
  const changeVote = useMutation("voting:changeVote");
  const doneVoting = useMutation("voting:doneVoting");
  const isDone = instance.votes.get(subject)?.done ?? false;
  const instanceDone = instance.state === "done";

  const firstPlace = new Map();
  const secondPlace = new Map();
  const thirdPlace =  new Map();
  for (const vote of instance.votes.values()) {
    if (vote.order.length >= 1) {
      firstPlace.set(vote.order[0], 1 + (firstPlace.get(vote.order[0]) ?? 0));
    }
    if (vote.order.length >= 2) {
      secondPlace.set(vote.order[1], 1 + (secondPlace.get(vote.order[1]) ?? 0));
    }
    if (vote.order.length >= 3) {
      thirdPlace.set(vote.order[2], 1 + (thirdPlace.get(vote.order[2]) ?? 0));
    }
  }

  const onSortEnd = (props: { oldIndex: number, newIndex: number }) => {
    const newItems = arrayMoveImmutable(choices, props.oldIndex, props.newIndex);
    setChoices(newItems);
    changeVote(id, newItems);
  };
  return (
    <Flex css={{ justifyContent: "space-evenly" }}>
      <Box css={{ flexGrow: 1, flexBasis: "50%" }}>
        Your ranking
        {!isDone && (
          <Box>
            <SortableList items={choices} onSortEnd={onSortEnd} />
            <Box css={{ textAlign: "right" }}>
              <Button variant="green" onClick={() => doneVoting(id)}>
                I&apos;m done.
              </Button>
            </Box>
          </Box>
        )}
        {isDone && (
          <ol>
            {choices.map((choice, i) => {
              return (
                <li key={choice}>{choice}</li>
              );
            })}
          </ol>
        )}
      </Box>
      <Separator decorative orientation="vertical" css={{ margin: "0 15px" }} />
      <Box css={{ flexGrow: 1, flexBasis: "50%" }}>
        {instanceDone ? "Final ranking" : "Current ranking"}
        {currentRanking && (
          <ol>
            {currentRanking.map((choice) => {
              const counts = [];
              const firstCount = firstPlace.get(choice);
              const secondCount = secondPlace.get(choice);
              const thirdCount = thirdPlace.get(choice);
              firstCount && counts.push(`🥇: ${firstCount}`);
              secondCount && counts.push(`🥈: ${secondCount}`);
              thirdCount && counts.push(`🥉: ${thirdCount}`);
              const countsStr = counts.length ? ` (${counts.join(", ")})` : null;
              return (
                <li key={choice}>{choice}{countsStr}</li>
              )
            })}
          </ol>
        )}
      </Box>
    </Flex>
  );
};
