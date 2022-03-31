import { ReactClient } from "@convex-dev/react";
import convexConfig from "./convex.json";
export const convex = new ReactClient(convexConfig.origin);
