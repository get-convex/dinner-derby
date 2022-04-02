import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { convex } from "../common";
import { ConvexProvider } from "@convex-dev/react";
import { useEffect } from "react";
import { useConvex } from "../convex/_generated";

function ConvexLogin() {
  const convex = useConvex();
  const { isAuthenticated, isLoading, getIdTokenClaims } = useAuth0();
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
  return <></>
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Auth0Provider
      domain="dev-1sfr-rpl.us.auth0.com"
      clientId="DBjaj1FETcPtmInSKi9gjOtMPu4NXe8H"
      cacheLocation="localstorage"
    >
      <ConvexProvider client={convex}>
        <ConvexLogin />
        <Component {...pageProps} />;
      </ConvexProvider>
    </Auth0Provider>
  );
}
export default MyApp;
