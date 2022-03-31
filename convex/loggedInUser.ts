import { auth } from "@convex-dev/server";
import { Subject } from "./common";

export default async function loggedInUser(): Promise<Subject | null> {
  const user = await auth.getUserIdentity();
  return user?.tokenIdentifier ?? null;
}
