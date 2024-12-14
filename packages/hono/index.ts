import { Hono } from "hono";
import webhooks from "@/routers/webhooks";
import { prettyJSON } from "hono/pretty-json";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { corsMiddleware } from "@/utils/cors";
import { customLogger } from "@/utils/custom-logger";

const app = new Hono()
  .basePath("/api")
  .use(corsMiddleware)
  .use(customLogger)
  .use(prettyJSON());

const routes = app.route("/webhooks", webhooks);

export type AppType = typeof routes;

export { app };

export * from "hono";
export * from "hono/client";
