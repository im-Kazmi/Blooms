import { Hono } from "hono";
import { prisma } from "@repo/database";

type Bindings = {
  SECRET_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
