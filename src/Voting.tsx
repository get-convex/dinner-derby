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
    <ul>
      {props.items.map((value, i) => (
        <SortableItem key={value} index={i} value={value} />
      ))}
    </ul>
  );
});

export const Voting = (props: {
  subject: Subject;
  instance: Instance;
  id: Id;
}) => {
  const { subject, instance, id } = props;

  const [choices, setChoices] = useState(instance.votes.get(subject)?.order ?? []);
  const currentRanking = useQuery("voting:currentRanking", id);
  const votingMutation = useMutation("votingMutation:votingMutation");
  const doneVoting = useMutation("votingMutation:doneVoting");
  const isDone = instance.votes.get(subject)?.done ?? false;
  const instanceDone = instance.state === "done";

  const onSortEnd = ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number;
    newIndex: number;
  }) => {
    const newItems = arrayMoveImmutable(choices, oldIndex, newIndex);
    setChoices(newItems);
    votingMutation(id, newItems);
  };
  return (
    <Flex css={{ justifyContent: "space-evenly" }}>
      <Box css={{ flexGrow: 1, flexBasis: "50%" }}>
        Your ranking
        {!isDone && (
          <Box>
            <SortableList items={choices} onSortEnd={onSortEnd} />
            <Box css={{textAlign: "right"}}>
              <Button variant="green" onClick={() => doneVoting(id)}>I&apos;m done.</Button>
            </Box>
          </Box>
        )}
        {isDone && (
          <ul>
            {choices.map(choice => <li key={choice}>{choice}</li>)}
          </ul>
        )}
      </Box>
      <Separator decorative orientation="vertical" css={{ margin: "0 15px" }} />
      <Box css={{ flexGrow: 1, flexBasis: "50%" }}>
        {instanceDone ? "Final ranking" : "Current ranking"}
        {currentRanking && (
          <ul>
            {currentRanking.map((choice) => (
              <li key={choice}>{choice}</li>
            ))}
          </ul>
        )}
      </Box>
    </Flex>
  );
};
