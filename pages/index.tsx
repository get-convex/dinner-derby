import type { NextPage } from "next";
import Head from "next/head";
import { useEffect } from "react";
import { ConvexProvider } from "@convex-dev/react";
import styles from "../styles/Home.module.css";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useConvex, useMutation } from "../convex/_generated";
import { convex } from "../common";
import Router from "next/router";
import Header from "../src/header";
import Button from "../components/button";
import Text from "../components/text";
import Box from "../components/box";

const DinnerDerby = () => {
  const convex = useConvex();
  const startInstance = useMutation("startInstance");
  let {
    isLoading,
    isAuthenticated,
    getIdTokenClaims,
    user,
    loginWithRedirect,
  } = useAuth0();
  let body;
  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (isAuthenticated) {
      getIdTokenClaims().then(async (claims) => {
        let token = claims!.__raw;
        convex.setAuth(token);
      });
    } else {
      convex.clearAuth();
    }
  }, [isAuthenticated, isLoading, getIdTokenClaims, convex]);

  if (isLoading) {
    body = <Text>Loading...</Text>;
  } else if (!isAuthenticated) {
    body = (
      <Box css={{ textAlign: "center" }}>
        <Button onClick={() => loginWithRedirect()}>Log in</Button>
      </Box>
    );
  } else {
    const onClick = async () => {
      const id = await startInstance();
      console.log(id, id.toString());
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
        <Auth0Provider
          domain="dev-1sfr-rpl.us.auth0.com"
          clientId="DBjaj1FETcPtmInSKi9gjOtMPu4NXe8H"
          redirectUri={
            typeof window !== "undefined" ? window.location.origin : undefined
          }
          cacheLocation="localstorage"
        >
          <ConvexProvider client={convex}>
            <DinnerDerby />
          </ConvexProvider>
        </Auth0Provider>
      </main>
    </div>
  );
};

export default Home;
