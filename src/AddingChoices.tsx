import { Id } from "@convex-dev/react";
import { FormEventHandler, useState } from "react";
import Box from "../components/box";
import Button from "../components/button";
import Flex from "../components/flex";
import Form from "../components/form";
import Input from "../components/input";
import Label from "../components/label";
import Separator from "../components/separator";
import { Choice, Instance, Subject } from "../convex/common";
import { useMutation } from "../convex/_generated";

export const AddingChoices = (props: {
  subject: Subject;
  instance: Instance;
  id: Id;
}) => {
  const { subject, instance, id } = props;
  const isAdmin = instance.owner === subject;
  const isDone = !isAdmin && (instance.choices.get(subject)?.done ?? false);

  const choiceSet = instance.choices.get(subject)?.names ?? new Set();
  const choices = [...choiceSet.keys()];
  choices.sort();

  const allChoicesMap: Map<Choice, string[]> = new Map();
  for (const [subject, choiceSet] of instance.choices.entries()) {
    for (const choice of choiceSet.names) {
      if (!allChoicesMap.has(choice)) {
        allChoicesMap.set(choice, []);
      }
      const name = instance.participants.get(subject)!.name;
      allChoicesMap.get(choice)?.push(name);
    }
  }
  const allChoices = [...allChoicesMap.keys()];
  allChoices.sort();

  const addChoice = useMutation("addingChoices:addChoice");
  const [newChoice, setNewChoice] = useState("");
  const submitChoice: FormEventHandler = (e) => {
    e.preventDefault();
    if (!newChoice) {
      return;
    }
    setNewChoice("");
    addChoice(id, newChoice);
  };
  const doneAdding = useMutation("addingChoices:doneAdding");
  const startVoting = useMutation("addingChoices:startVoting");
  return (
    <Flex css={{ justifyContent: "space-evenly" }}>
      <Box css={{ flexGrow: 1, flexBasis: "50%" }}>
        Your choices
        {choices.length > 0 && (
          <ul>
            {choices.map((choice) => (
              <li key={choice}>{choice}</li>
            ))}
          </ul>
        )}
        {!isDone && (
          <>
            <Form onSubmit={submitChoice}>
              <Flex
                css={{
                  flexWrap: "wrap",
                  alignItems: "center",
                  padding: "15px 0",
                }}
              >
                <Label
                  htmlFor="newChoice"
                  css={{
                    lineHeight: "35px",
                    alignItems: "center",
                    paddingRight: "15px",
                  }}
                >
                  Add a choice
                </Label>
                <Input
                  value={newChoice}
                  type="text"
                  id="newChoice"
                  onChange={(e) => setNewChoice(e.target.value)}
                  css={{ flexGrow: 1 }}
                />
              </Flex>
            </Form>
            <Box css={{ textAlign: "right" }}>
              {isAdmin && allChoices.length > 0 && (
                <Button variant="green" onClick={() => startVoting(id)}>
                  Start voting.
                </Button>
              )}
              {!isAdmin && (
                <Button variant="green" onClick={() => doneAdding(id)}>
                  I&apos;m done.
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>
      <Separator decorative orientation="vertical" css={{ margin: "0 15px" }} />
      <Box css={{ flexGrow: 1, flexBasis: "50%" }}>
        Everyone&apos;s choices
        {allChoices.length > 0 && (
          <ul>
            {allChoices.map((choice) => (
              <li key={choice}>
                {choice} ({allChoicesMap.get(choice)?.join(", ")})
              </li>
            ))}
          </ul>
        )}
      </Box>
    </Flex>
  );
};
