import { app } from "@repo/hono";

export default {
  port: 8787,
  fetch: app.fetch,
};
