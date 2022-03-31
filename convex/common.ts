export type Subject = string;
export type Choice = string;

export type Instance = {
  owner: Subject;
  participants: Map<Subject, { name: string; profile: string }>;
  state: "addingChoices" | "voting" | "done";
  choices: Map<Subject, { names: Set<Choice>; done: boolean }>;
  votes: Map<Subject, { order: Choice[]; done: boolean }>;
};
