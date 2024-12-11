import { Hono } from "hono";
import webhooks from "@/routers/webhooks";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { rateLimiter } from "hono-rate-limiter";
import { getIp } from "@/helpers/get-ip";

type Bindings = {
  SECRET_KEY: string;
};

const limiter = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  keyGenerator: async (c) => {
    const ip = getIp(c);
    return ip!;
  },
});

const corsMiddleware = cors({
  origin: "http://localhost:3000",
  allowHeaders: ["*"],
  allowMethods: ["POST", "GET", "OPTIONS", "DELETE", "PUT", "PATCH"],
  maxAge: 600,
  credentials: true,
});

const app = new Hono<{ Bindings: Bindings }>()
  .basePath("/api")
  .use(corsMiddleware)
  .use(logger())
  .use(prettyJSON())
  .use(clerkMiddleware());

const routes = app.route("/webhooks", webhooks);

export type AppType = typeof routes;

export default app;
