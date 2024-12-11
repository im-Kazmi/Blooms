import { Context } from "hono";

export function getIp(c: Context) {
  const ip = c.req.header("x-forwarded-for");
  return ip || "";
}
