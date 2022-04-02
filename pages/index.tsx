import type { NextPage } from "next";
import Head from "next/head";
import { useEffect } from "react";
import styles from "../styles/Home.module.css";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation } from "../convex/_generated";
import Router, { useRouter } from "next/router";
import Header from "../src/header";
import Button from "../components/button";
import Text from "../components/text";
import Box from "../components/box";

const DinnerDerby = () => {
  const startInstance = useMutation("startInstance");
  const {
    isLoading,
    isAuthenticated,
    loginWithRedirect,
  } = useAuth0();
  let body;
  if (isLoading) {
    body = <Text>Loading...</Text>;
  } else if (!isAuthenticated) {
    body = (
      <Box css={{ textAlign: "center" }}>
        <Button onClick={() => loginWithRedirect({redirectUri: window.location.origin + '/'})}>Log in</Button>
      </Box>
    );
  } else {
    const onClick = async () => {
      const id = await startInstance();
      Router.push(`/poll/${id.toString()}`);
    };
    body = (
      <Box css={{ textAlign: "center" }}>
        <Button variant="green" onClick={onClick}>
          Create a new poll
        </Button>
      </Box>
    );
  }
  return <Header>{body}</Header>;
};

const Home: NextPage = () => {
  const router = useRouter();
  useEffect(() => {
    if (router.query.instance) {
      router.push(`/poll/${router.query.instance}`);
    }
  }, [router])
  return (
    <div className={styles.container}>
      <Head>
        <title>Dinner Derby</title>
        <meta
          name="description"
          content="The most exciting way to figure out where to go for dinner."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <DinnerDerby />
      </main>
    </div>
  );
};

export default Home;
