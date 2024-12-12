import { Hono } from "hono";

export default new Hono().get("/", async (c) => {
  return c.json(
    [
      { id: "1", name: "kazmi" },
      { id: "2", name: "izzi" },
    ],
    200,
  );
});
