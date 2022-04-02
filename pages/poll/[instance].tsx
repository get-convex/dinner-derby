import { useAuth0 } from "@auth0/auth0-react";
import { Id } from "@convex-dev/react";
import { useRouter } from "next/router";
import { AddingChoices } from "../../src/AddingChoices";
import Box from "../../components/box";
import Button from "../../components/button";
import Header from "../../src/header";
import { useQuery } from "../../convex/_generated";
import styles from "../../styles/Home.module.css";
import { Voting } from "../../src/Voting";

const Instance = (props: { id: Id }) => {
  const instance = useQuery("getInstance", props.id);
  const subject = useQuery("loggedInUser");
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();
  let body;
  if (!isAuthenticated || isLoading) {
    body = (
      <Box css={{ textAlign: "center" }}>
        <Button onClick={() => loginWithRedirect({redirectUri: `${window.location.origin}/?instance=${props.id.toString()}`})}>Log in</Button>
      </Box>
    );
  } else if (!instance || !subject) {
    body = <span>Loading...</span>;
  } else if (instance.state === "addingChoices") {
    body = (
      <AddingChoices subject={subject} instance={instance} id={props.id} />
    );
  } else if (instance.state === "voting" || instance.state === "done") {
    body = <Voting subject={subject} instance={instance} id={props.id} />;
  } else {
    throw new Error(`Invalid instance state: ${instance.state}`);
  }
  return <Header>{body}</Header>;
};

const InstancePage = () => {
  const router = useRouter();
  const { instance } = router.query;
  if (typeof instance !== "string") {
    return;
  }
  const id = Id.fromString(instance);
  return (
    <main className={styles.main}>
      <Instance id={id} />
    </main>
  );
};
export default InstancePage;
