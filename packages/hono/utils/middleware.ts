import { auth } from "@repo/auth/server";
import { createMiddleware } from "hono/factory";

type Env = {
  Variables: {
    user: AuthObject;
  };
};

export const authMiddleware = () => {
  return createMiddleware<Env>(async (c, next) => {
    const user = await auth();

    if (!user || !user.userId) {
      return c.json("UNAUTHORIZED", 400);
    }

    c.set("user", user);

    await next();
  });
};

export type SignedInAuthObject = {
  sessionId: string;
  userId: string;
  orgId: string | undefined;
  orgSlug: string | undefined;
  factorVerificationAge: [number, number] | null;
};

export type SignedOutAuthObject = {
  sessionClaims: null;
  sessionId: null;
  actor: null;
  userId: null;
  orgId: null;
  orgRole: null;
  orgSlug: null;
  orgPermissions: null;
  factorVerificationAge: null;
};

export type AuthObject = SignedInAuthObject | SignedOutAuthObject;
