import { Hono } from "hono";

// routers
import product from "./routers/product";
import store from "./routers/store";
import webhooks from "./routers/webhooks";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono().basePath("/api").use(prettyJSON());

const routes = app
  .route("/webhooks", webhooks)
  .route("/products", product)
  .route("/stores", store);

export type AppType = typeof routes;

export { app };
export * from "hono/client";
