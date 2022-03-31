import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { ConvexProvider, Id } from "@convex-dev/react";
import { useRouter } from "next/router";
import { convex } from "../../common";
import { AddingChoices } from "../../src/AddingChoices";
import Box from "../../components/box";
import Button from "../../components/button";
import Header from "../../src/header";
import { useQuery } from "../../convex/_generated";
import styles from "../../styles/Home.module.css";
import { Voting } from "../../src/Voting";

const Instance = (props: { id: Id }) => {
  let body;
  const instance = useQuery("getInstance", props.id);
  const subject = useQuery("loggedInUser");
  let { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

  if (!instance || subject === undefined) {
    body = <span>Loading...</span>;
  } else if (!subject || isLoading || !isAuthenticated) {
    body = (
      <Box css={{ textAlign: "center" }}>
        <Button onClick={() => loginWithRedirect()}>Log in</Button>
      </Box>
    );
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
    throw new Error(`Invalid instance ${instance}`);
  }
  const id = Id.fromString(instance);
  return (
    <main className={styles.main}>
      <Auth0Provider
        domain="dev-1sfr-rpl.us.auth0.com"
        clientId="DBjaj1FETcPtmInSKi9gjOtMPu4NXe8H"
        redirectUri={
          typeof window !== "undefined" ? window.location.origin : undefined
        }
        cacheLocation="localstorage"
      >
        <ConvexProvider client={convex}>
          <Instance id={id} />
        </ConvexProvider>
      </Auth0Provider>
    </main>
  );
};
export default InstancePage;
