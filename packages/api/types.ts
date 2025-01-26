import { ClerkClient } from "@clerk/backend";

/** if T1 is undefined, return T2 */
export type Default<T1, T2> = T1 extends undefined ? T2 : T1;

/** T | Promise<T> */
export type MaybePromise<T> = T | Promise<T>;

export type Scope = "default" | "request";

export type ClerkAuth = ReturnType<
  Awaited<ReturnType<ClerkClient["authenticateRequest"]>>["toAuth"]
>;
